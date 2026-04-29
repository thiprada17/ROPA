from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from controllers.formController import (
    ropaDB,
    lookupDB,
    authDB,
    safe_data,
    first_row,
    get_single_lookup_name_by_value,
    get_many_lookup_names_by_values,
    strip_department_prefix,
    calculate_risk_score,
)

_cache = {"data": None, "time": None}
_enriched_cache = {"data": None, "time": None}
TTL_SECONDS = 30


def normalize_status(raw: str) -> str:
    s = str(raw or "").lower()
    if s in ["approved", "complete"]:
        return "Complete"
    if s in ["revision", "rejected"]:
        return "Revision"
    return "Pending"


async def _get_all_activities():
    now = datetime.utcnow()
    if _cache["data"] and (now - _cache["time"]).seconds < TTL_SECONDS:
        return _cache["data"]

    res = ropaDB().table("processing_activities").select(
        "id, owner_name, activity_name, department_id, purpose, "
        "data_type_id, approval_status, submitted_at"
    ).order("submitted_at", desc=True).execute()

    _cache["data"] = safe_data(res, [])
    _cache["time"] = now
    return _cache["data"]


async def _get_enriched_activities():
    now = datetime.utcnow()
    if _enriched_cache["data"] and (now - _enriched_cache["time"]).seconds < TTL_SECONDS:
        return _enriched_cache["data"]

    activities = await _get_all_activities()
    if not activities:
        return []

    ids = [a["id"] for a in activities]

    name_rows = safe_data(
        ropaDB().table("activity_name").select("id, name").execute(), []
    )
    name_map = {str(r["id"]): r["name"] for r in name_rows if r.get("id")}

    cat_rows = safe_data(
        ropaDB().table("activity_data_categories")
        .select("activity_id, data_categories_id")
        .in_("activity_id", ids).execute(), []
    )
    cat_by_activity: dict[str, list] = {}
    for r in cat_rows:
        cat_by_activity.setdefault(r["activity_id"], []).append(r["data_categories_id"])

    legal_rows = safe_data(
        ropaDB().table("activity_legal_bases")
        .select("activity_id, legal_bases_id, basis_type")
        .in_("activity_id", ids).execute(), []
    )
    legal_by_activity: dict[str, list] = {}
    for r in legal_rows:
        legal_by_activity.setdefault(r["activity_id"], []).append(r)

    transfer_rows = safe_data(
        ropaDB().table("international_transfers")
        .select("activity_id, is_transfer, protection_standard")
        .in_("activity_id", ids).execute(), []
    )
    transfer_map = {r["activity_id"]: r for r in transfer_rows}

    retention_rows = safe_data(
        ropaDB().table("retention_policies")
        .select("activity_id, retention_period, storage_method")
        .in_("activity_id", ids).execute(), []
    )
    retention_map = {r["activity_id"]: r for r in retention_rows}

    dept_rows = safe_data(
        ropaDB().table("activity_departments")
        .select("activity_id, department_id")
        .in_("activity_id", ids).execute(), []
    )
    dept_by_activity: dict[str, list] = {}
    for r in dept_rows:
        dept_by_activity.setdefault(r["activity_id"], []).append(r["department_id"])

    department_rows = safe_data(
        authDB().table("departments").select("id, department_name").execute(), []
    )
    department_map = {str(r["id"]): r["department_name"] for r in department_rows if r.get("id")}

    # ── batch lookup ด้วย id→name map โดยตรง ไม่ใช้ zip ──────────────────

    all_data_type_ids = list({str(a["data_type_id"]) for a in activities if a.get("data_type_id")})
    all_cat_ids       = list({str(r["data_categories_id"]) for r in cat_rows if r.get("data_categories_id")})
    all_legal_ids     = list({str(r["legal_bases_id"]) for r in legal_rows if r.get("legal_bases_id")})
    all_access_ids    = list({str(r["department_id"]) for r in dept_rows if r.get("department_id")})

    def build_lookup_id_map(table: str, ids: list[str]) -> dict[str, str]:
        if not ids:
            return {}
        rows = safe_data(
            lookupDB().table(table).select("id, name").in_("id", ids).execute(), []
        )
        return {str(r["id"]): r["name"] for r in rows if r.get("id")}

    data_type_lookup = build_lookup_id_map("data_types",     all_data_type_ids)
    cat_lookup       = build_lookup_id_map("data_categories", all_cat_ids)
    legal_lookup     = build_lookup_id_map("legal_bases",     all_legal_ids)
    access_lookup    = build_lookup_id_map("access_rights",   all_access_ids)

    # ── enrich ───────────────────────────────────────────────────────────────
    enriched = []
    for a in activities:
        aid = a["id"]

        activity_name = name_map.get(str(a.get("activity_name")), "No activity")

        dept_ids = dept_by_activity.get(aid, [])
        parties = [
            strip_department_prefix(access_lookup[str(did)])
            for did in dept_ids
            if access_lookup.get(str(did))
        ]

        owner_department = department_map.get(str(a.get("department_id") or ""), "Unknown")

        data_type_name = data_type_lookup.get(str(a.get("data_type_id") or ""), "")

        cat_ids = cat_by_activity.get(aid, [])
        category_names = [cat_lookup[str(c)] for c in cat_ids if cat_lookup.get(str(c))]

        legal_entries = legal_by_activity.get(aid, [])
        resolved_legal = [
            legal_lookup[str(r["legal_bases_id"])]
            for r in legal_entries
            if legal_lookup.get(str(r.get("legal_bases_id")))
        ]
        primary_legal = [
            legal_lookup[str(r["legal_bases_id"])]
            for r in legal_entries
            if r.get("basis_type") == "primary" and legal_lookup.get(str(r.get("legal_bases_id")))
        ]

        transfer  = transfer_map.get(aid)
        retention = retention_map.get(aid)

        risk = calculate_risk_score(
            data_type_name=data_type_name,
            category_names=category_names,
            legal_names=primary_legal,
            is_transfer=bool(transfer and transfer.get("is_transfer")),
            protection_standard=transfer.get("protection_standard") if transfer else None,
            retention_period=retention.get("retention_period") if retention else "",
            storage_method=retention.get("storage_method") if retention else "",
        )

        enriched.append({
            **a,
            "_activity_name":    activity_name,
            "_parties":          parties,
            "_owner_department": owner_department,
            "_risk":             risk,
            "_primary_legal":    primary_legal,
            "_status":           normalize_status(a.get("approval_status")),
        })

    _enriched_cache["data"] = enriched
    _enriched_cache["time"] = now
    return enriched


async def getDashboardTotal(request: Request):
    try:
        activities = await _get_all_activities()
        total = len(activities)

        now = datetime.utcnow()
        first_this = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        first_last = (first_this - timedelta(days=1)).replace(day=1)

        this_month = sum(
            1 for a in activities
            if a.get("submitted_at") and a["submitted_at"] >= first_this.isoformat()
        )
        last_month = sum(
            1 for a in activities
            if a.get("submitted_at")
            and first_last.isoformat() <= a["submitted_at"] < first_this.isoformat()
        )
        change_percent = (
            round((this_month - last_month) / last_month * 100, 1)
            if last_month else (100.0 if this_month > 0 else 0.0)
        )

        return {"total": total, "newCount": this_month, "changePercent": change_percent}

    except Exception as err:
        print("getDashboardTotal error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardApproval(request: Request):
    try:
        activities = await _get_all_activities()
        total = len(activities)

        approved = sum(
            1 for a in activities
            if normalize_status(a.get("approval_status")) == "Complete"
        )
        growth = round((approved / total) * 100, 1) if total else 0.0

        return {"total": approved, "growth": growth}

    except Exception as err:
        print("getDashboardApproval error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardDonut(request: Request):
    try:
        activities = await _get_enriched_activities()
        counts: dict[str, int] = {}

        for a in activities:
            dept = a["_owner_department"]
            counts[dept] = counts.get(dept, 0) + 1

        total = len(activities)
        series = [
            {"label": dept, "value": count}
            for dept, count in sorted(counts.items(), key=lambda x: -x[1])
        ]

        return {"series": series, "total": total}

    except Exception as err:
        print("getDashboardDonut error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardTrend(request: Request):
    try:
        range_param = request.query_params.get("range", "1W")
        activities = await _get_all_activities()

        now = datetime.utcnow()
        map_count: dict[str, int] = {}
        labels: list[str] = []

        if range_param == "1W":
            labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
            for a in activities:
                raw = a.get("submitted_at") or ""
                if not raw:
                    continue
                try:
                    d = datetime.fromisoformat(raw[:19])
                    key = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d.weekday()]
                    map_count[key] = map_count.get(key, 0) + 1
                except Exception:
                    pass

        elif range_param == "1M":
            if now.month == 12:
                next_month = now.replace(year=now.year + 1, month=1, day=1)
            else:
                next_month = now.replace(month=now.month + 1, day=1)
            days_in_month = (next_month - timedelta(days=1)).day
            labels = [str(i) for i in range(1, days_in_month + 1)]
            for a in activities:
                raw = a.get("submitted_at") or ""
                try:
                    d = datetime.fromisoformat(raw[:19])
                    if d.year == now.year and d.month == now.month:
                        key = str(d.day)
                        map_count[key] = map_count.get(key, 0) + 1
                except Exception:
                    pass

        elif range_param in ("3M", "6M"):
            count = 3 if range_param == "3M" else 6
            base = now.replace(day=1)
            months = []
            for i in range(count - 1, -1, -1):
                month = base.month - i
                year = base.year
                while month <= 0:
                    month += 12
                    year -= 1
                months.append(base.replace(year=year, month=month, day=1))
            labels = [m.strftime("%b") for m in months]
            valid_yms = {m.strftime("%Y-%m") for m in months}
            for a in activities:
                raw = a.get("submitted_at") or ""
                if raw[:7] in valid_yms:
                    try:
                        key = datetime.fromisoformat(raw[:19]).strftime("%b")
                        map_count[key] = map_count.get(key, 0) + 1
                    except Exception:
                        pass

        else:
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            for a in activities:
                raw = a.get("submitted_at") or ""
                try:
                    d = datetime.fromisoformat(raw[:19])
                    if d.year == now.year:
                        key = d.strftime("%b")
                        map_count[key] = map_count.get(key, 0) + 1
                except Exception:
                    pass

        return {"items": [{"day": l, "value": map_count.get(l, 0)} for l in labels]}

    except Exception as err:
        print("getDashboardTrend error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardComparison(request: Request):
    try:
        activities = await _get_enriched_activities()
        dept_map: dict[str, dict] = {}

        for a in activities:
            dept = a["_owner_department"]
            if dept not in dept_map:
                dept_map[dept] = {"name": dept, "critical": 0, "atRisk": 0, "stable": 0, "safe": 0}
            if a["_risk"] == "Critical":
                dept_map[dept]["critical"] += 1
            elif a["_risk"] == "At Risk":
                dept_map[dept]["atRisk"] += 1
            elif a["_risk"] == "Safe":
                dept_map[dept]["safe"] += 1
            else:
                dept_map[dept]["stable"] += 1

        result = sorted(
            dept_map.values(),
            key=lambda x: -(x["critical"] + x["atRisk"] + x["stable"] + x["safe"]),
        )

        return {"departments": result}

    except Exception as err:
        print("getDashboardComparison error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardActivities(request: Request):
    try:
        limit = int(request.query_params.get("limit", 10))
        filter_risk = request.query_params.get("risk", "")

        activities = await _get_enriched_activities()
        items = []

        for a in activities:
            if filter_risk and a["_risk"] != filter_risk:
                continue
            items.append({
                "id": a["id"],
                "activity": a["_activity_name"],
                "parties": a["_parties"],
                "risk": a["_risk"],
                "date": a.get("submitted_at") or "",
            })
            if len(items) >= limit:
                break

        return {"items": items, "total": len(items)}

    except Exception as err:
        print("getDashboardActivities error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardRawList(request: Request):
    try:
        activities = await _get_enriched_activities()

        items = [
            {
                "id": a["id"],
                "activity": a["_activity_name"],
                "parties": a["_parties"],
                "ownerDepartment": a["_owner_department"],
                "risk": a["_risk"],
                "status": a["_status"],
                "legal": {"basis": a["_primary_legal"]},
                "submittedAt": a.get("submitted_at") or "",
            }
            for a in activities
        ]

        department_rows = safe_data(
            authDB().table("departments").select("id, department_name").execute(), []
        )
        departments = [
            {"label": r["department_name"], "value": r["department_name"]}
            for r in department_rows if r.get("department_name")
        ]

        return {"items": items, "departments": departments}

    except Exception as err:
        print("getDashboardRawList error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardSummary(request: Request):
    try:
        return {
            "total": await getDashboardTotal(request),
            "approval": await getDashboardApproval(request),
            "donut": await getDashboardDonut(request),
        }

    except HTTPException:
        raise

    except Exception as err:
        print("getDashboardSummary error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))
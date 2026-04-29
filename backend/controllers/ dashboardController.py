from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from collections import defaultdict
from controllers.formController import (
    ropaDB,
    authDB,
    safe_data,
    first_row,
    get_many_lookup_names_by_values,
    strip_department_prefix,
)


def normalize_status(raw: str) -> str:
    s = str(raw or "").lower()
    if s in ["approved", "complete"]:
        return "Complete"
    if s in ["revision", "rejected"]:
        return "Revision"
    return "Pending"


def map_status_to_risk(raw: str) -> str:
    s = str(raw or "").lower()
    if s in ["approved", "complete"]:
        return "Safe"
    if s in ["revision", "rejected"]:
        return "At Risk"
    return "Stable"


async def _get_all_activities():
    res = ropaDB().table("processing_activities").select(
        "id, owner_name, activity_name, department_id, purpose, "
        "approval_status, submitted_at, updated_at, created_by"
    ).order("submitted_at", desc=True).execute()
    return safe_data(res, [])


async def _resolve_parties(activity_id: str) -> list[str]:
    dept_rows = safe_data(
        ropaDB().table("activity_departments")
        .select("department_id")
        .eq("activity_id", activity_id)
        .execute(),
        [],
    )
    access_names = await get_many_lookup_names_by_values(
        "access_rights",
        [r.get("department_id") for r in dept_rows if r.get("department_id")]
    )
    return [strip_department_prefix(n) for n in access_names]


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

        return {
            "total": total,
            "newCount": this_month,
            "changePercent": change_percent,
        }

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
    STATUS_COLOR = {
        "Complete": "#4CAF50",
        "Pending":  "#FFC107",
        "Revision": "#F44336",
    }
    try:
        activities = await _get_all_activities()
        counts: dict[str, int] = defaultdict(int)
        for a in activities:
            counts[normalize_status(a.get("approval_status"))] += 1

        series = [
            {"label": label, "value": counts[label], "color": STATUS_COLOR[label]}
            for label in ["Complete", "Pending", "Revision"]
        ]
        return {"series": series, "total": len(activities)}

    except Exception as err:
        print("getDashboardDonut error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardTrend(request: Request):
    """
    ?range=1W | 1M | 3M | 6M | 1Y
    Returns: { items: [{ day: str, value: int }] }
    """
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
                    key = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.weekday() % 7]
                    map_count[key] = map_count.get(key, 0) + 1
                except Exception:
                    pass

        elif range_param == "1M":
            days_in_month = (now.replace(month=now.month % 12 + 1, day=1) - timedelta(days=1)).day
            labels = [str(i) for i in range(1, days_in_month + 1)]
            for a in activities:
                raw = a.get("submitted_at") or ""
                if not raw:
                    continue
                try:
                    d = datetime.fromisoformat(raw[:19])
                    if d.year == now.year and d.month == now.month:
                        key = str(d.day)
                        map_count[key] = map_count.get(key, 0) + 1
                except Exception:
                    pass

        elif range_param in ("3M", "6M"):
            count = 3 if range_param == "3M" else 6
            months = []
            for i in range(count - 1, -1, -1):
                d = (now.replace(day=1) - timedelta(days=i * 28)).replace(day=1)
                months.append(d)
            labels = [m.strftime("%b") for m in months]
            valid_yms = {m.strftime("%Y-%m") for m in months}
            for a in activities:
                raw = a.get("submitted_at") or ""
                if raw[:7] in valid_yms:
                    key = datetime.fromisoformat(raw[:19]).strftime("%b")
                    map_count[key] = map_count.get(key, 0) + 1

        else:
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            for a in activities:
                raw = a.get("submitted_at") or ""
                if not raw:
                    continue
                try:
                    d = datetime.fromisoformat(raw[:19])
                    if d.year == now.year:
                        key = d.strftime("%b")
                        map_count[key] = map_count.get(key, 0) + 1
                except Exception:
                    pass

        items = [{"day": label, "value": map_count.get(label, 0)} for label in labels]
        return {"items": items}

    except Exception as err:
        print("getDashboardTrend error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardComparison(request: Request):
    try:
        activities = await _get_all_activities()
        party_map: dict[str, dict] = {}

        for a in activities:
            risk = map_status_to_risk(a.get("approval_status"))
            parties = await _resolve_parties(a["id"])

            for party in parties:
                if party not in party_map:
                    party_map[party] = {"name": party, "atRisk": 0, "critical": 0, "safe": 0, "stable": 0}
                if risk == "At Risk":
                    party_map[party]["atRisk"] += 1
                elif risk == "Critical":
                    party_map[party]["critical"] += 1
                elif risk == "Safe":
                    party_map[party]["safe"] += 1
                else:
                    party_map[party]["stable"] += 1

        result = sorted(
            party_map.values(),
            key=lambda x: -(x["atRisk"] + x["critical"] + x["safe"] + x["stable"])
        )
        return {"departments": result}

    except Exception as err:
        print("getDashboardComparison error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardActivities(request: Request):
    try:
        limit = int(request.query_params.get("limit", 10))
        filter_risk = request.query_params.get("risk", "")

        activities = await _get_all_activities()
        items = []

        for a in activities:
            risk = map_status_to_risk(a.get("approval_status"))
            if filter_risk and risk != filter_risk:
                continue

            name_row = None
            if a.get("activity_name"):
                name_row = first_row(
                    ropaDB().table("activity_name")
                    .select("name")
                    .eq("id", a["activity_name"])
                    .maybe_single()
                    .execute()
                )

            parties = await _resolve_parties(a["id"])

            items.append({
                "id":       a["id"],
                "activity": name_row.get("name") if name_row else "No activity",
                "parties":  parties,
                "risk":     risk,
                "date":     a.get("submitted_at") or "",
            })

            if len(items) >= limit:
                break

        return {"items": items, "total": len(items)}

    except Exception as err:
        print("getDashboardActivities error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardRawList(request: Request):
    """
    Raw list ให้ OverallDonutCard filter client-side ได้
    shape: { items: [{ id, activity, parties, risk, status, legal, submittedAt }] }
    """
    try:
        activities = await _get_all_activities()
        items = []

        for a in activities:
            name_row = None
            if a.get("activity_name"):
                name_row = first_row(
                    ropaDB().table("activity_name")
                    .select("name")
                    .eq("id", a["activity_name"])
                    .maybe_single()
                    .execute()
                )

            parties = await _resolve_parties(a["id"])

            legal_rows = safe_data(
                ropaDB().table("activity_legal_bases")
                .select("legal_bases_id, basis_type")
                .eq("activity_id", a["id"])
                .execute(),
                [],
            )
            primary_names = await get_many_lookup_names_by_values(
                "legal_bases",
                [r.get("legal_bases_id") for r in legal_rows if r.get("basis_type") == "primary"]
            )

            items.append({
                "id":          a["id"],
                "activity":    name_row.get("name") if name_row else "No activity",
                "parties":     parties,
                "risk":        map_status_to_risk(a.get("approval_status")),
                "status":      normalize_status(a.get("approval_status")),
                "legal":       {"basis": primary_names},
                "submittedAt": a.get("submitted_at") or "",
            })

        return {"items": items}

    except Exception as err:
        print("getDashboardRawList error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getDashboardSummary(request: Request):
    try:
        return {
            "total":    await getDashboardTotal(request),
            "approval": await getDashboardApproval(request),
            "donut":    await getDashboardDonut(request),
        }
    except HTTPException:
        raise
    except Exception as err:
        print("getDashboardSummary error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))
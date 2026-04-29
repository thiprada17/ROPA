import asyncio

from fastapi import Request, HTTPException, security
from lib.supabase import supabase
from datetime import datetime
import re


def ropaDB():
    return supabase.schema("ropa")


def lookupDB():
    return supabase.schema("lookup")


def authDB():
    return supabase.schema("auths")


def safe_data(res, default=None):
    if default is None:
        default = []
    if not res or not hasattr(res, "data") or res.data is None:
        return default
    return res.data


def first_row(res):
    data = safe_data(res, [])
    if isinstance(data, list) and len(data) > 0:
        return data[0]
    if isinstance(data, dict):
        return data
    return None


def is_uuid(value):
    return isinstance(value, str) and re.match(
        r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
        value,
        re.I,
    )


def normalize_array(value):
    if not value:
        return []
    if isinstance(value, list):
        return [v for v in value if v]
    return [value]


def join_address(address):
    if isinstance(address, list):
        return "\n".join([str(x).strip() for x in address if str(x).strip()])
    if isinstance(address, str):
        return address.strip()
    return ""


def to_boolean_or_none(value):
    if isinstance(value, bool):
        return value
    if value in ["มีการใช้", "true", "True", "มี"]:
        return True
    if value in ["ไม่มีการใช้", "false", "False", "ไม่มี"]:
        return False
    return None

DEPARTMENT_NAME_MAP = {
    "ฝ่าย IT": "IT",
    "ฝ่ายการตลาด": "Marketing",
    "ฝ่าย HR": "HR",
    "ฝ่ายขาย": "Sales",
    "ฝ่ายประชาสัมพันธ์": "PR",
}
def strip_department_prefix(name: str) -> str:
    return DEPARTMENT_NAME_MAP.get(name, name)

def _parse_retention_days(period: str) -> int:
    if not period:
        return 0
    years  = int(m.group(1)) if (m := re.search(r"(\d+)\s*ปี",    period)) else 0
    months = int(m.group(1)) if (m := re.search(r"(\d+)\s*เดือน", period)) else 0
    days   = int(m.group(1)) if (m := re.search(r"(\d+)\s*วัน",   period)) else 0
    return years * 365 + months * 30 + days


def _parse_retention_to_parts(period: str) -> dict:
    if not period:
        return {"dd": "00", "mm": "00", "yy": "00"}
    yy = m.group(1) if (m := re.search(r"(\d+)\s*ปี", period)) else "00"
    mm = m.group(1) if (m := re.search(r"(\d+)\s*เดือน", period)) else "00"
    dd = m.group(1) if (m := re.search(r"(\d+)\s*วัน", period)) else "00"
    return {"dd": dd, "mm": mm, "yy": yy}


def _score_data(data_type_name: str, category_names: list[str]) -> int:
    if data_type_name == "ข้อมูลอ่อนไหว":
        return 3
    if any("ผู้ติดต่อ" in c for c in category_names):
        return 2
    return 1


def _score_legal(legal_names: list[str]) -> int:
    LEVEL3 = ["Historical", "Research", "Statistics", "Consent"]
    LEVEL2 = ["Vital Interest", "Contract"]
    joined = " ".join(legal_names)
    if any(k in joined for k in LEVEL3):
        return 3
    if any(k in joined for k in LEVEL2):
        return 2
    return 1


def _score_transfer(is_transfer: bool, protection_standard: str | None) -> int:
    if not is_transfer:
        return 1
    if protection_standard:
        return 2
    return 3


def _score_retention(period: str) -> int:
    if not period:
        return 3
    days = _parse_retention_days(period)
    if days < 3 * 365:
        return 1
    if days <= 7 * 365:
        return 2
    return 3


def _score_storage(storage_method: str) -> int:
    if not storage_method:
        return 1
    if "ตู้เอกสาร" in storage_method or "แฟ้ม" in storage_method:
        return 3
    if "สแกน" in storage_method:
        return 2
    return 1


def calculate_risk_score(
    data_type_name: str,
    category_names: list[str],
    legal_names: list[str],
    is_transfer: bool,
    protection_standard: str | None,
    retention_period: str,
    storage_method: str,
) -> str:
    total = (
        _score_data(data_type_name, category_names)
        + _score_legal(legal_names)
        + _score_transfer(is_transfer, protection_standard)
        + _score_retention(retention_period)
        + _score_storage(storage_method)
    )
    if total <= 7:
        return "Safe"
    if total <= 10:
        return "Stable"
    if total <= 12:
        return "At Risk"
    return "Critical"

async def get_single_lookup_id_by_exact_name(table, name):
    if not name:
        return ""
    res = lookupDB().table(table).select("id").eq("name", name).maybe_single().execute()
    row = first_row(res)
    return row.get("id") if row else ""

async def get_many_lookup_ids_by_exact_names(table, names):
    arr = normalize_array(names)
    if not arr:
        return []

    res = lookupDB().table(table).select("id, name").in_("name", arr).execute()
    return [row["id"] for row in safe_data(res, []) if row.get("id")]

async def get_single_lookup_id_by_name(table, value, name_column="name"):
    if not value:
        return None
    if is_uuid(value):
        return value

    res = lookupDB().table(table).select("id").eq(name_column, value).maybe_single().execute()
    row = first_row(res)
    return row.get("id") if row else None


async def get_many_lookup_ids_by_names(table, values, name_column="name"):
    arr = normalize_array(values)
    if not arr:
        return []

    uuid_values = [v for v in arr if is_uuid(v)]
    text_values = [v for v in arr if isinstance(v, str) and not is_uuid(v)]
    ids = list(uuid_values)

    if text_values:
        res = lookupDB().table(table).select("id").in_(name_column, text_values).execute()
        ids += [row["id"] for row in safe_data(res, []) if row.get("id")]

    return list(dict.fromkeys(ids))


async def get_single_lookup_name_by_value(table, value, name_column="name"):
    if not value:
        return None
    if not is_uuid(value):
        return value

    res = lookupDB().table(table).select(name_column).eq("id", value).maybe_single().execute()
    row = first_row(res)
    return row.get(name_column) if row else None


async def get_many_lookup_names_by_values(table, values, name_column="name"):
    arr = normalize_array(values)
    if not arr:
        return []

    uuid_values = [v for v in arr if is_uuid(v)]
    text_values = [v for v in arr if isinstance(v, str) and not is_uuid(v)]
    names = list(text_values)

    if uuid_values:
        res = lookupDB().table(table).select(f"id, {name_column}").in_("id", uuid_values).execute()
        names += [row[name_column] for row in safe_data(res, []) if row.get(name_column)]

    return list(dict.fromkeys(names))


async def get_department_id(value):
    if not value:
        return None
    if is_uuid(value):
        return value

    res = authDB().table("departments").select("id").eq("department_name", value).maybe_single().execute()
    row = first_row(res)
    return row.get("id") if row else None


async def get_user_department_id(user_id):
    if not user_id or not is_uuid(user_id):
        return None

    res = authDB().table("users").select("department_id").eq("id", user_id).maybe_single().execute()
    row = first_row(res)
    return row.get("department_id") if row else None


async def get_activity_name_row(value):
    if not value:
        return None

    if is_uuid(value):
        res = ropaDB().table("activity_name").select("id, name, department_id").eq("id", value).maybe_single().execute()
    else:
        res = ropaDB().table("activity_name").select("id, name, department_id").eq("name", value).maybe_single().execute()

    return first_row(res)


async def resolve_step1_refs(step1, user_id=None):
    activity_row = await get_activity_name_row(step1.get("processActivity"))
    activity_name_id = activity_row.get("id") if activity_row else None

    department_id = await get_user_department_id(user_id)

    if not department_id and activity_row:
        department_id = activity_row.get("department_id")

    return activity_name_id, department_id


async def build_purpose_text(value):
    if not value:
        return ""
    return await get_single_lookup_name_by_value("usage_purposes", value) or value


def build_data_main_type(step2):
    if step2.get("dataClass") == "อื่นๆ":
        return step2.get("otherText", "").strip() or "อื่นๆ"
    return step2.get("dataClass")


def build_retention_period_text(step5):
    dd_val = step5.get("retentionDD")
    mm_val = step5.get("retentionMM")
    yy_val = step5.get("retentionYY")

    has_parts = any([
        yy_val and str(yy_val) != "00",
        mm_val and str(mm_val) != "00",
        dd_val and str(dd_val) != "00",
    ])

    if has_parts:
        yy = f"{yy_val} ปี" if yy_val and str(yy_val) != "00" else ""
        mm = f"{mm_val} เดือน" if mm_val and str(mm_val) != "00" else ""
        dd = f"{dd_val} วัน" if dd_val and str(dd_val) != "00" else ""
        return " ".join([x for x in [yy, mm, dd] if x]) or None

    if isinstance(step5.get("retentionPeriod"), str) and step5.get("retentionPeriod").strip():
        return step5.get("retentionPeriod").strip()

    return None


def extract_selected_security_values(step):
    selected_security = step.get("selectedSecurity")

    if isinstance(selected_security, list):
        return [x for x in selected_security if x]

    if isinstance(selected_security, dict):
        return [label for label, checked in selected_security.items() if checked]

    return []


async def build_security_rows(activity_id, step6):
    print("step6 raw:", step6)
    selected_values = extract_selected_security_values(step6)
    print("selected_values:", selected_values)
    detail_map = step6.get("securityDetails") or {}
    rows = []

    for value in selected_values:
        measure_id = await get_single_lookup_id_by_name("security_measures", value)
        print(f"security lookup: '{value}' → {measure_id}")
        if not measure_id:
            continue

        rows.append({
            "activity_id": activity_id,
            "measures_id": measure_id,
            "detail": detail_map.get(measure_id) or detail_map.get(value),
        })

    return rows


def get_processors_from_step7(step7):
    if isinstance(step7, dict):
        processors = step7.get("processors")
        return processors if isinstance(processors, list) else []
    if isinstance(step7, list):
        return step7
    return []


def validate_submit_payload(step1, step2, step3, step4, step5):
    errors = []

    if not step1.get("dataOwner", "").strip():
        errors.append("step1.dataOwner is required")
    if not step1.get("processActivity"):
        errors.append("step1.processActivity is required")
    if not step1.get("processingPurpose"):
        errors.append("step1.processingPurpose is required")

    if not step2.get("dataClass"):
        errors.append("step2.dataClass is required")
    if step2.get("dataClass") == "อื่นๆ" and not step2.get("otherText", "").strip():
        errors.append("step2.otherText is required when dataClass is อื่นๆ")
    if not normalize_array(step2.get("categories")):
        errors.append("step2.categories is required")
    if not step2.get("dataType"):
        errors.append("step2.dataType is required")
    if not normalize_array(step2.get("methods")):
        errors.append("step2.methods is required")
    if not step2.get("dataSource"):
        errors.append("step2.dataSource is required")

    if not normalize_array(step3.get("primaryBases")):
        errors.append("step3.primaryBases is required")

    minor = step3.get("minorConsent") or {}
    if not minor.get("under10"):
        errors.append("step3.minorConsent.under10 is required")
    if not minor.get("age10to20"):
        errors.append("step3.minorConsent.age10to20 is required")

    if not step4.get("hasTransferAbroad"):
        errors.append("step4.hasTransferAbroad is required")
    if step4.get("hasTransferAbroad") == "มี" and not step4.get("transferCountry"):
        errors.append("step4.transferCountry is required when hasTransferAbroad is มี")
    if not step4.get("isToSubsidiary"):
        errors.append("step4.isToSubsidiary is required")
    if step4.get("isToSubsidiary") == "ใช่" and not step4.get("subsidiaryName", "").strip():
        errors.append("step4.subsidiaryName is required when isToSubsidiary is ใช่")
    if not step4.get("transferMethod"):
        errors.append("step4.transferMethod is required")

    if not build_retention_period_text(step5):
        errors.append("step5.retention period is required")
    if not normalize_array(step5.get("dataType")):
        errors.append("step5.dataType is required")
    if not normalize_array(step5.get("storageMethod")):
        errors.append("step5.storageMethod is required")
    if not normalize_array(step5.get("accessRight")):
        errors.append("step5.accessRight is required")
    if not step5.get("usageStatus"):
        errors.append("step5.usageStatus is required")
    if step5.get("usageStatus") == "มีการใช้" and not step5.get("usagePurpose"):
        errors.append("step5.usagePurpose is required when usageStatus is มีการใช้")

    return errors


async def find_latest_activity_id(owner_name, activity_name_id):
    res = ropaDB().table("processing_activities") \
        .select("id") \
        .eq("owner_name", owner_name) \
        .eq("activity_name", activity_name_id) \
        .order("submitted_at", desc=True) \
        .limit(1) \
        .execute()

    row = first_row(res)
    return row.get("id") if row else None


async def create_processor(processor):
    name = (processor.get("name") or "").strip()
    address = join_address(processor.get("address"))

    if not name:
        return None

    ropaDB().table("processors").insert({
        "name": name,
        "address": address or None,
        "updated_at": datetime.utcnow().isoformat(),
    }).execute()

    res = ropaDB().table("processors") \
        .select("id") \
        .eq("name", name) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    row = first_row(res)
    return row.get("id") if row else None


async def find_latest_activity_processor_id(activity_id, processor_id):
    res = ropaDB().table("activity_processors") \
        .select("id") \
        .eq("activity_id", activity_id) \
        .eq("processor_id", processor_id) \
        .order("id", desc=True) \
        .limit(1) \
        .execute()

    row = first_row(res)
    return row.get("id") if row else None

async def get_owner_access_right_id(owner_department_id):
    if not owner_department_id:
        return None

    dept = first_row(
        authDB().table("departments")
        .select("department_name")
        .eq("id", owner_department_id)
        .maybe_single()
        .execute()
    )

    if not dept:
        return None

    dept_name = dept.get("department_name")
    if not dept_name:
        return None

    access_name_map = {
        "IT": "ฝ่าย IT",
        "HR": "ฝ่าย HR",
        "SALES": "ฝ่ายขาย",
        "SALES": "ฝ่ายขาย",
        "MARKETING": "ฝ่ายการตลาด",
        "PR": "ฝ่ายประชาสัมพันธ์",
    }

    possible_names = [
        dept_name,
        dept_name.upper(),
        dept_name.capitalize(),
        f"ฝ่าย {dept_name}",
        access_name_map.get(dept_name.upper()),
    ]

    possible_names = [name for name in possible_names if name]

    res = (
        lookupDB().table("access_rights")
        .select("id, name")
        .in_("name", possible_names)
        .limit(1)
        .execute()
    )

    row = first_row(res)
    return row.get("id") if row else None


async def insert_activity_departments(activity_id, access_rights, owner_department_id):
    access_rights = normalize_array(access_rights)

    owner_access_right_id = await get_owner_access_right_id(owner_department_id)

    if owner_access_right_id and owner_access_right_id not in access_rights:
        access_rights.append(owner_access_right_id)

    if not access_rights:
        return

    access_ids = await get_many_lookup_ids_by_names(
        "access_rights",
        access_rights
    )

    if not access_ids:
        return

    rows = [
        {
            "activity_id": activity_id,
            "department_id": access_id,
            "access_type": "owner",
        }
        for access_id in access_ids
    ]

    ropaDB().table("activity_departments").insert(rows).execute()

async def insert_minor_consent(activity_id, step3):
    minor = step3.get("minorConsent") or {}

    parts = []
    if minor.get("under10"):
        parts.append(f"under10: {minor.get('under10')}")
    if minor.get("age10to20"):
        parts.append(f"age10to20: {minor.get('age10to20')}")

    if not parts:
        return

    ropaDB().table("minor_consent").insert({
        "activity_id": activity_id,
        "age_range": "mixed",
        "description": " | ".join(parts),
    }).execute()


async def insert_legal_bases(activity_id, step3):
    rows = []

    primary_ids = await get_many_lookup_ids_by_names("legal_bases", step3.get("primaryBases") or [])
    supplementary_ids = await get_many_lookup_ids_by_names("legal_bases", step3.get("supplementaryBases") or [])

    rows += [{"activity_id": activity_id, "legal_bases_id": legal_id, "basis_type": "primary"} for legal_id in primary_ids]
    rows += [{"activity_id": activity_id, "legal_bases_id": legal_id, "basis_type": "supplementary"} for legal_id in supplementary_ids]

    if rows:
        ropaDB().table("activity_legal_bases").insert(rows).execute()


async def insert_step_relations(activity_id, step2, step3, step4, step5, step6, step7, department_id):
    # รอบ 1: lookup ทุกอย่างพร้อมกัน
    (
        category_ids,
        acquisition_ids,
        primary_ids,
        supplementary_ids,
        transfer_method_text,
        protection_standard_text_parts,
        legal_exemptions_text_parts,
        storage_type_text_parts,
        storage_method_text_parts,
        deletion_method_text,
        usage_purpose_text,
        security_rows,
        owner_access_right_id,
    ) = await asyncio.gather(
        get_many_lookup_ids_by_names("data_categories", step2.get("categories")),
        get_many_lookup_ids_by_names("acquisition_method", step2.get("methods")),
        get_many_lookup_ids_by_names("legal_bases", step3.get("primaryBases") or []),
        get_many_lookup_ids_by_names("legal_bases", step3.get("supplementaryBases") or []),
        get_single_lookup_name_by_value("transfer_methods", step4.get("transferMethod")),
        get_many_lookup_names_by_values("protection_standards", step4.get("dataProtectionStandard") or []),
        get_many_lookup_names_by_values("legal_exemptions", step4.get("legalExemption") or []),
        get_many_lookup_names_by_values("retention_storage_types", step5.get("dataType") or []),
        get_many_lookup_names_by_values("retention_storage_methods", step5.get("storageMethod") or []),
        get_single_lookup_name_by_value("deletion_methods", step5.get("destructionMethod")),
        get_single_lookup_name_by_value("usage_purposes", step5.get("usagePurpose")),
        build_security_rows(activity_id, step6),
        get_owner_access_right_id(department_id),
    )

    protection_standard_text = ", ".join(protection_standard_text_parts)
    legal_exemptions_text    = ", ".join(legal_exemptions_text_parts)
    storage_type_text        = ", ".join(storage_type_text_parts)
    storage_method_text      = ", ".join(storage_method_text_parts)

    # เตรียม access_rights
    access_rights = normalize_array(step5.get("accessRight"))
    if owner_access_right_id and owner_access_right_id not in access_rights:
        access_rights.append(owner_access_right_id)
    access_ids = await get_many_lookup_ids_by_names("access_rights", access_rights)

    # รอบ 2: insert ทุกอย่างพร้อมกัน (ที่ไม่ depend กัน)
    minor = step3.get("minorConsent") or {}
    minor_parts = []
    if minor.get("under10"):
        minor_parts.append(f"under10: {minor.get('under10')}")
    if minor.get("age10to20"):
        minor_parts.append(f"age10to20: {minor.get('age10to20')}")

    async def insert_categories():
        if category_ids:
            await asyncio.to_thread(lambda: ropaDB().table("activity_data_categories").insert([
                {"activity_id": activity_id, "data_categories_id": cid}
                for cid in category_ids
            ]).execute())

    async def insert_acquisitions():
        if acquisition_ids:
            await asyncio.to_thread(lambda: ropaDB().table("activity_acquisition").insert([
                {"activity_id": activity_id, "acquisition_method_id": aid}
                for aid in acquisition_ids
            ]).execute())

    async def insert_legal():
        rows = []
        rows += [{"activity_id": activity_id, "legal_bases_id": lid, "basis_type": "primary"} for lid in primary_ids]
        rows += [{"activity_id": activity_id, "legal_bases_id": lid, "basis_type": "supplementary"} for lid in supplementary_ids]
        if rows:
            await asyncio.to_thread(lambda: ropaDB().table("activity_legal_bases").insert(rows).execute())

    async def insert_departments():
        if not access_ids:
            return
        rows = [{"activity_id": activity_id, "department_id": aid, "access_type": "owner"} for aid in access_ids]
        await asyncio.to_thread(lambda: ropaDB().table("activity_departments").insert(rows).execute())

    async def insert_minor():
        if not minor_parts:
            return
        await asyncio.to_thread(lambda: ropaDB().table("minor_consent").insert({
            "activity_id": activity_id,
            "age_range": "mixed",
            "description": " | ".join(minor_parts),
        }).execute())

    async def insert_transfer():
        await asyncio.to_thread(lambda: ropaDB().table("international_transfers").insert({
            "activity_id": activity_id,
            "is_transfer": step4.get("hasTransferAbroad") == "มี",
            "destination_country": step4.get("transferCountry") if step4.get("hasTransferAbroad") == "มี" else None,
            "affiliated_company": step4.get("subsidiaryName") if step4.get("isToSubsidiary") == "ใช่" else None,
            "transfer_method": transfer_method_text,
            "protection_standard": protection_standard_text or None,
            "exceptions": legal_exemptions_text or None,
        }).execute())

    async def insert_retention():
        await asyncio.to_thread(lambda: ropaDB().table("retention_policies").insert({
            "activity_id": activity_id,
            "storage_type": storage_type_text or None,
            "storage_method": storage_method_text or None,
            "retention_period": build_retention_period_text(step5),
            "deletion_method": deletion_method_text,
            "usage_status": to_boolean_or_none(step5.get("usageStatus")),
            "usage_purpose": usage_purpose_text,
            "denial_note": step5.get("refusalNote"),
        }).execute())

    async def insert_security():
        if security_rows:
            await asyncio.to_thread(lambda: ropaDB().table("activity_security").insert(security_rows).execute())

    await asyncio.gather(
        insert_categories(),
        insert_acquisitions(),
        insert_legal(),
        insert_departments(),
        insert_minor(),
        insert_transfer(),
        insert_retention(),
        insert_security(),
    )

    # processors ต้องทำทีละอัน เพราะต้อง insert แล้วค่อย fetch id
    for processor in get_processors_from_step7(step7):
        processor_id = await create_processor(processor)
        if not processor_id:
            continue

        await asyncio.to_thread(lambda: ropaDB().table("activity_processors").insert({
            "activity_id": activity_id,
            "processor_id": processor_id,
            "access_type": processor.get("accessType"),
            "data_category_accessed": processor.get("dataCategoryAccessed"),
            "note": processor.get("note"),
        }).execute())

        activity_processor_id = await find_latest_activity_processor_id(activity_id, processor_id)
        if not activity_processor_id:
            continue

        selected_security = processor.get("securitySelected") or {}
        security_details  = processor.get("securityDetails") or {}

        processor_security_rows = [
            {
                "activity_processor_id": activity_processor_id,
                "type": label,
                "detail": security_details.get(label),
            }
            for label, checked in selected_security.items()
            if checked
        ]

        if processor_security_rows:
            await asyncio.to_thread(lambda: ropaDB().table("processor_security_measures").insert(processor_security_rows).execute())
            
async def get_username(user_id):
    if not user_id or not is_uuid(user_id):
        return user_id or "system"
    res = authDB().table("users").select("username").eq("id", user_id).maybe_single().execute()
    row = first_row(res)
    return row.get("username") if row else "system"

async def getFormOptions(request: Request):
    try:
        (
            activity_names, purposes, data_categories, data_types,
            acquisition_methods, data_sources, legal_bases, deletion_methods,
            transfer_methods, protection_standards, legal_exemptions,
            retention_storage_types, retention_storage_methods,
            access_rights, security_measures, departments,
        ) = await asyncio.gather(
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_name").select("id, name, department_id").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("usage_purposes").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("data_categories").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("data_types").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("acquisition_method").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("data_sources").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("legal_bases").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("deletion_methods").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("transfer_methods").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("protection_standards").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("legal_exemptions").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("retention_storage_types").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("retention_storage_methods").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("access_rights").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(lookupDB().table("security_measures").select("id, name").order("name").execute(), [])),
            asyncio.to_thread(lambda: safe_data(authDB().table("departments").select("id, department_name, description").order("department_name").execute(), [])),
        )

        def option(item):
            return {"id": item["id"], "name": item["name"], "label": item["name"], "value": item["id"]}

        return {
            "activityNames": [
                {
                    "id": item["id"],
                    "name": item["name"],
                    "label": item["name"],
                    "value": item["id"],
                    "department_id": item.get("department_id"),
                }
                for item in activity_names
            ],
            "purposes": [option(item) for item in purposes],
            "usagePurposes": [option(item) for item in purposes],
            "dataCategories": [option(item) for item in data_categories],
            "dataTypes": [option(item) for item in data_types],
            "acquisitionMethods": [option(item) for item in acquisition_methods],
            "dataSources": [option(item) for item in data_sources],
            "legalBases": [option(item) for item in legal_bases],
            "deletionMethods": [option(item) for item in deletion_methods],
            "transferMethods": [option(item) for item in transfer_methods],
            "protectionStandards": [option(item) for item in protection_standards],
            "legalExemptions": [option(item) for item in legal_exemptions],
            "retentionStorageTypes": [option(item) for item in retention_storage_types],
            "retentionStorageMethods": [option(item) for item in retention_storage_methods],
            "accessRights": [option(item) for item in access_rights],
            "securityMeasures": [option(item) for item in security_measures],
            "departments": [
                {
                    "id": item["id"],
                    "name": item["department_name"],
                    "label": item["department_name"],
                    "value": item["id"],
                    "description": item.get("description"),
                }
                for item in departments
            ],
        }

    except Exception as err:
        print("getFormOptions error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def submitForm(request: Request):
    body = await request.json()

    state_user = getattr(request.state, "user", None)
    user_id = state_user.get("userId") if isinstance(state_user, dict) else None
    if not user_id:
        user_id = request.headers.get("x-user-id")

    step1 = body.get("step1") or {}
    step2 = body.get("step2") or {}
    step3 = body.get("step3") or {}
    step4 = body.get("step4") or {}
    step5 = body.get("step5") or {}
    step6 = body.get("step6") or {}
    step7 = body.get("step7") or {}

    try:
        validation_errors = validate_submit_payload(step1, step2, step3, step4, step5)
        if validation_errors:
            raise HTTPException(status_code=400, detail={"error": "Validation failed", "details": validation_errors})

        # lookup ทุกอย่างพร้อมกัน
        (
            (activity_name_id, department_id),
            purpose_text,
            data_type_id,
            source_id,
        ) = await asyncio.gather(
            resolve_step1_refs(step1, user_id),
            build_purpose_text(step1.get("processingPurpose")),
            get_single_lookup_id_by_name("data_types", step2.get("dataType")),
            get_single_lookup_id_by_name("data_sources", step2.get("dataSource")),
        )

        if not activity_name_id:
            raise HTTPException(status_code=400, detail={"error": "Invalid processActivity"})
        if not department_id:
            raise HTTPException(status_code=400, detail={"error": "Cannot resolve department_id"})

        await asyncio.to_thread(lambda: ropaDB().table("processing_activities").insert({
            "owner_name": step1.get("dataOwner"),
            "activity_name": activity_name_id,
            "department_id": department_id,
            "purpose": purpose_text,
            "data_main_type": build_data_main_type(step2),
            "data_type_id": data_type_id,
            "source_id": source_id,
            "description": (step2.get("description") or "").strip() or None,
            "approval_status": "pending",
            "created_by": user_id,
            "submitted_at": datetime.utcnow().isoformat(),
            "updated_by": None,
            "updated_at": None,
        }).execute())

        activity_id = await find_latest_activity_id(step1.get("dataOwner"), activity_name_id)

        if not activity_id:
            raise HTTPException(status_code=500, detail={"error": "Cannot create processing activity"})

        await insert_step_relations(activity_id, step2, step3, step4, step5, step6, step7, department_id)

        return {"message": "Form submitted successfully", "activityId": activity_id}

    except HTTPException:
        raise
    except Exception as err:
        print("submitForm error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))

async def getActivityById(activityId: str):
    try:
        if not is_uuid(activityId):
            raise HTTPException(status_code=400, detail={"error": "Invalid activity id"})

        activity = first_row(
            ropaDB().table("processing_activities")
            .select("*")
            .eq("id", activityId)
            .maybe_single()
            .execute()
        )

        if not activity:
            raise HTTPException(status_code=404, detail={"error": "Activity not found"})

        import asyncio
        (
            activity_name_row,
            department_row,
            categories,
            acquisitions,
            legal_rows,
            department_rows,
            minor_rows,
            transfer_raw,
            retention_raw,
            security,
            processors,
        ) = await asyncio.gather(
            asyncio.to_thread(lambda: first_row(ropaDB().table("activity_name").select("id, name, department_id").eq("id", activity.get("activity_name")).maybe_single().execute())),
            asyncio.to_thread(lambda: first_row(authDB().table("departments").select("id, department_name").eq("id", activity.get("department_id")).maybe_single().execute())),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_data_categories").select("data_categories_id").eq("activity_id", activityId).execute(), [])),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_acquisition").select("acquisition_method_id").eq("activity_id", activityId).execute(), [])),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_legal_bases").select("*").eq("activity_id", activityId).execute(), [])),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_departments").select("department_id").eq("activity_id", activityId).execute(), [])),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("minor_consent").select("*").eq("activity_id", activityId).execute(), [])),
            asyncio.to_thread(lambda: first_row(ropaDB().table("international_transfers").select("*").eq("activity_id", activityId).limit(1).execute())),
            asyncio.to_thread(lambda: first_row(ropaDB().table("retention_policies").select("*").eq("activity_id", activityId).limit(1).execute())),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_security").select("*").eq("activity_id", activityId).execute(), [])),
            asyncio.to_thread(lambda: safe_data(ropaDB().table("activity_processors").select("*, processors (*), processor_security_measures (*)").eq("activity_id", activityId).execute(), [])),
        )
        transfer = transfer_raw   
        retention = retention_raw
        
        minor_consent = {"under10": "", "age10to20": ""}

        for row in minor_rows:
            age_range = row.get("age_range")
            desc = row.get("description") or ""

            if age_range == "under10":
                minor_consent["under10"] = desc

            elif age_range == "age10to20":
                minor_consent["age10to20"] = desc

            elif age_range == "mixed":
                for part in desc.split("|"):
                    part = part.strip()
                    lower = part.lower()

                    if lower.startswith("under10:") or lower.startswith("under_10:"):
                        minor_consent["under10"] = part.split(":", 1)[1].strip()

                    elif lower.startswith("age10to20:") or lower.startswith("10_to_"):
                        minor_consent["age10to20"] = part.split(":", 1)[1].strip()

        purpose_raw = activity.get("purpose") or ""
            
        transfer_method_id = await get_single_lookup_id_by_exact_name(
            "transfer_methods",
            transfer.get("transfer_method") if transfer else ""
        )

        protection_standard_ids = await get_many_lookup_ids_by_exact_names(
            "protection_standards",
            [
                x.strip()
                for x in str(transfer.get("protection_standard") or "").split(",")
                if x.strip()
            ]
            if transfer else []
        )

        legal_exemption_ids = await get_many_lookup_ids_by_exact_names(
            "legal_exemptions",
            [
                x.strip()
                for x in str(transfer.get("exceptions") or "").split(",")
                if x.strip()
            ]
            if transfer else []
        )

        retention_storage_type_ids = await get_many_lookup_ids_by_exact_names(
            "retention_storage_types",
            [
                x.strip()
                for x in str(retention.get("storage_type") or "").split(",")
                if x.strip()
            ]
            if retention else []
        )

        retention_storage_method_ids = await get_many_lookup_ids_by_exact_names(
            "retention_storage_methods",
            [
                x.strip()
                for x in str(retention.get("storage_method") or "").split(",")
                if x.strip()
            ]
            if retention else []
        )

        deletion_method_id = await get_single_lookup_id_by_exact_name(
            "deletion_methods",
            retention.get("deletion_method") if retention else ""
        )

        usage_purpose_id = await get_single_lookup_id_by_exact_name(
            "usage_purposes",
            retention.get("usage_purpose") if retention else ""
        )

        measure_ids = [
            row.get("measures_id")
            for row in security
            if row.get("measures_id")
        ]

        measure_map = {}

        if measure_ids:
            measure_rows = safe_data(
                lookupDB().table("security_measures")
                .select("id, name")
                .in_("id", measure_ids)
                .execute(),
                [],
            )

            measure_map = {
                row["id"]: row["name"]
                for row in measure_rows
                if row.get("id")
            }

        security_with_names = [
            {
                **row,
                "name": measure_map.get(row.get("measures_id"), ""),
            }
            for row in security
        ]

        category_ids = [
            row.get("data_categories_id")
            for row in categories
            if row.get("data_categories_id")
        ]

        method_ids = [
            row.get("acquisition_method_id")
            for row in acquisitions
            if row.get("acquisition_method_id")
        ]

        retention_period_str = retention.get("retention_period") if retention else ""
        retention_parts = _parse_retention_to_parts(retention_period_str)

        data_main_type = activity.get("data_main_type") or ""
        default_data_classes = [
            "ข้อมูลผู้สมัครงาน",
            "ข้อมูลบุคลากรใหม่",
            "ข้อมูลบุคลากร",
        ]

        if data_main_type in default_data_classes:
            step2_data_class = data_main_type
            step2_other_text = ""
        else:
            step2_data_class = "อื่นๆ" if data_main_type else ""
            step2_other_text = data_main_type

        step7_processors = [
            {
                "id": p.get("id") or p.get("processor_id"),
                "processorId": p.get("processor_id"),
                "name": p["processors"]["name"] if p.get("processors") else "",
                "address": p["processors"]["address"] if p.get("processors") else "",
                "accessType": p.get("access_type"),
                "dataCategoryAccessed": p.get("data_category_accessed"),
                "note": p.get("note"),
                "securitySelected": {
                    s["type"]: True
                    for s in p.get("processor_security_measures", [])
                },
                "securityDetails": {
                    s["type"]: s.get("detail") or ""
                    for s in p.get("processor_security_measures", [])
                }
            }
            for p in processors
        ]

        return {
            "id": activityId,

            "step1": {
                "dataOwner": activity.get("owner_name") or "",
                "processActivity": activity.get("activity_name") or "",
                "processActivityName": activity_name_row.get("name") if activity_name_row else "",
                "processingPurpose": purpose_raw,
                "departmentId": activity.get("department_id") or "",
                "departmentName": department_row.get("department_name") if department_row else "",
            },

            "step2": {
                "dataClass": step2_data_class,
                "otherText": step2_other_text,
                "description": activity.get("description") or "",
                "categories": category_ids,
                "dataType": activity.get("data_type_id") or "",
                "methods": method_ids,
                "dataSource": activity.get("source_id") or "",
            },

            "step3": {
                "primaryBases": [
                    row.get("legal_bases_id")
                    for row in legal_rows
                    if row.get("basis_type") == "primary" and row.get("legal_bases_id")
                ],
                "supplementaryBases": [
                    row.get("legal_bases_id")
                    for row in legal_rows
                    if row.get("basis_type") == "supplementary" and row.get("legal_bases_id")
                ],
                "minorConsent": minor_consent,
            },

            "step4": {
                "hasTransferAbroad": "มี" if transfer and transfer.get("is_transfer") else "ไม่มี",
                "transferCountry": transfer.get("destination_country") if transfer else "",
                "isToSubsidiary": "ใช่" if transfer and transfer.get("affiliated_company") else "ไม่ใช่",
                "subsidiaryName": transfer.get("affiliated_company") if transfer else "",
                "transferMethod": transfer_method_id or "",
                "dataProtectionStandard": protection_standard_ids,
                "legalExemption": legal_exemption_ids,
            },

            "step5": {
                "dataType": retention_storage_type_ids,
                "storageMethod": retention_storage_method_ids,
                "retentionPeriod": retention_period_str,
                "retentionDD": retention_parts["dd"],
                "retentionMM": retention_parts["mm"],
                "retentionYY": retention_parts["yy"],
                "accessRight": [
                    row.get("department_id")
                    for row in department_rows
                    if row.get("department_id")
                ],
                "destructionMethod": deletion_method_id or "",
                "usageStatus": (
                    "มีการใช้" if retention and retention.get("usage_status") is True
                    else "ไม่มีการใช้" if retention and retention.get("usage_status") is False
                    else ""
                ),
                "usagePurpose": usage_purpose_id or "",
                "refusalNote": retention.get("denial_note") if retention else "",
            },

            "security": security_with_names,

            "step6": {
                "selectedSecurity": {
                    row.get("name"): True
                    for row in security_with_names
                    if row.get("name")
                },
                "securityDetails": {
                    row.get("name"): row.get("detail") or ""
                    for row in security_with_names
                    if row.get("name")
                },
            },

            "step7": {
                "processors": step7_processors,
            },
        }

    except HTTPException:
        raise
    except Exception as err:
        print("getActivityById error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))

async def updateForm(activityId: str, request: Request):
    body = await request.json()

    state_user = getattr(request.state, "user", None)
    user_id = state_user.get("userId") if isinstance(state_user, dict) else None
    if not user_id:
        user_id = request.headers.get("x-user-id")

    step1 = body.get("step1") or {}
    step2 = body.get("step2") or {}
    step3 = body.get("step3") or {}
    step4 = body.get("step4") or {}
    step5 = body.get("step5") or {}
    step6 = body.get("step6") or {}
    step7 = body.get("step7") or {}
    
    print("EDIT activityId:", activityId)
    print("EDIT user_id:", user_id)
    print("EDIT step1:", step1)
    print("EDIT step2:", step2)
    print("EDIT step3:", step3)
    print("EDIT step4:", step4)
    print("EDIT step5:", step5)
    print("EDIT step6:", step6)
    print("EDIT step7:", step7)

    try:
        if not is_uuid(activityId):
            raise HTTPException(status_code=400, detail={"error": "Invalid activity id"})

        old_activity = first_row(
            ropaDB().table("processing_activities")
            .select("id, created_by")
            .eq("id", activityId)
            .maybe_single()
            .execute()
        )
        if not old_activity:
            raise HTTPException(status_code=404, detail={"error": "Activity not found"})
        
        if not user_id:
            user_id = old_activity.get("created_by")

        print("UPDATE activityId:", activityId)
        print("UPDATE step1:", step1)
        print("UPDATE step2:", step2)

        validation_errors = validate_submit_payload(step1, step2, step3, step4, step5)
        if validation_errors:
            raise HTTPException(
                status_code=400,
                detail={"error": "Validation failed", "details": validation_errors},
            )

        activity_name_id, department_id = await resolve_step1_refs(step1, user_id)
        purpose_text = await build_purpose_text(step1.get("processingPurpose"))

        if not activity_name_id:
            raise HTTPException(status_code=400, detail={"error": "Invalid processActivity"})

        if not department_id:
            raise HTTPException(status_code=400, detail={"error": "Cannot resolve department_id"})

        data_type_id = await get_single_lookup_id_by_name("data_types", step2.get("dataType"))
        source_id = await get_single_lookup_id_by_name("data_sources", step2.get("dataSource"))

        if not data_type_id:
            raise HTTPException(status_code=400, detail={"error": "Invalid step2.dataType"})

        if not source_id:
            raise HTTPException(status_code=400, detail={"error": "Invalid step2.dataSource"})

        update_res = (
            ropaDB().table("processing_activities")
            .update({
                "owner_name": step1.get("dataOwner"),
                "activity_name": activity_name_id,
                "department_id": department_id,
                "purpose": purpose_text,
                "data_main_type": build_data_main_type(step2),
                "data_type_id": data_type_id,
                "source_id": source_id,
                "description": (step2.get("description") or "").strip() or None,
                "approval_status": "pending",
                "updated_by": user_id,
                "updated_at": datetime.utcnow().isoformat(),
            })
            .eq("id", activityId)
            .execute()
        )

        print("EDIT update_res.data:", update_res.data)

        # ลบลูกตารางก่อน insert ใหม่
        old_processors_res = (
            ropaDB().table("activity_processors")
            .select("id, processor_id")
            .eq("activity_id", activityId)
            .execute()
        )
        old_processors = safe_data(old_processors_res, [])

        activity_processor_ids = [
            row["id"] for row in old_processors if row.get("id")
        ]
        processor_ids = [
            row["processor_id"] for row in old_processors if row.get("processor_id")
        ]

        if activity_processor_ids:
            ropaDB().table("processor_security_measures") \
                .delete() \
                .in_("activity_processor_id", activity_processor_ids) \
                .execute()

            ropaDB().table("activity_processors") \
                .delete() \
                .in_("id", activity_processor_ids) \
                .execute()

        for table in [
            "activity_data_categories",
            "activity_acquisition",
            "activity_legal_bases",
            "activity_departments",
            "minor_consent",
            "international_transfers",
            "retention_policies",
            "activity_security",
        ]:
            ropaDB().table(table).delete().eq("activity_id", activityId).execute()

        if processor_ids:
            ropaDB().table("processors") \
                .delete() \
                .in_("id", processor_ids) \
                .execute()

        await insert_step_relations(
            activityId,
            step2,
            step3,
            step4,
            step5,
            step6,
            step7,
            department_id,
        )

        return {
            "message": "Form updated successfully",
            "activityId": activityId,
        }

    except HTTPException:
        raise
    except Exception as err:
        print("updateForm error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))

async def deleteForm(activityId: str):
    try:
        if not is_uuid(activityId):
            raise HTTPException(status_code=400, detail={"error": "Invalid activity id"})

        old_processors = safe_data(
            ropaDB().table("activity_processors")
            .select("id, processor_id")
            .eq("activity_id", activityId)
            .execute(),
            []
        )

        activity_processor_ids = [r["id"] for r in old_processors if r.get("id")]
        processor_ids = [r["processor_id"] for r in old_processors if r.get("processor_id")]

        if activity_processor_ids:
            ropaDB().table("processor_security_measures") \
                .delete() \
                .in_("activity_processor_id", activity_processor_ids) \
                .execute()

            ropaDB().table("activity_processors") \
                .delete() \
                .in_("id", activity_processor_ids) \
                .execute()

        for table in [
            "activity_data_categories",
            "activity_acquisition",
            "activity_legal_bases",
            "activity_departments",
            "minor_consent",
            "international_transfers",
            "retention_policies",
            "activity_security",
        ]:
            ropaDB().table(table).delete().eq("activity_id", activityId).execute()

        ropaDB().table("processing_activities") \
            .delete() \
            .eq("id", activityId) \
            .execute()

        if processor_ids:
            ropaDB().table("processors") \
                .delete() \
                .in_("id", processor_ids) \
                .execute()

        return {"message": "Form deleted successfully", "activityId": activityId}

    except HTTPException:
        raise
    except Exception as err:
        print("deleteForm error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))

async def getRopaList(request: Request):
    try:
        def unique_values(values):
            seen = set()
            result = []
            for value in values:
                if value and value not in seen:
                    seen.add(value)
                    result.append(value)
            return result

        def group_rows_by(rows, key):
            grouped = {}
            for row in rows:
                group_key = row.get(key)
                if not group_key:
                    continue
                grouped.setdefault(group_key, []).append(row)
            return grouped

        def map_rows_by_id(rows, id_key="id", value_key="name"):
            return {
                row[id_key]: row.get(value_key)
                for row in rows
                if row.get(id_key)
            }

        def names_from_ids(ids, name_map):
            names = []
            seen = set()
            for item_id in ids:
                name = name_map.get(item_id)
                if name and name not in seen:
                    seen.add(name)
                    names.append(name)
            return names

        def parse_minor_consent(minor_rows):
            minor_consent = {"under10": "", "age10to20": ""}
            for row in minor_rows:
                age_range = row.get("age_range")
                desc = row.get("description") or ""
                if age_range == "under10":
                    minor_consent["under10"] = desc
                elif age_range == "age10to20":
                    minor_consent["age10to20"] = desc
                elif age_range == "mixed":
                    for part in desc.split("|"):
                        part = part.strip()
                        lower_part = part.lower()
                        if lower_part.startswith("under10:") or lower_part.startswith("under_10:"):
                            minor_consent["under10"] = part.split(":", 1)[1].strip()
                        elif lower_part.startswith("age10to20:") or lower_part.startswith("10_to_"):
                            minor_consent["age10to20"] = part.split(":", 1)[1].strip()
            return minor_consent

        def username_from_id(user_id, user_map):
            return user_map.get(user_id, user_id or "system")

        page = request.query_params.get("page")
        page_size = request.query_params.get("pageSize")

        query = ropaDB().table("processing_activities").select("""
            id,
            owner_name,
            activity_name,
            department_id,
            purpose,
            description,
            data_main_type,
            other_text,
            data_type_id,
            source_id,
            approval_status,
            submitted_at,
            updated_at,
            created_by,
            updated_by
        """).order("submitted_at", desc=True)

        if page or page_size:
            page = int(page or 1)
            page_size = int(page_size or 20)
            page = max(page, 1)
            page_size = max(1, min(page_size, 100))
            start = (page - 1) * page_size
            end = start + page_size - 1
            query = query.range(start, end)

        activities_res = query.execute()
        activities = safe_data(activities_res, [])

        if not activities:
            return []

        activity_ids      = unique_values([a.get("id")            for a in activities])
        activity_name_ids = unique_values([a.get("activity_name") for a in activities])
        department_ids    = unique_values([a.get("department_id") for a in activities])
        data_type_ids     = unique_values([a.get("data_type_id")  for a in activities])
        source_ids        = unique_values([a.get("source_id")     for a in activities])

        async def fetch_if(condition, fn):
            return await asyncio.to_thread(fn) if condition else []

        # รอบ 1: ดึงทุกตารางพร้อมกัน (13 queries)
        (
            _activity_names,
            _departments,
            _data_types,
            _sources,
            _retentions,
            _transfers,
            _legal_rows,
            _access_rows,
            _category_rows,
            _acquisition_rows,
            _minor_rows,
            _security_rows,
            _processor_rows,
        ) = await asyncio.gather(
            fetch_if(activity_name_ids, lambda: safe_data(ropaDB().table("activity_name").select("id, name").in_("id", activity_name_ids).execute(), [])),
            fetch_if(department_ids,    lambda: safe_data(authDB().table("departments").select("id, department_name").in_("id", department_ids).execute(), [])),
            fetch_if(data_type_ids,     lambda: safe_data(lookupDB().table("data_types").select("id, name").in_("id", data_type_ids).execute(), [])),
            fetch_if(source_ids,        lambda: safe_data(lookupDB().table("data_sources").select("id, name").in_("id", source_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("retention_policies").select("*").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("international_transfers").select("*").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("activity_legal_bases").select("*").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("activity_departments").select("activity_id, department_id").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("activity_data_categories").select("activity_id, data_categories_id").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("activity_acquisition").select("activity_id, acquisition_method_id").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("minor_consent").select("*").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("activity_security").select("*").in_("activity_id", activity_ids).execute(), [])),
            fetch_if(activity_ids,      lambda: safe_data(ropaDB().table("activity_processors").select("*, processors (*), processor_security_measures (*)").in_("activity_id", activity_ids).execute(), [])),
        )

        activity_name_map = map_rows_by_id(_activity_names, "id", "name")
        department_map    = map_rows_by_id(_departments, "id", "department_name")
        data_type_map     = map_rows_by_id(_data_types, "id", "name")
        source_map        = map_rows_by_id(_sources, "id", "name")

        retention_map = {r["activity_id"]: r for r in _retentions if r.get("activity_id")}
        transfer_map  = {r["activity_id"]: r for r in _transfers  if r.get("activity_id")}

        legal_rows_map       = group_rows_by(_legal_rows,       "activity_id")
        access_rows_map      = group_rows_by(_access_rows,      "activity_id")
        category_rows_map    = group_rows_by(_category_rows,    "activity_id")
        acquisition_rows_map = group_rows_by(_acquisition_rows, "activity_id")
        minor_rows_map       = group_rows_by(_minor_rows,       "activity_id")
        security_rows_map    = group_rows_by(_security_rows,    "activity_id")
        processor_rows_map   = group_rows_by(_processor_rows,   "activity_id")

        all_legal_basis_ids  = unique_values([r.get("legal_bases_id")        for r in _legal_rows        if r.get("legal_bases_id")])
        all_access_right_ids = unique_values([r.get("department_id")         for r in _access_rows       if r.get("department_id")])
        all_category_ids     = unique_values([r.get("data_categories_id")    for r in _category_rows     if r.get("data_categories_id")])
        all_acquisition_ids  = unique_values([r.get("acquisition_method_id") for r in _acquisition_rows  if r.get("acquisition_method_id")])
        all_measure_ids      = unique_values([r.get("measures_id")           for r in _security_rows     if r.get("measures_id")])

        # รอบ 2: ดึง lookup names พร้อมกัน (5 queries)
        (
            _legal_bases_data,
            _access_rights_data,
            _categories_data,
            _acquisitions_data,
            _measures_data,
        ) = await asyncio.gather(
            fetch_if(all_legal_basis_ids,  lambda: safe_data(lookupDB().table("legal_bases").select("id, name").in_("id", all_legal_basis_ids).execute(), [])),
            fetch_if(all_access_right_ids, lambda: safe_data(lookupDB().table("access_rights").select("id, name").in_("id", all_access_right_ids).execute(), [])),
            fetch_if(all_category_ids,     lambda: safe_data(lookupDB().table("data_categories").select("id, name").in_("id", all_category_ids).execute(), [])),
            fetch_if(all_acquisition_ids,  lambda: safe_data(lookupDB().table("acquisition_method").select("id, name").in_("id", all_acquisition_ids).execute(), [])),
            fetch_if(all_measure_ids,      lambda: safe_data(lookupDB().table("security_measures").select("id, name").in_("id", all_measure_ids).execute(), [])),
        )

        legal_basis_map  = map_rows_by_id(_legal_bases_data,   "id", "name")
        access_right_map = map_rows_by_id(_access_rights_data, "id", "name")
        category_map     = map_rows_by_id(_categories_data,    "id", "name")
        acquisition_map  = map_rows_by_id(_acquisitions_data,  "id", "name")
        measure_map      = map_rows_by_id(_measures_data,      "id", "name")

        result = []

        for activity in activities:
            activity_id = activity.get("id")

            activity_name   = activity_name_map.get(activity.get("activity_name"), "-")
            department_name = department_map.get(activity.get("department_id"), "-")

            retention      = retention_map.get(activity_id)
            transfer       = transfer_map.get(activity_id)
            legal_rows     = legal_rows_map.get(activity_id, [])
            minor_rows     = minor_rows_map.get(activity_id, [])
            security_rows  = security_rows_map.get(activity_id, [])
            processor_rows = processor_rows_map.get(activity_id, [])

            status_raw = str(activity.get("approval_status") or "").lower()
            if status_raw in ["approved", "complete"]:
                status = "Complete"
            elif status_raw in ["revision", "rejected"]:
                status = "Revision"
            else:
                status = "Pending"

            primary_ids = [
                row.get("legal_bases_id")
                for row in legal_rows
                if row.get("basis_type") == "primary" and row.get("legal_bases_id")
            ]
            supplementary_ids = [
                row.get("legal_bases_id")
                for row in legal_rows
                if row.get("basis_type") == "supplementary" and row.get("legal_bases_id")
            ]

            legal_names        = names_from_ids(primary_ids, legal_basis_map)
            supplementary_names = names_from_ids(supplementary_ids, legal_basis_map)
            minor_consent      = parse_minor_consent(minor_rows)

            access_ids   = [row.get("department_id") for row in access_rows_map.get(activity_id, []) if row.get("department_id")]
            access_names = names_from_ids(access_ids, access_right_map)
            access_names = [strip_department_prefix(name) for name in access_names]

            category_ids   = [row.get("data_categories_id") for row in category_rows_map.get(activity_id, []) if row.get("data_categories_id")]
            category_names = names_from_ids(category_ids, category_map)

            acquisition_ids   = [row.get("acquisition_method_id") for row in acquisition_rows_map.get(activity_id, []) if row.get("acquisition_method_id")]
            acquisition_names = names_from_ids(acquisition_ids, acquisition_map)

            data_type_name = data_type_map.get(activity.get("data_type_id"), "") or ""
            source_name    = source_map.get(activity.get("source_id"), "") or ""

            security_with_names = [
                {**row, "name": measure_map.get(row.get("measures_id"), "")}
                for row in security_rows
            ]

            created_by_display = activity.get("created_by") or "system"
            updated_by_display = activity.get("updated_by") or activity.get("created_by") or "system"

            history = []
            if activity.get("updated_at"):
                history.append({
                    "action": "edit",
                    "by": updated_by_display,
                    "date": activity.get("updated_at") or "-",
                    "time": activity.get("updated_at") or "-",
                })
            history.append({
                "action": "create",
                "by": created_by_display,
                "date": activity.get("submitted_at") or "-",
                "time": activity.get("submitted_at") or "-",
            })

            storage_type_values = (
                [x.strip() for x in str(retention.get("storage_type") or "").split(",") if x.strip()]
                if retention else []
            )
            storage_method_values = (
                [x.strip() for x in str(retention.get("storage_method") or "").split(",") if x.strip()]
                if retention else []
            )
            transfer_exceptions = (
                [x.strip() for x in str(transfer.get("exceptions") or "").split(",") if x.strip()]
                if transfer else []
            )

            processor_display_rows = [
                {
                    "id": p.get("id") or p.get("processor_id"),
                    "processorId": p.get("processor_id"),
                    "name": p["processors"]["name"] if p.get("processors") else "",
                    "address": p["processors"]["address"] if p.get("processors") else "",
                    "accessType": p.get("access_type"),
                    "dataCategoryAccessed": p.get("data_category_accessed"),
                    "note": p.get("note"),
                    "securitySelected": {s["type"]: True for s in p.get("processor_security_measures", [])},
                    "securityDetails": {s["type"]: s.get("detail") or "" for s in p.get("processor_security_measures", [])},
                    "securityMeasures": p.get("processor_security_measures", []),
                }
                for p in processor_rows
            ]

            result.append({
                "id": activity_id,
                "activity": activity_name,
                "purpose": activity.get("purpose") or "-",
                "purposeDetail": activity.get("purpose") or "-",
                "dataOwner": activity.get("owner_name") or "-",
                "dataClass": activity.get("data_main_type") or "-",
                "otherText": activity.get("other_text") or "",
                "description": activity.get("description") or "",
                "dataDescription": activity.get("description") or "",
                "dataCategories": category_names,
                "categories": category_names,
                "dataType": data_type_name or "-",
                "acquisitionMethods": acquisition_names,
                "methods": acquisition_names,
                "dataSource": source_name or "-",
                "parties": access_names,
                "step1": {
                    "dataOwner": activity.get("owner_name") or "",
                    "processActivity": activity.get("activity_name") or "",
                    "processActivityName": activity_name,
                    "processingPurpose": activity.get("purpose") or "",
                    "departmentId": activity.get("department_id") or "",
                    "departmentName": department_name,
                },
                "step2": {
                    "dataClass": activity.get("data_main_type") or "-",
                    "otherText": activity.get("other_text") or "",
                    "description": activity.get("description") or "",
                    "dataDescription": activity.get("description") or "",
                    "categories": category_names,
                    "dataCategories": category_names,
                    "dataType": data_type_name or "-",
                    "methods": acquisition_names,
                    "acquisitionMethods": acquisition_names,
                    "dataSource": source_name or "-",
                },
                "legal": {
                    "basis": legal_names,
                    "secondaryCategory": supplementary_names,
                    "minorConsent": minor_consent,
                },
                "step3": {
                    "primaryBases": legal_names,
                    "supplementaryBases": supplementary_names,
                    "minorConsent": minor_consent,
                },
                "transfer": {
                    "is_transfer": transfer.get("is_transfer") if transfer else None,
                    "destination_country": transfer.get("destination_country") if transfer else None,
                    "affiliated_company": transfer.get("affiliated_company") if transfer else None,
                    "transfer_method": transfer.get("transfer_method") if transfer else None,
                    "protection_standard": transfer.get("protection_standard") if transfer else None,
                    "exceptions": transfer_exceptions,
                },
                "step4": {
                    "hasTransferAbroad": ("มี" if transfer and transfer.get("is_transfer") else "ไม่มี" if transfer else ""),
                    "transferCountry": transfer.get("destination_country") if transfer else "",
                    "isToSubsidiary": ("ใช่" if transfer and transfer.get("affiliated_company") else "ไม่ใช่" if transfer else ""),
                    "subsidiaryName": transfer.get("affiliated_company") if transfer else "",
                    "transferMethod": transfer.get("transfer_method") if transfer else "",
                    "dataProtectionStandard": (
                        [x.strip() for x in str(transfer.get("protection_standard") or "").split(",") if x.strip()]
                        if transfer else []
                    ),
                    "legalExemption": transfer_exceptions,
                },
                "retention": {
                    "storageType": storage_type_values,
                    "storageMethod": storage_method_values,
                    "retentionPeriod": retention.get("retention_period") if retention else "-",
                    "department": [department_name] if department_name != "-" else [],
                    "accessRight": access_names,
                    "deletionMethod": retention.get("deletion_method") if retention else "",
                    "usage_purpose": (
                        [retention.get("usage_purpose")]
                        if retention and retention.get("usage_purpose") else []
                    ),
                    "denialNote": retention.get("denial_note") if retention else None,
                },
                "step5": {
                    "dataType": storage_type_values,
                    "storageMethod": storage_method_values,
                    "retentionPeriod": retention.get("retention_period") if retention else "-",
                    "accessRight": access_names,
                    "destructionMethod": retention.get("deletion_method") if retention else "",
                    "usageStatus": (
                        "มีการใช้" if retention and retention.get("usage_status") is True
                        else "ไม่มีการใช้" if retention and retention.get("usage_status") is False
                        else ""
                    ),
                    "usagePurpose": retention.get("usage_purpose") if retention else "",
                    "refusalNote": retention.get("denial_note") if retention else "",
                },
                "security": security_with_names,
                "step6": {
                    "selectedSecurity": {row.get("name"): True for row in security_with_names if row.get("name")},
                    "securityDetails": {row.get("name"): row.get("detail") or "" for row in security_with_names if row.get("name")},
                },
                "processors": processor_display_rows,
                "step7": {
                    "processors": processor_display_rows,
                },
                "risk": calculate_risk_score(
                    data_type_name=data_type_name,
                    category_names=category_names,
                    legal_names=legal_names,
                    is_transfer=transfer.get("is_transfer") if transfer else False,
                    protection_standard=transfer.get("protection_standard") if transfer else None,
                    retention_period=retention.get("retention_period") if retention else "",
                    storage_method=retention.get("storage_method") if retention else "",
                ),
                "status": status,
                "history": history,
            })

        return result

    except Exception as err:
        print("getRopaList error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))
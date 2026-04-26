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

    department_id = await get_department_id(step1.get("departmentId") or step1.get("department"))

    if not department_id and activity_row:
        department_id = activity_row.get("department_id")

    if not department_id:
        department_id = await get_user_department_id(user_id)

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
    if isinstance(step5.get("retentionPeriod"), str) and step5.get("retentionPeriod").strip():
        return step5.get("retentionPeriod").strip()

    dd_val = step5.get("retentionDD")
    mm_val = step5.get("retentionMM")
    yy_val = step5.get("retentionYY")

    dd = f"{dd_val} วัน" if dd_val and dd_val != "00" else ""
    mm = f"{mm_val} เดือน" if mm_val and mm_val != "00" else ""
    yy = f"{yy_val} ปี" if yy_val and yy_val != "00" else ""

    return " ".join([x for x in [yy, mm, dd] if x]) or None


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


async def insert_activity_departments(activity_id, access_rights):
    if not access_rights:
        return
    print("access_rights input:", access_rights)

    # แปลงชื่อ → id จาก lookup.access_rights
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
            "access_type": "owner"
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
    category_ids = await get_many_lookup_ids_by_names("data_categories", step2.get("categories"))
    if category_ids:
        ropaDB().table("activity_data_categories").insert([
            {"activity_id": activity_id, "data_categories_id": cid}
            for cid in category_ids
        ]).execute()

    acquisition_ids = await get_many_lookup_ids_by_names("acquisition_method", step2.get("methods"))
    if acquisition_ids:
        ropaDB().table("activity_acquisition").insert([
            {"activity_id": activity_id, "acquisition_method_id": aid}
            for aid in acquisition_ids
        ]).execute()

    await insert_legal_bases(activity_id, step3)

    await insert_activity_departments(
    activity_id,
    step5.get("accessRight")
    )

    await insert_minor_consent(activity_id, step3)

    transfer_method_text = await get_single_lookup_name_by_value("transfer_methods", step4.get("transferMethod"))
    protection_standard_text = ", ".join(
        await get_many_lookup_names_by_values("protection_standards", step4.get("dataProtectionStandard") or [])
    )
    legal_exemptions_text = ", ".join(
        await get_many_lookup_names_by_values("legal_exemptions", step4.get("legalExemption") or [])
    )

    ropaDB().table("international_transfers").insert({
        "activity_id": activity_id,
        "is_transfer": step4.get("hasTransferAbroad") == "มี",
        "destination_country": step4.get("transferCountry") if step4.get("hasTransferAbroad") == "มี" else None,
        "affiliated_company": step4.get("subsidiaryName") if step4.get("isToSubsidiary") == "ใช่" else None,
        "transfer_method": transfer_method_text,
        "protection_standard": protection_standard_text or None,
        "exceptions": legal_exemptions_text or None,
    }).execute()

    storage_type_text = ", ".join(
        await get_many_lookup_names_by_values("retention_storage_types", step5.get("dataType") or [])
    )
    storage_method_text = ", ".join(
        await get_many_lookup_names_by_values("retention_storage_methods", step5.get("storageMethod") or [])
    )
    deletion_method_text = await get_single_lookup_name_by_value("deletion_methods", step5.get("destructionMethod"))
    usage_purpose_text = await get_single_lookup_name_by_value("usage_purposes", step5.get("usagePurpose"))

    ropaDB().table("retention_policies").insert({
        "activity_id": activity_id,
        "storage_type": storage_type_text or None,
        "storage_method": storage_method_text or None,
        "retention_period": build_retention_period_text(step5),
        "deletion_method": deletion_method_text,
        "usage_status": to_boolean_or_none(step5.get("usageStatus")),
        "usage_purpose": usage_purpose_text,
        "denial_note": step5.get("refusalNote"),
    }).execute()

    security_rows = await build_security_rows(activity_id, step6)
    if security_rows:
        ropaDB().table("activity_security").insert(security_rows).execute()

    for processor in get_processors_from_step7(step7):
        processor_id = await create_processor(processor)
        if not processor_id:
            continue

        ropaDB().table("activity_processors").insert({
            "activity_id": activity_id,
            "processor_id": processor_id,
            "access_type": processor.get("accessType"),
            "data_category_accessed": processor.get("dataCategoryAccessed"),
            "note": processor.get("note"),
        }).execute()

        activity_processor_id = await find_latest_activity_processor_id(activity_id, processor_id)
        if not activity_processor_id:
            continue

        selected_security = processor.get("securitySelected") or {}
        security_details = processor.get("securityDetails") or {}

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
            ropaDB().table("processor_security_measures").insert(processor_security_rows).execute()
            
async def get_username(user_id):
    if not user_id or not is_uuid(user_id):
        return user_id or "system"
    res = authDB().table("users").select("username").eq("id", user_id).maybe_single().execute()
    row = first_row(res)
    return row.get("username") if row else "system"

async def getFormOptions(request: Request):
    try:
        activity_names = safe_data(ropaDB().table("activity_name").select("id, name, department_id").order("name").execute(), [])
        purposes = safe_data(lookupDB().table("usage_purposes").select("id, name").order("name").execute(), [])
        data_categories = safe_data(lookupDB().table("data_categories").select("id, name").order("name").execute(), [])
        data_types = safe_data(lookupDB().table("data_types").select("id, name").order("name").execute(), [])
        acquisition_methods = safe_data(lookupDB().table("acquisition_method").select("id, name").order("name").execute(), [])
        data_sources = safe_data(lookupDB().table("data_sources").select("id, name").order("name").execute(), [])
        legal_bases = safe_data(lookupDB().table("legal_bases").select("id, name").order("name").execute(), [])
        deletion_methods = safe_data(lookupDB().table("deletion_methods").select("id, name").order("name").execute(), [])
        transfer_methods = safe_data(lookupDB().table("transfer_methods").select("id, name").order("name").execute(), [])
        protection_standards = safe_data(lookupDB().table("protection_standards").select("id, name").order("name").execute(), [])
        legal_exemptions = safe_data(lookupDB().table("legal_exemptions").select("id, name").order("name").execute(), [])
        retention_storage_types = safe_data(lookupDB().table("retention_storage_types").select("id, name").order("name").execute(), [])
        retention_storage_methods = safe_data(lookupDB().table("retention_storage_methods").select("id, name").order("name").execute(), [])
        access_rights = safe_data(lookupDB().table("access_rights").select("id, name").order("name").execute(), [])
        security_measures = safe_data(lookupDB().table("security_measures").select("id, name").order("name").execute(), [])
        departments = safe_data(authDB().table("departments").select("id, department_name, description").order("department_name").execute(), [])

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

    user_id = getattr(request.state, "user", {}).get("userId") if hasattr(request.state, "user") else None

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

        activity_name_id, department_id = await resolve_step1_refs(step1, user_id)
        purpose_text = await build_purpose_text(step1.get("processingPurpose"))

        if not activity_name_id:
            raise HTTPException(status_code=400, detail={"error": "Invalid processActivity"})
        if not department_id:
            raise HTTPException(status_code=400, detail={"error": "Cannot resolve department_id"})

        data_type_id = await get_single_lookup_id_by_name("data_types", step2.get("dataType"))
        source_id = await get_single_lookup_id_by_name("data_sources", step2.get("dataSource"))

        ropaDB().table("processing_activities").insert({
            "owner_name": step1.get("dataOwner"),
            "activity_name": activity_name_id,
            "department_id": department_id,
            "purpose": purpose_text,
            "data_main_type": build_data_main_type(step2),
            "data_type_id": data_type_id,
            "source_id": source_id,
            "approval_status": "pending",
            "created_by": user_id,
            "submitted_at": datetime.utcnow().isoformat(),
            "updated_by": user_id,
            "updated_at": datetime.utcnow().isoformat(),
        }).execute()

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

        activity_name_row = first_row(
            ropaDB().table("activity_name")
            .select("id, name, department_id")
            .eq("id", activity.get("activity_name"))
            .maybe_single()
            .execute()
        )

        department_row = first_row(
            authDB().table("departments")
            .select("id, department_name")
            .eq("id", activity.get("department_id"))
            .maybe_single()
            .execute()
        )

        categories = safe_data(
            ropaDB().table("activity_data_categories")
            .select("data_categories_id")
            .eq("activity_id", activityId)
            .execute(),
            [],
        )

        acquisitions = safe_data(
            ropaDB().table("activity_acquisition")
            .select("acquisition_method_id")
            .eq("activity_id", activityId)
            .execute(),
            [],
        )

        legal_rows = safe_data(
            ropaDB().table("activity_legal_bases")
            .select("*")
            .eq("activity_id", activityId)
            .execute(),
            [],
        )
        
        department_rows = safe_data(
            ropaDB().table("activity_departments")
            .select("department_id")
            .eq("activity_id", activityId)
            .execute(),
            [],
        )

        access_names = await get_many_lookup_names_by_values(
            "access_rights",
            [row.get("department_id") for row in department_rows if row.get("department_id")]
        )
        access_names = [strip_department_prefix(n) for n in access_names]

        minor_rows = safe_data(
            ropaDB().table("minor_consent")
            .select("*")
            .eq("activity_id", activityId)
            .execute(),
            [],
        )

        transfer = first_row(
            ropaDB().table("international_transfers")
            .select("*")
            .eq("activity_id", activityId)
            .limit(1)
            .execute()
        )

        retention = first_row(
            ropaDB().table("retention_policies")
            .select("*")
            .eq("activity_id", activityId)
            .limit(1)
            .execute()
        )
        security = safe_data(
            ropaDB().table("activity_security")
            .select("*")
            .eq("activity_id", activityId)
            .execute(),
            [],
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
        processors = safe_data(
            ropaDB().table("activity_processors")
            .select("*, processors (*), processor_security_measures (*)")
            .eq("activity_id", activityId)
            .execute(),
            [],
        )

        # resolve minor consent
        minor_consent = {"under10": "", "age10to20": ""}
        for row in minor_rows:
            print("minor row:", row)
            age_range = row.get("age_range")
            desc = row.get("description") or ""
            if age_range == "under10":
                minor_consent["under10"] = desc
            elif age_range == "age10to20":
                minor_consent["age10to20"] = desc
            elif age_range == "mixed":
                for part in desc.split("|"):
                    part = part.strip()
                    if part.lower().startswith("under10:") or part.lower().startswith("under_10:"):
                        minor_consent["under10"] = part.split(":", 1)[1].strip()
                    elif part.lower().startswith("age10to20:") or part.lower().startswith("10_to_"):
                        minor_consent["age10to20"] = part.split(":", 1)[1].strip()
        # resolve names
        category_names = await get_many_lookup_names_by_values(
            "data_categories",
            [row.get("data_categories_id") for row in categories if row.get("data_categories_id")]
        )
        data_type_name = await get_single_lookup_name_by_value("data_types", activity.get("data_type_id"))
        method_names = await get_many_lookup_names_by_values(
            "acquisition_method",
            [row.get("acquisition_method_id") for row in acquisitions if row.get("acquisition_method_id")]
        )
        source_name = await get_single_lookup_name_by_value("data_sources", activity.get("source_id"))
        primary_names = await get_many_lookup_names_by_values(
            "legal_bases",
            [row.get("legal_bases_id") for row in legal_rows if row.get("basis_type") == "primary"]
        )
        supplementary_names = await get_many_lookup_names_by_values(
            "legal_bases",
            [row.get("legal_bases_id") for row in legal_rows if row.get("basis_type") == "supplementary"]
        )

        security_with_names = [
            {
                **row,
                "name": measure_map.get(row.get("measures_id"), ""),
            }
            for row in security
        ]
        
        created_by_name = await get_username(activity.get("created_by"))
        updated_by_name = await get_username(activity.get("updated_by"))

        return {
            "id": activityId,

            "step1": {
                "dataOwner": activity.get("owner_name") or "",
                "processActivity": activity.get("activity_name") or "",
                "processActivityName": activity_name_row.get("name") if activity_name_row else "",
                "processingPurpose": activity.get("purpose") or "",
                "departmentId": activity.get("department_id") or "",
                "departmentName": department_row.get("department_name") if department_row else "",
            },

            "step2": {
                "dataClass": activity.get("data_main_type") or "",
                "categories": category_names,
                "dataType": data_type_name or "",
                "methods": method_names,
                "dataSource": source_name or "",
            },

            "step3": {
                "primaryBases": primary_names,
                "supplementaryBases": supplementary_names,
                "minorConsent": minor_consent,
            },

            "step4": {
                "hasTransferAbroad": "มี" if transfer and transfer.get("is_transfer") else "ไม่มี",
                "transferCountry": transfer.get("destination_country") if transfer else "",
                "isToSubsidiary": "ใช่" if transfer and transfer.get("affiliated_company") else "ไม่ใช่",
                "subsidiaryName": transfer.get("affiliated_company") if transfer else "",
                "transferMethod": transfer.get("transfer_method") if transfer else "",
                "dataProtectionStandard": (
                    [x.strip() for x in str(transfer.get("protection_standard") or "").split(",") if x.strip()]
                    if transfer else []
                ),
                "legalExemption": (
                    [x.strip() for x in str(transfer.get("exceptions") or "").split(",") if x.strip()]
                    if transfer else []
                ),
            },

            "step5": {
                "dataType": (
                    [x.strip() for x in str(retention.get("storage_type") or "").split(",") if x.strip()]
                    if retention else []
                ),
                "storageMethod": (
                    [x.strip() for x in str(retention.get("storage_method") or "").split(",") if x.strip()]
                    if retention else []
                ),
                "retentionPeriod": retention.get("retention_period") if retention else "",
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

            "step6": {
                "securityRows": security_with_names,
            },

            "step7": {
                "processors": processors,
            },
        }

    except HTTPException:
        raise
    except Exception as err:
        print("getActivityById error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))

async def updateForm(activityId: str, request: Request):
    body = await request.json()

    user_id = getattr(request.state, "user", {}).get("userId") if hasattr(request.state, "user") else None

    step1 = body.get("step1") or {}
    step2 = body.get("step2") or {}
    step3 = body.get("step3") or {}
    step4 = body.get("step4") or {}
    step5 = body.get("step5") or {}
    step6 = body.get("step6") or {}
    step7 = body.get("step7") or {}

    try:
        if not is_uuid(activityId):
            raise HTTPException(status_code=400, detail={"error": "Invalid activity id"})

        validation_errors = validate_submit_payload(step1, step2, step3, step4, step5)
        if validation_errors:
            raise HTTPException(status_code=400, detail={"error": "Validation failed", "details": validation_errors})

        activity_name_id, department_id = await resolve_step1_refs(step1, user_id)
        purpose_text = await build_purpose_text(step1.get("processingPurpose"))

        if not activity_name_id:
            raise HTTPException(status_code=400, detail={"error": "Invalid processActivity"})
        if not department_id:
            raise HTTPException(status_code=400, detail={"error": "Cannot resolve department_id"})

        data_type_id = await get_single_lookup_id_by_name("data_types", step2.get("dataType"))
        source_id = await get_single_lookup_id_by_name("data_sources", step2.get("dataSource"))

        ropaDB().table("processing_activities").update({
            "owner_name": step1.get("dataOwner"),
            "activity_name": activity_name_id,
            "department_id": department_id,
            "purpose": purpose_text,
            "data_main_type": build_data_main_type(step2),
            "data_type_id": data_type_id,
            "source_id": source_id,
            "approval_status": "pending",
            "updated_by": user_id,
            "updated_at": datetime.utcnow().isoformat(),
        }).eq("id", activityId).execute()

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

        old_processors_res = ropaDB().table("activity_processors").select("id, processor_id").eq("activity_id", activityId).execute()
        old_processors = safe_data(old_processors_res, [])

        activity_processor_ids = [row["id"] for row in old_processors if row.get("id")]
        processor_ids = [row["processor_id"] for row in old_processors if row.get("processor_id")]

        if activity_processor_ids:
            ropaDB().table("processor_security_measures").delete().in_("activity_processor_id", activity_processor_ids).execute()
            ropaDB().table("activity_processors").delete().in_("id", activity_processor_ids).execute()

        if processor_ids:
            ropaDB().table("processors").delete().in_("id", processor_ids).execute()

        await insert_step_relations(activityId, step2, step3, step4, step5, step6, step7, department_id)

        return {"message": "Form updated successfully", "activityId": activityId}

    except HTTPException:
        raise
    except Exception as err:
        print("updateForm error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))


async def getRopaList(request: Request):
    try:
        activities_res = ropaDB().table("processing_activities").select("""
            id,
            owner_name,
            activity_name,
            department_id,
            purpose,
            approval_status,
            submitted_at,
            updated_at,
            created_by,
            updated_by
        """).order("submitted_at", desc=True).execute()

        activities = safe_data(activities_res, [])
        result = []

        for activity in activities:
            activity_id = activity["id"]

            activity_name = "-"
            department_name = "-"

            if activity.get("activity_name"):
                name_row = first_row(
                    ropaDB().table("activity_name")
                    .select("id, name")
                    .eq("id", activity["activity_name"])
                    .maybe_single()
                    .execute()
                )
                if name_row:
                    activity_name = name_row.get("name") or "-"

            if activity.get("department_id"):
                dept_row = first_row(
                    authDB().table("departments")
                    .select("id, department_name")
                    .eq("id", activity["department_id"])
                    .maybe_single()
                    .execute()
                )
                if dept_row:
                    department_name = dept_row.get("department_name") or "-"

            retention = first_row(
                ropaDB().table("retention_policies")
                .select("*")
                .eq("activity_id", activity_id)
                .limit(1)
                .execute()
            )

            transfer = first_row(
                ropaDB().table("international_transfers")
                .select("*")
                .eq("activity_id", activity_id)
                .limit(1)
                .execute()
            )

            legal_rows = safe_data(
                ropaDB().table("activity_legal_bases")
                .select("*")
                .eq("activity_id", activity_id)
                .execute(),
                [],
            )

            minor_rows = safe_data(
                ropaDB().table("minor_consent")
                .select("*")
                .eq("activity_id", activity_id)
                .execute(),
                [],
            )

            security_rows = safe_data(
                ropaDB().table("activity_security")
                .select("*")
                .eq("activity_id", activity_id)
                .execute(),
                [],
            )

            processor_rows = safe_data(
                ropaDB().table("activity_processors")
                .select("""
                    *,
                    processors (*),
                    processor_security_measures (*)
                """)
                .eq("activity_id", activity_id)
                .execute(),
                [],
            )

            status_raw = str(activity.get("approval_status") or "").lower()
            if status_raw in ["approved", "complete"]:
                status = "Complete"
            elif status_raw in ["revision", "rejected"]:
                status = "Revision"
            else:
                status = "Pending"

            primary_ids = [row.get("legal_bases_id") for row in legal_rows if row.get("basis_type") == "primary"]
            legal_names = await get_many_lookup_names_by_values("legal_bases", primary_ids)

            supplementary_ids = [row.get("legal_bases_id") for row in legal_rows if row.get("basis_type") == "supplementary"]
            supplementary_names = await get_many_lookup_names_by_values("legal_bases", supplementary_ids)

            # resolve minor consent
            minor_consent = {"under10": "", "age10to20": ""}
            for row in minor_rows:
                if row.get("age_range") == "under10":
                    minor_consent["under10"] = row.get("description") or ""
                elif row.get("age_range") == "age10to20":
                    minor_consent["age10to20"] = row.get("description") or ""
            
            department_rows = safe_data(
                ropaDB().table("activity_departments")
                .select("department_id")
                .eq("activity_id", activity_id)
                .execute(), []
            )
            access_names = await get_many_lookup_names_by_values(
                "access_rights",
                [row.get("department_id") for row in department_rows if row.get("department_id")]
            )
            access_names = [strip_department_prefix(n) for n in access_names]
            result.append({
                "id": activity_id,
                "activity": activity_name,
                "purpose": activity.get("purpose") or "-",
                "purposeDetail": activity.get("purpose") or "-",
                "dataOwner": activity.get("owner_name") or "-",
                "parties": access_names,

                "legal": {
                    "basis": legal_names,
                    "secondaryCategory": supplementary_names,
                    "minorConsent": minor_consent,
                },

                "transfer": {
                    "is_transfer": transfer.get("is_transfer") if transfer else None,
                    "destination_country": transfer.get("destination_country") if transfer else None,
                    "affiliated_company": transfer.get("affiliated_company") if transfer else None,
                    "transfer_method": transfer.get("transfer_method") if transfer else None,
                    "protection_standard": transfer.get("protection_standard") if transfer else None,
                    "exceptions": (
                        [x.strip() for x in str(transfer.get("exceptions") or "").split(",") if x.strip()]
                        if transfer else []
                    ),
                },

                "retention": {
                    "storageType": (
                        [x.strip() for x in str(retention.get("storage_type") or "").split(",") if x.strip()]
                        if retention else []
                    ),
                    "storageMethod": (
                        [x.strip() for x in str(retention.get("storage_method") or "").split(",") if x.strip()]
                        if retention else []
                    ),
                    "retentionPeriod": retention.get("retention_period") if retention else "-",
                    "department": [department_name] if department_name != "-" else [],
                    "deletionMethod": retention.get("deletion_method") if retention else "",
                    "usage_purpose": (
                        [retention.get("usage_purpose")]
                        if retention and retention.get("usage_purpose")
                        else []
                    ),
                    "denialNote": retention.get("denial_note") if retention else None,
                },

                "security": security_rows,
                "processors": processor_rows,
                "risk": "Stable",
                "status": status,

                "history": [
                    {
                        "action": "edit",
                        "by": updated_by_name,
                        "date": activity.get("updated_at") or "-",
                        "time": activity.get("updated_at") or "-",
                    },
                    {
                        "action": "create",
                        "by": created_by_name,
                        "date": activity.get("submitted_at") or "-",
                        "time": activity.get("submitted_at") or "-",
                    },
                ],
            })

        return result

    except Exception as err:
        print("getRopaList error:", repr(err))
        raise HTTPException(status_code=500, detail=str(err))
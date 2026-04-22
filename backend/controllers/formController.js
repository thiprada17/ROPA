import supabase from "../lib/supabase.js";

const ropaDB = () => supabase.schema("ropa");
const lookupDB = () => supabase.schema("lookup");
const authDB = () => supabase.schema("auths");

const isUUID = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
};

const joinAddress = (address) => {
  if (Array.isArray(address)) return address.filter(Boolean).join("\n");
  if (typeof address === "string") return address;
  return "";
};

const toBooleanOrNull = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "มีการใช้") return true;
  if (value === "ไม่มีการใช้") return false;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
};

const getSingleLookupIdByName = async (table, value, nameColumn = "name") => {
  if (!value) return null;
  if (isUUID(value)) return value;

  const { data, error } = await lookupDB()
    .from(table)
    .select("id")
    .eq(nameColumn, value)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
};

const getManyLookupIdsByNames = async (table, values, nameColumn = "name") => {
  const arr = normalizeArray(values);
  if (arr.length === 0) return [];

  const uuidValues = arr.filter(isUUID);
  const textValues = arr.filter((v) => typeof v === "string" && !isUUID(v));

  let ids = [...uuidValues];

  if (textValues.length > 0) {
    const { data, error } = await lookupDB()
      .from(table)
      .select("id")
      .in(nameColumn, textValues);

    if (error) throw error;
    ids.push(...(data || []).map((row) => row.id));
  }

  return [...new Set(ids)];
};

const getSingleLookupNameByValue = async (table, value, nameColumn = "name") => {
  if (!value) return null;
  if (!isUUID(value)) return value;

  const { data, error } = await lookupDB()
    .from(table)
    .select(nameColumn)
    .eq("id", value)
    .maybeSingle();

  if (error) throw error;
  return data?.[nameColumn] || null;
};

const getManyLookupNamesByValues = async (table, values, nameColumn = "name") => {
  const arr = normalizeArray(values);
  if (arr.length === 0) return [];

  const uuidValues = arr.filter(isUUID);
  const textValues = arr.filter((v) => typeof v === "string" && !isUUID(v));

  let names = [...textValues];

  if (uuidValues.length > 0) {
    const { data, error } = await lookupDB()
      .from(table)
      .select(`id, ${nameColumn}`)
      .in("id", uuidValues);

    if (error) throw error;
    names.push(...(data || []).map((row) => row[nameColumn]));
  }

  return [...new Set(names.filter(Boolean))];
};

const getDepartmentId = async (value) => {
  if (!value) return null;
  if (isUUID(value)) return value;

  const { data, error } = await authDB()
    .from("departments")
    .select("id")
    .eq("department_name", value)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
};

const getActivityNameId = async (value, departmentId = null) => {
  if (!value) return null;
  if (isUUID(value)) return value;

  let query = ropaDB().from("activity_name").select("id").eq("name", value);

  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data?.id || null;
};

const buildPurposeText = async (value) => {
  if (!value) return "";
  return (await getSingleLookupNameByValue("usage_purposes", value)) || value;
};

const buildDataMainType = (step2 = {}) => {
  if (step2.dataClass === "อื่นๆ") {
    return step2.otherText?.trim() || "อื่นๆ";
  }
  return step2.dataClass || null;
};

const buildRetentionPeriodText = (step5 = {}) => {
  if (typeof step5.retentionPeriod === "string" && step5.retentionPeriod.trim()) {
    return step5.retentionPeriod.trim();
  }

  const dd = step5.retentionDD ? `${step5.retentionDD} วัน` : "";
  const mm = step5.retentionMM ? `${step5.retentionMM} เดือน` : "";
  const yy = step5.retentionYY ? `${step5.retentionYY} ปี` : "";

  const text = [yy, mm, dd].filter(Boolean).join(" ");
  return text || null;
};

const extractSelectedSecurityValues = (step6 = {}) => {
  if (Array.isArray(step6.selectedSecurity)) {
    return step6.selectedSecurity.filter(Boolean);
  }

  const selected = step6.selectedSecurity || {};
  return Object.entries(selected)
    .filter(([, checked]) => !!checked)
    .map(([label]) => label);
};

const buildSecurityRows = async (activityId, step6 = {}) => {
  const selectedValues = extractSelectedSecurityValues(step6);
  const detailMap = step6.securityDetails || {};

  if (selectedValues.length === 0) return [];

  const measures = [];
  for (const value of selectedValues) {
    const id = await getSingleLookupIdByName("security_measures", value);
    if (!id) continue;

    measures.push({
      activity_id: activityId,
      measures_id: id,
      detail: detailMap[id] || detailMap[value] || null,
    });
  }

  return measures;
};

const createProcessor = async (processor = {}) => {
  const name = processor?.name?.trim();
  const address = joinAddress(processor?.address);

  if (!name) return null;

  const payload = {
    name,
    address: address || null,
  };

  const { data, error } = await ropaDB()
    .from("processors")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
};

const validateSubmitPayload = ({ step1, step2, step3, step4 }) => {
  const errors = [];

  if (!step1?.dataOwner?.trim()) errors.push("step1.dataOwner is required");
  if (!step1?.processActivity) errors.push("step1.processActivity is required");
  if (!step1?.processingPurpose) errors.push("step1.processingPurpose is required");

  if (!step2?.dataClass) errors.push("step2.dataClass is required");
  if (step2?.dataClass === "อื่นๆ" && !step2?.otherText?.trim()) {
    errors.push("step2.otherText is required when dataClass is อื่นๆ");
  }
  if (!step2?.categories || !Array.isArray(step2.categories) || step2.categories.length === 0) {
    errors.push("step2.categories is required");
  }
  if (!step2?.dataType) errors.push("step2.dataType is required");
  if (!step2?.methods || !Array.isArray(step2.methods) || step2.methods.length === 0) {
    errors.push("step2.methods is required");
  }
  if (!step2?.dataSource) errors.push("step2.dataSource is required");

  if (!step3?.primaryBases || !Array.isArray(step3.primaryBases) || step3.primaryBases.length === 0) {
    errors.push("step3.primaryBases is required");
  }

  if (step4?.hasTransferAbroad === "มี" && !step4?.transferCountry) {
    errors.push("step4.transferCountry is required when hasTransferAbroad is มี");
  }

  return errors;
};

const upsertActivityDepartment = async (activityId, departmentId, accessRights = []) => {
  if (!departmentId) return;

  const mergedAccessType = ["owner", ...accessRights]
    .filter(Boolean)
    .join(", ");

  const { error } = await ropaDB()
    .from("activity_departments")
    .upsert(
      {
        activity_id: activityId,
        department_id: departmentId,
        access_type: mergedAccessType || "owner",
      },
      {
        onConflict: "activity_id",
      }
    );

  if (error) throw error;
};

const upsertMinorConsent = async (activityId, step3 = {}) => {
  const minorParts = [];

  if (step3?.minorConsent?.under10) {
    minorParts.push(`under_10: ${step3.minorConsent.under10}`);
  }

  if (step3?.minorConsent?.age10to20) {
    minorParts.push(`10_to_20: ${step3.minorConsent.age10to20}`);
  }

  if (minorParts.length === 0) return;

  const { error } = await ropaDB()
    .from("minor_consent")
    .upsert(
      {
        activity_id: activityId,
        age_range: "mixed",
        description: minorParts.join(" | "),
      },
      {
        onConflict: "activity_id",
      }
    );

  if (error) throw error;
};

export const getFormOptions = async (req, res) => {
  try {
    const [
      { data: activityNames, error: e0 },
      { data: purposes, error: e1 },
      { data: dataCategories, error: e2 },
      { data: dataTypes, error: e3 },
      { data: acquisitionMethods, error: e4 },
      { data: dataSources, error: e5 },
      { data: legalBases, error: e6 },
      { data: deletionMethods, error: e7 },
      { data: transferMethods, error: e8 },
      { data: protectionStandards, error: e9 },
      { data: legalExemptions, error: e10 },
      { data: retentionStorageTypes, error: e11 },
      { data: retentionStorageMethods, error: e12 },
      { data: accessRights, error: e13 },
      { data: securityMeasures, error: e14 },
      { data: departments, error: e15 },
    ] = await Promise.all([
      ropaDB().from("activity_name").select("id, name, department_id").order("name"),
      lookupDB().from("usage_purposes").select("id, name").order("name"),
      lookupDB().from("data_categories").select("id, name").order("name"),
      lookupDB().from("data_types").select("id, name").order("name"),
      lookupDB().from("acquisition_method").select("id, name").order("name"),
      lookupDB().from("data_sources").select("id, name").order("name"),
      lookupDB().from("legal_bases").select("id, name").order("name"),
      lookupDB().from("deletion_methods").select("id, name").order("name"),
      lookupDB().from("transfer_methods").select("id, name").order("name"),
      lookupDB().from("protection_standards").select("id, name").order("name"),
      lookupDB().from("legal_exemptions").select("id, name").order("name"),
      lookupDB().from("retention_storage_types").select("id, name").order("name"),
      lookupDB().from("retention_storage_methods").select("id, name").order("name"),
      lookupDB().from("access_rights").select("id, name").order("name"),
      lookupDB().from("security_measures").select("id, name").order("name"),
      authDB().from("departments").select("id, department_name, description").order("department_name"),
    ]);

    const errors = [
      e0, e1, e2, e3, e4, e5, e6, e7,
      e8, e9, e10, e11, e12, e13, e14, e15,
    ].filter(Boolean);

    if (errors.length > 0) throw errors[0];

    return res.json({
      activityNames,
      purposes,
      usagePurposes: purposes,
      dataCategories,
      dataTypes,
      acquisitionMethods,
      dataSources,
      legalBases,
      deletionMethods,
      transferMethods,
      protectionStandards,
      legalExemptions,
      retentionStorageTypes,
      retentionStorageMethods,
      accessRights,
      securityMeasures,
      departments,
    });
  } catch (err) {
    console.error("getFormOptions error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch form options",
    });
  }
};

export const submitForm = async (req, res) => {
  const userId = req.user?.id || null;
  const { step1, step2, step3, step4, step5, step6, step7 } = req.body;

  try {
    const validationErrors = validateSubmitPayload({ step1, step2, step3, step4 });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    const departmentId = await getDepartmentId(step1.departmentId || step1.department || null);
    const activityNameId = await getActivityNameId(step1.processActivity, departmentId);
    const purposeText = await buildPurposeText(step1.processingPurpose);

    const dataMainType = buildDataMainType(step2);
    const dataTypeId = await getSingleLookupIdByName("data_types", step2.dataType);
    const sourceId = await getSingleLookupIdByName("data_sources", step2.dataSource);

    const { data: activity, error: activityError } = await ropaDB()
      .from("processing_activities")
      .insert({
        owner_name: step1.dataOwner,
        activity_name: activityNameId,
        department_id: departmentId,
        purpose: purposeText,
        data_main_type: dataMainType,
        data_type_id: dataTypeId,
        source_id: sourceId,
        approval_status: "pending",
        created_by: userId,
        submitted_at: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (activityError) throw activityError;

    const activityId = activity.id;

    const categoryIds = await getManyLookupIdsByNames("data_categories", step2.categories);
    if (categoryIds.length > 0) {
      const rows = categoryIds.map((id) => ({
        activity_id: activityId,
        data_categories_id: id,
      }));

      const { error } = await ropaDB().from("activity_data_categories").insert(rows);
      if (error) throw error;
    }

    const acquisitionIds = await getManyLookupIdsByNames("acquisition_method", step2.methods);
    if (acquisitionIds.length > 0) {
      const rows = acquisitionIds.map((id) => ({
        activity_id: activityId,
        acquisition_method_id: id,
      }));

      const { error } = await ropaDB().from("activity_acquisition").insert(rows);
      if (error) throw error;
    }

    const legalBaseIds = await getManyLookupIdsByNames("legal_bases", step3.primaryBases);
    if (legalBaseIds.length > 0) {
      const rows = legalBaseIds.map((id) => ({
        activity_id: activityId,
        legal_bases_id: id,
      }));

      const { error } = await ropaDB().from("activity_legal_bases").insert(rows);
      if (error) throw error;
    }

    const accessRightNames = await getManyLookupNamesByValues(
      "access_rights",
      step5?.accessRight || []
    );
    await upsertActivityDepartment(activityId, departmentId, accessRightNames);

    await upsertMinorConsent(activityId, step3);

    if (step4?.hasTransferAbroad === "มี") {
      const transferMethodText = await getSingleLookupNameByValue("transfer_methods", step4.transferMethod);
      const protectionStandardText = (
        await getManyLookupNamesByValues("protection_standards", step4.dataProtectionStandard || [])
      ).join(", ");
      const legalExemptionsText = (
        await getManyLookupNamesByValues("legal_exemptions", step4.legalExemption || [])
      ).join(", ");

      const { error } = await ropaDB().from("international_transfers").insert({
        activity_id: activityId,
        is_transfer: true,
        destination_country: step4.transferCountry || null,
        affiliated_company: step4.isToSubsidiary === "ใช่" ? step4.subsidiaryName || null : null,
        transfer_method: transferMethodText || null,
        protection_standard: protectionStandardText || null,
        exceptions: legalExemptionsText || null,
      });

      if (error) throw error;
    } else {
      const { error } = await ropaDB().from("international_transfers").insert({
        activity_id: activityId,
        is_transfer: false,
        destination_country: null,
        affiliated_company: null,
        transfer_method: null,
        protection_standard: null,
        exceptions: null,
      });

      if (error) throw error;
    }

    const storageTypeText = (
      await getManyLookupNamesByValues("retention_storage_types", step5?.dataType || [])
    ).join(", ");

    const storageMethodText = (
      await getManyLookupNamesByValues("retention_storage_methods", step5?.storageMethod || [])
    ).join(", ");

    const deletionMethodText = await getSingleLookupNameByValue("deletion_methods", step5?.destructionMethod);
    const usagePurposeText = await getSingleLookupNameByValue("usage_purposes", step5?.usagePurpose);
    const retentionPeriodText = buildRetentionPeriodText(step5);

    const { error: retentionError } = await ropaDB().from("retention_policies").insert({
      activity_id: activityId,
      storage_type: storageTypeText || null,
      storage_method: storageMethodText || null,
      retention_period: retentionPeriodText || null,
      deletion_method: deletionMethodText || null,
      usage_status: toBooleanOrNull(step5?.usageStatus),
      usage_purpose: usagePurposeText || null,
      denial_note: step5?.refusalNote || null,
    });

    if (retentionError) throw retentionError;

    const securityRows = await buildSecurityRows(activityId, step6);
    if (securityRows.length > 0) {
      const { error } = await ropaDB().from("activity_security").insert(securityRows);
      if (error) throw error;
    }

    if (Array.isArray(step7?.processors) && step7.processors.length > 0) {
      for (const processor of step7.processors) {
        const processorId = await createProcessor(processor);
        if (!processorId) continue;

        const { data: activityProcessor, error: activityProcessorError } = await ropaDB()
          .from("activity_processors")
          .insert({
            activity_id: activityId,
            processor_id: processorId,
            access_type: processor?.accessType || null,
            data_category_accessed: processor?.dataCategoryAccessed || null,
            note: processor?.note || null,
          })
          .select("id")
          .single();

        if (activityProcessorError) throw activityProcessorError;

        const selectedSecurity = processor?.securitySelected || {};
        const securityDetails = processor?.securityDetails || {};
        const processorSecurityRows = [];

        for (const [label, checked] of Object.entries(selectedSecurity)) {
          if (!checked) continue;

          processorSecurityRows.push({
            activity_processor_id: activityProcessor.id,
            type: label,
            detail: securityDetails[label] || null,
          });
        }

        if (processorSecurityRows.length > 0) {
          const { error } = await ropaDB()
            .from("processor_security_measures")
            .insert(processorSecurityRows);

          if (error) throw error;
        }
      }
    }

    return res.status(201).json({
      message: "Form submitted successfully",
      activityId,
    });
  } catch (err) {
    console.error("submitForm error:", err);
    return res.status(500).json({
      error: err.message || "Failed to submit form",
    });
  }
};

export const updateForm = async (req, res) => {
  const { activityId } = req.params;
  const userId = req.user?.id || null;
  const { step1, step2, step3, step4, step5, step6, step7 } = req.body;

  try {
    if (!isUUID(activityId)) {
      return res.status(400).json({ error: "Invalid activity id" });
    }

    const validationErrors = validateSubmitPayload({ step1, step2, step3, step4 });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors,
      });
    }

    const departmentId = await getDepartmentId(step1.departmentId || step1.department || null);
    const activityNameId = await getActivityNameId(step1.processActivity, departmentId);
    const purposeText = await buildPurposeText(step1.processingPurpose);

    const dataMainType = buildDataMainType(step2);
    const dataTypeId = await getSingleLookupIdByName("data_types", step2.dataType);
    const sourceId = await getSingleLookupIdByName("data_sources", step2.dataSource);

    const { error: updateError } = await ropaDB()
      .from("processing_activities")
      .update({
        owner_name: step1.dataOwner,
        activity_name: activityNameId,
        department_id: departmentId,
        purpose: purposeText,
        data_main_type: dataMainType,
        data_type_id: dataTypeId,
        source_id: sourceId,
        approval_status: "pending",
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", activityId);

    if (updateError) throw updateError;

    const deleteTargets = [
      ["activity_data_categories", "activity_id"],
      ["activity_acquisition", "activity_id"],
      ["activity_legal_bases", "activity_id"],
      ["activity_departments", "activity_id"],
      ["minor_consent", "activity_id"],
      ["international_transfers", "activity_id"],
      ["retention_policies", "activity_id"],
      ["activity_security", "activity_id"],
    ];

    for (const [table, column] of deleteTargets) {
      const { error } = await ropaDB().from(table).delete().eq(column, activityId);
      if (error) throw error;
    }

    const { data: oldActivityProcessors, error: oldProcessorsError } = await ropaDB()
      .from("activity_processors")
      .select("id, processor_id")
      .eq("activity_id", activityId);

    if (oldProcessorsError) throw oldProcessorsError;

    if (oldActivityProcessors?.length) {
      const activityProcessorIds = oldActivityProcessors.map((row) => row.id);
      const processorIds = oldActivityProcessors.map((row) => row.processor_id).filter(Boolean);

      const { error: delProcessorSecurityError } = await ropaDB()
        .from("processor_security_measures")
        .delete()
        .in("activity_processor_id", activityProcessorIds);
      if (delProcessorSecurityError) throw delProcessorSecurityError;

      const { error: delActivityProcessorsError } = await ropaDB()
        .from("activity_processors")
        .delete()
        .in("id", activityProcessorIds);
      if (delActivityProcessorsError) throw delActivityProcessorsError;

      if (processorIds.length > 0) {
        const { error: delProcessorsError } = await ropaDB()
          .from("processors")
          .delete()
          .in("id", processorIds);
        if (delProcessorsError) throw delProcessorsError;
      }
    }

    const categoryIds = await getManyLookupIdsByNames("data_categories", step2.categories);
    if (categoryIds.length > 0) {
      const rows = categoryIds.map((id) => ({
        activity_id: activityId,
        data_categories_id: id,
      }));

      const { error } = await ropaDB().from("activity_data_categories").insert(rows);
      if (error) throw error;
    }

    const acquisitionIds = await getManyLookupIdsByNames("acquisition_method", step2.methods);
    if (acquisitionIds.length > 0) {
      const rows = acquisitionIds.map((id) => ({
        activity_id: activityId,
        acquisition_method_id: id,
      }));

      const { error } = await ropaDB().from("activity_acquisition").insert(rows);
      if (error) throw error;
    }

    const legalBaseIds = await getManyLookupIdsByNames("legal_bases", step3.primaryBases);
    if (legalBaseIds.length > 0) {
      const rows = legalBaseIds.map((id) => ({
        activity_id: activityId,
        legal_bases_id: id,
      }));

      const { error } = await ropaDB().from("activity_legal_bases").insert(rows);
      if (error) throw error;
    }

    const accessRightNames = await getManyLookupNamesByValues(
      "access_rights",
      step5?.accessRight || []
    );
    await upsertActivityDepartment(activityId, departmentId, accessRightNames);

    await upsertMinorConsent(activityId, step3);

    if (step4?.hasTransferAbroad === "มี") {
      const transferMethodText = await getSingleLookupNameByValue("transfer_methods", step4.transferMethod);
      const protectionStandardText = (
        await getManyLookupNamesByValues("protection_standards", step4.dataProtectionStandard || [])
      ).join(", ");
      const legalExemptionsText = (
        await getManyLookupNamesByValues("legal_exemptions", step4.legalExemption || [])
      ).join(", ");

      const { error } = await ropaDB().from("international_transfers").insert({
        activity_id: activityId,
        is_transfer: true,
        destination_country: step4.transferCountry || null,
        affiliated_company: step4.isToSubsidiary === "ใช่" ? step4.subsidiaryName || null : null,
        transfer_method: transferMethodText || null,
        protection_standard: protectionStandardText || null,
        exceptions: legalExemptionsText || null,
      });

      if (error) throw error;
    } else {
      const { error } = await ropaDB().from("international_transfers").insert({
        activity_id: activityId,
        is_transfer: false,
        destination_country: null,
        affiliated_company: null,
        transfer_method: null,
        protection_standard: null,
        exceptions: null,
      });

      if (error) throw error;
    }

    const storageTypeText = (
      await getManyLookupNamesByValues("retention_storage_types", step5?.dataType || [])
    ).join(", ");

    const storageMethodText = (
      await getManyLookupNamesByValues("retention_storage_methods", step5?.storageMethod || [])
    ).join(", ");

    const deletionMethodText = await getSingleLookupNameByValue("deletion_methods", step5?.destructionMethod);
    const usagePurposeText = await getSingleLookupNameByValue("usage_purposes", step5?.usagePurpose);
    const retentionPeriodText = buildRetentionPeriodText(step5);

    const { error: retentionError } = await ropaDB().from("retention_policies").insert({
      activity_id: activityId,
      storage_type: storageTypeText || null,
      storage_method: storageMethodText || null,
      retention_period: retentionPeriodText || null,
      deletion_method: deletionMethodText || null,
      usage_status: toBooleanOrNull(step5?.usageStatus),
      usage_purpose: usagePurposeText || null,
      denial_note: step5?.refusalNote || null,
    });

    if (retentionError) throw retentionError;

    const securityRows = await buildSecurityRows(activityId, step6);
    if (securityRows.length > 0) {
      const { error } = await ropaDB().from("activity_security").insert(securityRows);
      if (error) throw error;
    }

    if (Array.isArray(step7?.processors) && step7.processors.length > 0) {
      for (const processor of step7.processors) {
        const processorId = await createProcessor(processor);
        if (!processorId) continue;

        const { data: activityProcessor, error: activityProcessorError } = await ropaDB()
          .from("activity_processors")
          .insert({
            activity_id: activityId,
            processor_id: processorId,
            access_type: processor?.accessType || null,
            data_category_accessed: processor?.dataCategoryAccessed || null,
            note: processor?.note || null,
          })
          .select("id")
          .single();

        if (activityProcessorError) throw activityProcessorError;

        const selectedSecurity = processor?.securitySelected || {};
        const securityDetails = processor?.securityDetails || {};
        const processorSecurityRows = [];

        for (const [label, checked] of Object.entries(selectedSecurity)) {
          if (!checked) continue;

          processorSecurityRows.push({
            activity_processor_id: activityProcessor.id,
            type: label,
            detail: securityDetails[label] || null,
          });
        }

        if (processorSecurityRows.length > 0) {
          const { error } = await ropaDB()
            .from("processor_security_measures")
            .insert(processorSecurityRows);

          if (error) throw error;
        }
      }
    }

    return res.json({
      message: "Form updated successfully",
      activityId,
    });
  } catch (err) {
    console.error("updateForm error:", err);
    return res.status(500).json({
      error: err.message || "Failed to update form",
    });
  }
};

export const getActivityById = async (req, res) => {
  const { activityId } = req.params;

  try {
    if (!isUUID(activityId)) {
      return res.status(400).json({ error: "Invalid activity id" });
    }

    const { data, error } = await ropaDB()
      .from("processing_activities")
      .select(`
        *,
        activity_data_categories (*),
        activity_acquisition (*),
        activity_legal_bases (*),
        activity_departments (*),
        activity_security (*),
        minor_consent (*),
        international_transfers (*),
        retention_policies (*),
        activity_processors (
          *,
          processors (*),
          processor_security_measures (*)
        )
      `)
      .eq("id", activityId)
      .single();

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("getActivityById error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch activity",
    });
  }
};

export const getRopaList = async (req, res) => {
  try {
    const { data: activities, error: activitiesError } = await ropaDB()
      .from("processing_activities")
      .select(`
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
      `)
      .order("submitted_at", { ascending: false });

    if (activitiesError) throw activitiesError;

    if (!activities || activities.length === 0) {
      return res.json([]);
    }

    const activityIds = activities.map((a) => a.id).filter(Boolean);
    const activityNameIds = [...new Set(activities.map((a) => a.activity_name).filter(Boolean))];
    const departmentIds = [...new Set(activities.map((a) => a.department_id).filter(Boolean))];

    const [
      { data: activityNames, error: e1 },
      { data: departments, error: e2 },
      { data: activityDepartments, error: e3 },
      { data: legalBasesRows, error: e4 },
      { data: retentionRows, error: e5 },
      { data: transferRows, error: e6 },
      { data: processorRows, error: e7 },
      { data: securityRows, error: e8 },
      { data: minorConsentRows, error: e9 },
      { data: categoryRows, error: e10 },
      { data: acquisitionRows, error: e11 },
    ] = await Promise.all([
      activityNameIds.length
        ? ropaDB().from("activity_name").select("id, name").in("id", activityNameIds)
        : Promise.resolve({ data: [], error: null }),

      departmentIds.length
        ? authDB().from("departments").select("id, department_name").in("id", departmentIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("activity_departments").select("activity_id, department_id, access_type").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("activity_legal_bases").select("activity_id, legal_bases_id").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("retention_policies").select("activity_id, retention_period, storage_type, storage_method, deletion_method, usage_status, usage_purpose, denial_note").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("international_transfers").select("activity_id, is_transfer, destination_country, affiliated_company, transfer_method, protection_standard, exceptions").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("activity_processors").select("activity_id, id, access_type, data_category_accessed, note, processor_id").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("activity_security").select("activity_id, detail, measures_id").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("minor_consent").select("activity_id, age_range, description").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("activity_data_categories").select("activity_id, data_categories_id").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),

      activityIds.length
        ? ropaDB().from("activity_acquisition").select("activity_id, acquisition_method_id").in("activity_id", activityIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const errors = [e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11].filter(Boolean);
    if (errors.length > 0) throw errors[0];

    const legalBaseIds = [...new Set((legalBasesRows || []).map((x) => x.legal_bases_id).filter(Boolean))];
    const processorIds = [...new Set((processorRows || []).map((x) => x.processor_id).filter(Boolean))];
    const categoryIds = [...new Set((categoryRows || []).map((x) => x.data_categories_id).filter(Boolean))];
    const acquisitionIds = [...new Set((acquisitionRows || []).map((x) => x.acquisition_method_id).filter(Boolean))];
    const securityMeasureIds = [...new Set((securityRows || []).map((x) => x.measures_id).filter(Boolean))];

    const [
      { data: legalBaseLookup, error: e12 },
      { data: processors, error: e13 },
      { data: categoryLookup, error: e14 },
      { data: acquisitionLookup, error: e15 },
      { data: securityMeasureLookup, error: e16 },
    ] = await Promise.all([
      legalBaseIds.length
        ? lookupDB().from("legal_bases").select("id, name").in("id", legalBaseIds)
        : Promise.resolve({ data: [], error: null }),

      processorIds.length
        ? ropaDB().from("processors").select("id, name, address").in("id", processorIds)
        : Promise.resolve({ data: [], error: null }),

      categoryIds.length
        ? lookupDB().from("data_categories").select("id, name").in("id", categoryIds)
        : Promise.resolve({ data: [], error: null }),

      acquisitionIds.length
        ? lookupDB().from("acquisition_method").select("id, name").in("id", acquisitionIds)
        : Promise.resolve({ data: [], error: null }),

      securityMeasureIds.length
        ? lookupDB().from("security_measures").select("id, name").in("id", securityMeasureIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const moreErrors = [e12, e13, e14, e15, e16].filter(Boolean);
    if (moreErrors.length > 0) throw moreErrors[0];

    const activityNameMap = new Map((activityNames || []).map((x) => [x.id, x.name]));
    const departmentMap = new Map((departments || []).map((x) => [x.id, x.department_name]));
    const legalBaseMap = new Map((legalBaseLookup || []).map((x) => [x.id, x.name]));
    const processorMap = new Map((processors || []).map((x) => [x.id, x]));
    const categoryMap = new Map((categoryLookup || []).map((x) => [x.id, x.name]));
    const acquisitionMap = new Map((acquisitionLookup || []).map((x) => [x.id, x.name]));
    const securityMeasureMap = new Map((securityMeasureLookup || []).map((x) => [x.id, x.name]));

    const groupByActivity = (rows, key = "activity_id") => {
      const map = new Map();
      for (const row of rows || []) {
        const id = row[key];
        if (!map.has(id)) map.set(id, []);
        map.get(id).push(row);
      }
      return map;
    };

    const departmentsByActivity = groupByActivity(activityDepartments);
    const legalByActivity = groupByActivity(legalBasesRows);
    const retentionByActivity = groupByActivity(retentionRows);
    const transferByActivity = groupByActivity(transferRows);
    const processorsByActivity = groupByActivity(processorRows);
    const securityByActivity = groupByActivity(securityRows);
    const minorConsentByActivity = groupByActivity(minorConsentRows);
    const categoriesByActivity = groupByActivity(categoryRows);
    const acquisitionByActivity = groupByActivity(acquisitionRows);

    const buildStatus = (approvalStatus) => {
      const normalized = String(approvalStatus || "").toLowerCase();

      if (normalized === "approved" || normalized === "complete") return "Complete";
      if (normalized === "revision" || normalized === "rejected") return "Revision";
      return "Pending";
    };

    const result = activities.map((activity) => {
      const activityId = activity.id;
      const retention = retentionByActivity.get(activityId)?.[0] || null;
      const transfer = transferByActivity.get(activityId)?.[0] || null;
      const legalRows = legalByActivity.get(activityId) || [];
      const deptRows = departmentsByActivity.get(activityId) || [];
      const procRows = processorsByActivity.get(activityId) || [];
      const secRows = securityByActivity.get(activityId) || [];
      const consentRows = minorConsentByActivity.get(activityId) || [];
      const dataCategoryRows = categoriesByActivity.get(activityId) || [];
      const acquisitionMethodRows = acquisitionByActivity.get(activityId) || [];

      const parties = [
        ...new Set(
          [
            activity.department_id ? departmentMap.get(activity.department_id) : null,
            ...deptRows.map((d) => departmentMap.get(d.department_id)),
          ].filter(Boolean)
        ),
      ];

      const legalBasis = [
        ...new Set(
          legalRows.map((row) => legalBaseMap.get(row.legal_bases_id)).filter(Boolean)
        ),
      ];

      const processorsDetail = procRows.map((row) => {
        const processor = processorMap.get(row.processor_id);

        return {
          name: processor?.name || "-",
          address: processor?.address || "",
          security: {
            accessType: row.access_type || "",
            responsibility_def: row.note || "",
            organizational: "",
            technical: "",
            physical: "",
            audit_trail: "",
          },
        };
      });

      const under10 = consentRows.find((x) => x.age_range === "under10");
      const age10to20 = consentRows.find((x) => x.age_range === "10to20");
      const mixed = consentRows.find((x) => x.age_range === "mixed");

      const securityNames = secRows
        .map((row) => securityMeasureMap.get(row.measures_id) || row.detail)
        .filter(Boolean);

      return {
        id: activity.id,
        activity: activityNameMap.get(activity.activity_name) || "-",
        purpose: activity.purpose || "-",
        purposeDetail: activity.purpose || "-",
        dataOwner: activity.owner_name || "-",
        parties,

        dataSubjects: [],
        dataDescription: "",
        dataCategories: dataCategoryRows
          .map((row) => categoryMap.get(row.data_categories_id))
          .filter(Boolean),
        dataTypes: [],
        acquisitionMethods: acquisitionMethodRows
          .map((row) => acquisitionMap.get(row.acquisition_method_id))
          .filter(Boolean),
        dataSources: [],

        legal: {
          basis: legalBasis,
          secondaryCategory: [],
          minorConsent: {
            under10: under10?.description || mixed?.description || "",
            age10to20: age10to20?.description || mixed?.description || "",
          },
        },

        transfer: {
          is_transfer:
            transfer?.is_transfer === true
              ? "true"
              : transfer?.is_transfer === false
                ? "false"
                : "",
          destination_country: transfer?.destination_country || null,
          affiliated_company: transfer?.affiliated_company || null,
          transfer_method: transfer?.transfer_method || null,
          protection_standards: transfer?.protection_standard
            ? String(transfer.protection_standard)
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
          exceptions: transfer?.exceptions
            ? String(transfer.exceptions)
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean)
            : [],
        },

        retention: {
          storageType: retention?.storage_type
            ? String(retention.storage_type).split(",").map((x) => x.trim()).filter(Boolean)
            : [],
          storageMethod: retention?.storage_method
            ? String(retention.storage_method).split(",").map((x) => x.trim()).filter(Boolean)
            : [],
          retentionPeriod: retention?.retention_period || "-",
          department: parties,
          deletionMethod: retention?.deletion_method || "",
          usage_purpose: retention?.usage_purpose
            ? [retention.usage_purpose]
            : [],
          denialNote: retention?.denial_note || null,
        },

        security: {
          organizational: securityNames.join(", "),
          technical: "",
          physical: "",
          accessType: deptRows.map((d) => d.access_type).filter(Boolean).join(", "),
          responsibility_def: "",
          audit_trail: "",
        },

        processors: processorsDetail,

        risk: "Stable",
        status: buildStatus(activity.approval_status),

        history: [
          {
            action: "edit",
            by: "system",
            date: activity.updated_at
              ? new Date(activity.updated_at).toLocaleDateString("en-GB")
              : "-",
            time: activity.updated_at
              ? new Date(activity.updated_at).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-",
          },
        ],
      };
    });

    return res.json(result);
  } catch (err) {
    console.error("getRopaList error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch ROPA list",
    });
  }
};
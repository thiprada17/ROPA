export function mapFormToPayload(formData: any) {
  return {
    //  MAIN 
    processing_activity: {
      owner_name: formData.step1.dataOwner,
      activity_name: formData.step1.processActivity,
      purpose_text: formData.step1.processingPurpose,
    },

    //  RETENTION 
    retention_policy: {
      storage_type: formData.step5.dataType,
      storage_method: formData.step5.storageMethod,
      retention_period: `${Number(formData.step5.retentionYY)} ปี ${Number(formData.step5.retentionMM)} เดือน ${Number(formData.step5.retentionDD)} วัน`,
      deletion_method: formData.step5.destructionMethod,
    },

    activity_departments: formData.step5.accessRight.map((dep: string) => ({
      department_name: dep,
      usage_purpose:
        formData.step5.usageStatus === "มีการใช้"
          ? formData.step5.usagePurpose
          : null,
      access_type: "read/write",
    })),

    //  TRANSFER 
    international_transfer: {
      is_transfer: formData.step4.hasTransferAbroad === "มี",
      destination_country: formData.step4.transferCountry || null,
      affiliated_company: formData.step4.subsidiaryName || null,
      transfer_method: formData.step4.transferMethod || null,
      protection_standard: formData.step4.dataProtectionStandard,
      exceptions: formData.step4.legalExemption,
    },

    //  SECURITY 
    security: formData.step6,

    //  PROCESSORS 
    processors: formData.step7.processors,
  };
}
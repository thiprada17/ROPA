export interface RopaItem {
  id: string;

  // Step 1
  activity: string;
  purpose: string;
  purposeDetail?: string;
  dataOwner?: string;
  parties: string[];

  // Step 2
  dataDescription?: string;
  dataCategories?: string[];
  dataTypes?: string[];
  acquisitionMethods?: string[];
  dataSources?: string[];

  // Step 3
  legal?: {
    basis?: string[];
    secondaryCategory?: string[];
    minorConsent?: {
      under10?: string;
      age10to20?: string;
    };
  };

  // Step 4
  transfer?: {
    is_transfer?: string;
    destination_country?: string | null;
    affiliated_company?: string | null;
    transfer_method?: string | null;
    protection_standards?: string[] | null;
    exceptions?: string[] | null;
  };

  // Step 5
  retention: {
    storageType?: string[];
    storageMethod?: string[];
    retentionPeriod: string;
    department?: string[];
    deletionMethod?: string;

    usage_purpose?: string[] | null;
    denialNote?: string | null;
  };

  // Step 6
  security?: {
    organizational?: string;
    technical?: string;
    physical?: string;
    accessType?: string;
    responsibility_def?: string;
    audit_trail?: string;
  };

  // Processor
  processors?: {
    name: string;
    address?: string;
    security?: {
      organizational?: string;
      technical?: string;
      physical?: string;
      accessType?: string;
      responsibility_def?: string;
      audit_trail?: string;
    };
  }[];

  // UI
  risk: string;
  status: string;

  // History
  history?: {
    action: "edit" | "create";
    by: string;
    date: string;
    time: string;
  }[];
}
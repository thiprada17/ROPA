export interface RopaItem {
  id: string;
  owner_name?: string;

  // Step 1
  activity: string;
  purpose: string;
  purposeDetail?: string;
  dataOwner?: string;
  parties: string[];

  // Step 1 detail 
  step1?: {
    dataOwner?: string;
    processActivity?: string;
    processActivityName?: string;
    processingPurpose?: string;
    departmentId?: string;
    departmentName?: string;
  };

  // Step 2 
  step2?: {
    dataClass?: string;
    description?: string;
    categories?: string[];
    dataType?: string;
    methods?: string[];
    dataSource?: string;
  };

  // Step 3
  legal?: {
    basis?: string[];
    secondaryCategory?: string[];
    minorConsent?: {
      under10?: string;
      age10to20?: string;
    };
  };

  // Step 3 detail 
  step3?: {
    primaryBases?: string[];
    supplementaryBases?: string[];
    minorConsent?: {
      under10?: string;
      age10to20?: string;
    };
  };

  // Step 4
  transfer?: {
    is_transfer?: boolean | null;
    destination_country?: string | null;
    affiliated_company?: string | null;
    transfer_method?: string | null;
    protection_standard?: string | null;
    exceptions?: string[];
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
    id: string;
    activity_id: string;
    measures_id: string;
    name: string;
    detail?: string | null;
  }[];

  // Step 7
processors?: {
  id: string;
  activity_id?: string;
  processor_id?: string;
  access_type?: string | null;
  accessType?: string | null;
  data_category_accessed?: string | null;
  dataCategoryAccessed?: string | null;
  note?: string | null;
  name?: string;
  address?: string | null;
  processorId?: string;
  securitySelected?: Record<string, boolean>;
  securityDetails?: Record<string, string>;
  processors?: {
    id: string;
    name: string;
    address?: string | null;
  };
  processor_security_measures?: {
    id: string;
    activity_processor_id: string;
    type: string;
    detail?: string | null;
  }[];
}[];

step7?: {
  processors?: {
    id: string;
    activity_id?: string;
    processor_id?: string;
    access_type?: string | null;
    accessType?: string | null;
    data_category_accessed?: string | null;
    dataCategoryAccessed?: string | null;
    note?: string | null;
    name?: string;
    address?: string | null;
    processorId?: string;
    securitySelected?: Record<string, boolean>;
    securityDetails?: Record<string, string>;
    processors?: {
      id: string;
      name: string;
      address?: string | null;
    };
    processor_security_measures?: {
      id: string;
      activity_processor_id: string;
      type: string;
      detail?: string | null;
    }[];
  }[];
};

    // Date
  date?: string;
  submitted_at?: string;
  created_at?: string;
  updated_at?: string;

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
import { trace } from "console";
import { access } from "fs";

// data/ropaMock.ts
export const ropaMock = [
  {
    id: 1,
    activity: "รายชื่อผู้ผ่านเข้ารอบการสัมภาษณ์งานประจำปี 2569",
    parties: ["HR", "Finance"],
    purpose: "เก็บรายชื่อผู้ผ่านเข้ารอบการสัมภาษณ์งาน",
    purposeDetail: "ใช้สำหรับดำเนินกระบวนการคัดเลือกผู้สมัครและจัดทำรายชื่อผู้มีสิทธิสัมภาษณ์",
    legal: {
      basis: ["สัญญา", "ประโยชน์โดยชอบด้วยกฎหมาย"],
      secondaryCategory: ["ข้อมูลประกอบการพิจารณา"],

      minorConsent: {
        under10: "ต้องได้รับความยินยอมจากผู้ปกครอง",
        age10to20: "ต้องได้รับความยินยอมร่วม",
      },
    },
    // retention: "2 เดือน",
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "2 เดือน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Critical",
    status: "Pending",
    dataOwner: "ผู้สมัครงาน",

    dataSubjects: ["ผู้สมัครงาน"],
    dataDescription: "ชื่อ-นามสกุล, เบอร์โทรศัพท์, อีเมล, Resume",
    dataCategories: ["ข้อมูลส่วนบุคคลทั่วไป"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์", "เอกสาร"],
    acquisitionMethods: ["แบบฟอร์มสมัครงานออนไลน์"],
    dataSources: ["ผู้สมัครโดยตรง"],

    security: {
      organizational: "กำหนดสิทธิ์เฉพาะ HR",
      technical: "เข้ารหัสไฟล์ Resume",
      physical: "เก็บใน Server ภายใน",
      accessType: "อ่านและจัดเก็บ",
      responsibility_def: "บริษัทระบบ ATS ทำหน้าที่เป็นผู้ประมวลผลข้อมูลเท่านั้น โดยดำเนินการตามคำสั่งของฝ่าย HR และไม่มีสิทธิ์ในการใช้ข้อมูลเพื่อวัตถุประสงค์อื่นใด",
      audit_trail: "มีการบันทึกการเข้าถึงและกิจกรรมที่เกี่ยวข้องกับข้อมูลผู้สมัครงานทั้งหมด เพื่อให้สามารถตรวจสอบย้อนหลังได้ในกรณีที่มีข้อสงสัยหรือเหตุการณ์ที่ไม่คาดคิดเกิดขึ้น",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [
      {
        name: "บริษัทระบบ ATS",
        address: "123 ถนนเทคโนโลยี กรุงเทพฯ",
        security: {
          organizational: "จำกัดสิทธิ์เฉพาะทีม HR",
          technical: "เข้ารหัสข้อมูลและการควบคุมการเข้าถึง",
          physical: "ศูนย์ข้อมูลที่มีการรักษาความปลอดภัยสูง",
          accessType: "อ่านและจัดเก็บ",
          responsibility_def: "บริษัทระบบ ATS ทำหน้าที่เป็นผู้ประมวลผลข้อมูลเท่านั้น โดยดำเนินการตามคำสั่งของฝ่าย HR และไม่มีสิทธิ์ในการใช้ข้อมูลเพื่อวัตถุประสงค์อื่นใด",
          audit_trail: "มีการบันทึกการเข้าถึงและกิจกรรมที่เกี่ยวข้องกับข้อมูลผู้สมัครงานทั้งหมด เพื่อให้สามารถตรวจสอบย้อนหลังได้ในกรณีที่มีข้อสงสัยหรือเหตุการณ์ที่ไม่คาดคิดเกิดขึ้น",
        },
      },
    ],

   history: [
  {
    action: "edit" as const,
    by: "นายแก้ ข้อมูล",
    date: "15/04/2026",
    time: "1:36 AM",
  },
  {
    action: "create" as const,
    by: "นายแก้ ข้อมูล",
    date: "14/04/2026",
    time: "1:36 AM",
  },
],
  },

  {
    id: 2,
    activity: "รายได้ของฝ่ายการตลาดประจำปี 2569",
    parties: ["HR", "Marketing"],
    purpose: "เพื่อแจกแจงรายได้ของฝ่ายการตลาด",
    purposeDetail: "ใช้สำหรับจัดทำรายงานวิเคราะห์ผลประกอบการ",
    legal: {
      basis: ["หน้าที่ตามกฎหมาย"],
      secondaryCategory: ["ข้อมูลพนักงาน"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "1 ปี",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "At Risk",
    status: "Complete",
    dataOwner: "พนักงาน",

    dataSubjects: ["พนักงาน"],
    dataDescription: "เงินเดือน โบนัส ค่าคอมมิชชั่น",
    dataCategories: ["ข้อมูลทางการเงิน"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["ระบบบัญชี"],
    dataSources: ["ฝ่ายการเงิน"],

    security: {
      organizational: "จำกัดสิทธิ์เฉพาะผู้บริหาร",
      technical: "Role-based access",
      physical: "Server ภายใน",
      accessType: "อ่านอย่างเดียว",
      responsibility_def: "ข้อมูลรายได้ของพนักงานถูกจัดเก็บและประมวลผลโดยฝ่ายการเงินเท่านั้น โดยมีการจำกัดสิทธิ์การเข้าถึงข้อมูลนี้เฉพาะผู้บริหารระดับสูงที่มีความจำเป็นต้องใช้ข้อมูลเพื่อวัตถุประสงค์ในการวิเคราะห์ผลประกอบการและการตัดสินใจทางธุรกิจเท่านั้น",
      audit_trail: "มีการบันทึกการเข้าถึงและกิจกรรมที่เกี่ยวข้องกับข้อมูลรายได้ของพนักงานทั้งหมด เพื่อให้สามารถตรวจสอบย้อนหลังได้ในกรณีที่มีข้อสงสัยหรือเหตุการณ์ที่ไม่คาดคิดเกิดขึ้น",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 3,
    activity: "รายชื่อผู้เข้าร่วมกิจกรรม outing",
    parties: ["HR"],
    purpose: "เก็บข้อมูลผู้เข้าร่วมกิจกรรม",
    purposeDetail: "ใช้สำหรับจัดการจำนวนผู้เข้าร่วมและอาหาร",
    legal: {
      basis: ["ความยินยอม"],
      secondaryCategory: ["ข้อมูลทั่วไป"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "10 วัน",
      department: ["HR"],
      deletionMethod: "",
      usage_purpose: null,
      denialNote: "ไม่รู้จ้าา",
    },
    risk: "Stable",
    status: "Revision",
    dataOwner: "พนักงาน",

    dataSubjects: ["พนักงาน"],
    dataDescription: "ชื่อ, แผนก, เบอร์โทร",
    dataCategories: ["ข้อมูลทั่วไป"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["Google Form"],
    dataSources: ["พนักงานโดยตรง"],

    security: {
      organizational: "HR เข้าถึงได้",
      technical: "Google Workspace Access",
      physical: "Cloud",
      accessType: "อ่านและจัดเก็บ",
      responsibility_def: "ข้อมูลรายชื่อผู้เข้าร่วมกิจกรรม outing ถูกจัดเก็บและประมวลผลโดยฝ่าย HR เท่านั้น โดยมีการจำกัดสิทธิ์การเข้าถึงข้อมูลนี้เฉพาะทีม HR ที่รับผิดชอบในการจัดการกิจกรรมเท่านั้น และไม่มีการใช้ข้อมูลนี้เพื่อวัตถุประสงค์อื่นใดนอกเหนือจากการจัดการกิจกรรม outing",
      audit_trail: "มีการบันทึกการเข้าถึงและกิจกรรมที่เกี่ยวข้องกับข้อมูลรายชื่อผู้เข้าร่วมกิจกรรม outing ทั้งหมดในระบบ Google Workspace เพื่อให้สามารถตรวจสอบย้อนหลังได้ในกรณีที่มีข้อสงสัยหรือเหตุการณ์ที่ไม่คาดคิดเกิดขึ้น",
    },

    transfer: {
      is_transfer: "มี",
      destination_country: "สหรัฐอเมริกา",
      affiliated_company: "บริษัทระบบจัดการกิจกรรม",
      transfer_method: "API integration",
      protection_standards: ["มาตรฐานความปลอดภัยข้อมูลสากล (เช่น ISO 27001)"],
      exceptions:["ไม่มีการโอนข้อมูลที่มีความละเอียดอ่อนหรือข้อมูลส่วนบุคคลที่ไม่จำเป็นต้องใช้สำหรับการจัดการกิจกรรม outing"],
    },

    processors: [],
    history: [
  {
    action: "create" as const,
    by: "นายสร้าง ข้อมูล",
    date: "15/04/2026",
    time: "1:36 AM",
  },
],
  },

  {
    id: 4,
    activity: "ข้อมูลพนักงานใหม่ประจำปี",
    parties: ["HR", "IT"],
    purpose: "บันทึกข้อมูลพนักงานใหม่",
    purposeDetail: "ใช้ในการ onboarding และสร้างบัญชีผู้ใช้ระบบ",
    legal: {
      basis: ["สัญญา"],
      secondaryCategory: ["ข้อมูลส่วนบุคคลทั่วไป"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "6 เดือน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Safe",
    status: "Complete",
    dataOwner: "พนักงาน",

    dataSubjects: ["พนักงาน"],
    dataDescription: "ชื่อ, เลขบัตรประชาชน, อีเมลบริษัท",
    dataCategories: ["ข้อมูลส่วนบุคคลทั่วไป"],
    dataTypes: ["เอกสาร", "ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["เอกสาร onboarding"],
    dataSources: ["ฝ่าย HR"],

    security: {
      organizational: "HR และ IT",
      technical: "SSO + Access Control",
      physical: "Server ภายใน",
      accessType: "อ่านและจัดเก็บ",
      responsibility_def: "ข้อมูลพนักงานใหม่ถูกจัดเก็บและประมวลผลโดยฝ่าย HR และ IT ร่วมกัน โดยฝ่าย HR รับผิดชอบในการจัดการข้อมูลส่วนบุคคลและเอกสาร onboarding ในขณะที่ฝ่าย IT รับผิดชอบในการสร้างบัญชีผู้ใช้ระบบและการจัดการสิทธิ์การเข้าถึงข้อมูลนี้ โดยทั้งสองฝ่ายจะดำเนินการตามคำสั่งของฝ่ายบริหารและไม่มีสิทธิ์ในการใช้ข้อมูลนี้เพื่อวัตถุประสงค์อื่นใดนอกเหนือจากการ onboarding พนักงานใหม่และการจัดการบัญชีผู้ใช้ระบบเท่านั้น",
      audit_trail: "มีการบันทึกการเข้าถึงและกิจกรรมที่เกี่ยวข้องกับข้อมูลพนักงานใหม่ทั้งหมดในระบบ HR และ IT เพื่อให้สามารถตรวจสอบย้อนหลังได้ในกรณีที่มีข้อสงสัยหรือเหตุการณ์ที่ไม่คาดคิดเกิดขึ้น",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 5,
    activity: "ข้อมูลการลาป่วยพนักงาน",
    parties: ["HR"],
    purpose: "ติดตามสถิติการลาป่วย",
    purposeDetail: "ใช้สำหรับวิเคราะห์สุขภาพและ attendance",
    legal: {
      basis: ["หน้าที่ตามกฎหมาย"],
      secondaryCategory: ["ข้อมูลพนักงาน"],
      minorConsent: {
        under10: "ต้องได้รับความยินยอมจากผู้ปกครอง",
        age10to20: "ต้องได้รับความยินยอมร่วม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "6 เดือน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "At Risk",
    status: "Pending",
    dataOwner: "พนักงาน",

    dataSubjects: ["พนักงาน"],
    dataDescription: "วันที่ลา, ใบรับรองแพทย์",
    dataCategories: ["ข้อมูลอ่อนไหว"],
    dataTypes: ["เอกสาร"],
    acquisitionMethods: ["แบบฟอร์มลา"],
    dataSources: ["พนักงาน"],

    security: {
      organizational: "เฉพาะ HR",
      technical: "restricted access",
      physical: "locked file storage",
      accessType: "อ่านและจัดเก็บ",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 6,
    activity: "รายชื่อผู้สมัครงานตำแหน่ง Developer ประจำปี 2569",
    parties: ["HR", "IT"],
    purpose: "คัดเลือกผู้สมัครงานตำแหน่ง Developer",
    purposeDetail: "ใช้สำหรับ screening และ technical interview",
    legal: {
      basis: ["สัญญา"],
      secondaryCategory: ["ข้อมูลพนักงาน"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "2 เดือน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Critical",
    status: "Revision",
    dataOwner: "ผู้สมัครงาน",

    dataSubjects: ["ผู้สมัครงาน"],
    dataDescription: "Resume, Portfolio, GitHub",
    dataCategories: ["ข้อมูลส่วนบุคคลทั่วไป"],
    dataTypes: ["เอกสาร", "ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["career website"],
    dataSources: ["ผู้สมัคร"],

    security: {
      organizational: "HR + IT",
      technical: "resume encryption",
      physical: "cloud",
      accessType: "อ่านและจัดเก็บ",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [
      {
        name: "LinkedIn Talent",
        address: "",
        security: {
          organizational: "",
          technical: "",
          physical: "",
          accessType: "คัดกรอง",
          responsibility_def: "",
          audit_trail: "",
        },
      },
    ],

    history: [],
  },

  {
    id: 7,
    activity: "ข้อมูลลูกค้าประจำปี 2568",
    parties: ["Sales", "Marketing"],
    purpose: "วิเคราะห์พฤติกรรมลูกค้า",
    purposeDetail: "ใช้ทำ segmentation และ campaign",
    legal: {
      basis: ["ความยินยอม", "ประโยชน์โดยชอบ"],
      secondaryCategory: ["ข้อมูลทั่วไป"],
      minorConsent: {
        under10: "ต้องได้รับความยินยอมจากผู้ปกครอง",
        age10to20: "ต้องได้รับความยินยอมร่วม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "2 ปี",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Stable",
    status: "Complete",
    dataOwner: "ลูกค้า",

    dataSubjects: ["ลูกค้า"],
    dataDescription: "ชื่อ, อีเมล, ประวัติการซื้อ",
    dataCategories: ["ข้อมูลลูกค้า"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["CRM System"],
    dataSources: ["Sales Team"],

    security: {
      organizational: "",
      technical: "",
      physical: "",
      accessType: "",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 8,
    activity: "ข้อมูลการชำระเงินลูกค้า",
    parties: ["Finance"],
    purpose: "ตรวจสอบธุรกรรมการเงิน",
    purposeDetail: "ใช้สำหรับ reconciliation",
    legal: {
      basis: ["หน้าที่ตามกฎหมาย"],
      secondaryCategory: ["ข้อมูลลูกค้า"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "1 ปี",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Critical",
    status: "Pending",
    dataOwner: "ลูกค้า",

    dataSubjects: ["ลูกค้า"],
    dataDescription: "ยอดเงิน, transaction id",
    dataCategories: ["ข้อมูลการเงิน"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["payment gateway"],
    dataSources: ["ระบบชำระเงิน"],

    security: {
      organizational: "",
      technical: "",
      physical: "",
      accessType: "",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    history: [],
  },

  {
    id: 9,
    activity: "แบบสอบถามความพึงพอใจลูกค้า",
    parties: ["Marketing"],
    purpose: "ปรับปรุงบริการ",
    purposeDetail: "ใช้วิเคราะห์ feedback",
    legal: {
      basis: ["ความยินยอม"],
      secondaryCategory: ["ข้อมูลทั่วไป"],
      minorConsent: {
        under10: "ต้องได้รับความยินยอมจากผู้ปกครอง",
        age10to20: "ต้องได้รับความยินยอมร่วม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "6 เดือน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Safe",
    status: "Complete",
    dataOwner: "ลูกค้า",

    dataSubjects: ["ลูกค้า"],
    dataDescription: "คะแนนความพึงพอใจ ความคิดเห็น",
    dataCategories: ["ข้อมูลความคิดเห็น"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["survey form"],
    dataSources: ["ลูกค้า"],

    security: {
      organizational: "",
      technical: "",
      physical: "",
      accessType: "",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 10,
    activity: "ข้อมูลการอบรมพนักงานประจำปี 2569",
    parties: ["HR", "Training"],
    purpose: "ติดตามการพัฒนาองค์กร",
    purposeDetail: "ใช้ติดตาม progress การเรียนรู้",
    legal: {
      basis: ["ประโยชน์โดยชอบ"],
      secondaryCategory: ["ข้อมูลทั่วไป"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "1 ปี",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Stable",
    status: "Revision",
    dataOwner: "พนักงาน",

    dataSubjects: ["พนักงาน"],
    dataDescription: "หลักสูตร วันที่เข้าอบรม คะแนน",
    dataCategories: ["ข้อมูลพนักงาน"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["LMS"],
    dataSources: ["ฝ่าย Training"],

    security: {
      organizational: "",
      technical: "",
      physical: "",
      accessType: "",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 11,
    activity: "ข้อมูลการเข้าใช้งานระบบ",
    parties: ["IT"],
    purpose: "ตรวจสอบความปลอดภัย",
    purposeDetail: "ใช้ audit และ security monitoring",
    legal: {
      basis: ["ประโยชน์โดยชอบ"],
      secondaryCategory: ["ข้อมูลพนักงาน"],
      minorConsent: {
        under10: "ไม่ต้องได้รับความยินยอม",
        age10to20: "ไม่ต้องได้รับความยินยอม",
      }
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "30 วัน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "Critical",
    status: "Complete",
    dataOwner: "ผู้ใช้งานระบบ",

    dataSubjects: ["พนักงาน"],
    dataDescription: "IP Address, Login time",
    dataCategories: ["log data"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["system log"],
    dataSources: ["application server"],

    security: {
      organizational: "",
      technical: "",
      physical: "",
      accessType: "",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },

  {
    id: 12,
    activity: "รายชื่อผู้เข้าร่วมสัมมนา",
    parties: ["Marketing", "HR"],
    purpose: "จัดการกิจกรรมสัมมนา",
    purposeDetail: "ใช้สำหรับเช็คชื่อและติดตามผล",
    legal: {
      basis: ["ความยินยอม"],
      secondaryCategory: ["ข้อมูลทั่วไป"],
      minorConsent: {
        under10: "ต้องได้รับความยินยอมจากผู้ปกครอง",
        age10to20: "ต้องได้รับความยินยอมร่วม",
      },
    },
    retention: {
      storageType: [],
      storageMethod: [],
      retentionPeriod: "15 วัน",
      department: ["HR", "IT"],
      deletionMethod: "",
      usage_purpose: ["การตลาด"],
      denialNote: null,
    },
    risk: "At Risk",
    status: "Pending",
    dataOwner: "ผู้เข้าร่วม",

    dataSubjects: ["ลูกค้า", "พนักงาน"],
    dataDescription: "ชื่อ, เบอร์โทร, อีเมล",
    dataCategories: ["ข้อมูลทั่วไป"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["registration form"],
    dataSources: ["ผู้เข้าร่วม"],

    security: {
      organizational: "",
      technical: "",
      physical: "",
      accessType: "",
      responsibility_def: "",
      audit_trail: "",
    },

    transfer: {
      is_transfer: "ไม่มี",
      destination_country: null,
      affiliated_company: null,
      transfer_method: null,
      protection_standards: null,
      exceptions: null,
    },

    processors: [],
    history: [],
  },
];
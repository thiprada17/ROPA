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
    retention: "2 เดือน",
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
    },

    transfer: {
      international: "ไม่มี",
    },

    processors: [
      {
        name: "บริษัทระบบ ATS",
        accessType: "อ่านและจัดเก็บ",
        note: "ใช้สำหรับจัดการใบสมัคร",
      },
    ],

    history: ["สร้างรายการเมื่อ 01/01/2569"],
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
    retention: "1 ปี",
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
    },

    transfer: {
      international: "ไม่มี",
    },

    processors: [],
    history: ["อนุมัติแล้ว 05/01/2569"],
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
    retention: "10 วัน",
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
    },

    transfer: {
      international: "ไม่มี",
    },

    processors: [],
    history: ["รอแก้ไขข้อมูล"],
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
    retention: "6 เดือน",
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
    },

    transfer: {
      international: "ไม่มี",
    },

    processors: [],
    history: ["เสร็จสิ้น"],
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

    retention: "3 เดือน",
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
    },

    transfer: {
      international: "ไม่มี",
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
    retention: "2 เดือน",
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
    },

    transfer: {
      international: "ไม่มี",
    },

    processors: [
      {
        name: "LinkedIn Talent",
        accessType: "คัดกรอง",
        note: "ตรวจสอบ profile",
      },
    ],

    history: ["แก้ไขเมื่อ 02/01/2569"],
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
    retention: "2 ปี",
    risk: "Stable",
    status: "Complete",
    dataOwner: "ลูกค้า",

    dataSubjects: ["ลูกค้า"],
    dataDescription: "ชื่อ, อีเมล, ประวัติการซื้อ",
    dataCategories: ["ข้อมูลลูกค้า"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["CRM System"],
    dataSources: ["Sales Team"],
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
    retention: "1 ปี",
    risk: "Critical",
    status: "Pending",
    dataOwner: "ลูกค้า",

    dataSubjects: ["ลูกค้า"],
    dataDescription: "ยอดเงิน, transaction id",
    dataCategories: ["ข้อมูลการเงิน"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["payment gateway"],
    dataSources: ["ระบบชำระเงิน"],
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
    retention: "6 เดือน",
    risk: "Safe",
    status: "Complete",
    dataOwner: "ลูกค้า",

    dataSubjects: ["ลูกค้า"],
    dataDescription: "คะแนนความพึงพอใจ ความคิดเห็น",
    dataCategories: ["ข้อมูลความคิดเห็น"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["survey form"],
    dataSources: ["ลูกค้า"],
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
    retention: "1 ปี",
    risk: "Stable",
    status: "Revision",
    dataOwner: "พนักงาน",

    dataSubjects: ["พนักงาน"],
    dataDescription: "หลักสูตร วันที่เข้าอบรม คะแนน",
    dataCategories: ["ข้อมูลพนักงาน"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["LMS"],
    dataSources: ["ฝ่าย Training"],
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
    retention: "30 วัน",
    risk: "Critical",
    status: "Complete",
    dataOwner: "ผู้ใช้งานระบบ",

    dataSubjects: ["พนักงาน"],
    dataDescription: "IP Address, Login time",
    dataCategories: ["log data"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["system log"],
    dataSources: ["application server"],
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
    retention: "15 วัน",
    risk: "At Risk",
    status: "Pending",
    dataOwner: "ผู้เข้าร่วม",

    dataSubjects: ["ลูกค้า", "พนักงาน"],
    dataDescription: "ชื่อ, เบอร์โทร, อีเมล",
    dataCategories: ["ข้อมูลทั่วไป"],
    dataTypes: ["ข้อมูลอิเล็กทรอนิกส์"],
    acquisitionMethods: ["registration form"],
    dataSources: ["ผู้เข้าร่วม"],
  },
];
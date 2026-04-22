export type UserRole = "Admin" | "DPO" | "Viewer" | "User";
export type UserStatus = "Active" | "InActive" | "Locked";
export type LockStatus = "Locked" | "Unlocked";

export interface UserData {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  position: string;
  department: string;
  team: string;
  role: UserRole;
  accountStatus: UserStatus;
  lockStatus: LockStatus;
  createdAt: string;
}

export const userMock: UserData[] = [
  {
    id: "1",
    fullName: "ประเสริฐ โต้ตอบ",
    email: "Som1@gmail.com",
    password: "somchai234",
    phone: "0812364839",
    position: "ผจก.ฝ่าย",
    department: "HR",
    team: "HR Manager",
    role: "Admin",
    accountStatus: "Active",
    lockStatus: "Locked",
    createdAt: "2026-04-01",
  },
  {
    id: "2",
    fullName: "มานะพัฒนา ใจดี",
    email: "Som2@gmail.com",
    password: "somying234",
    phone: "0939579902",
    position: "ผจก.ฝ่าย",
    department: "IT",
    team: "Software Developer",
    role: "DPO",
    accountStatus: "InActive",
    lockStatus: "Unlocked",
    createdAt: "2026-04-01",
  },
  {
    id: "3",
    fullName: "สมศักดิ์ ใจกล้า",
    email: "Som3@gmail.com",
    password: "somyang234",
    phone: "0837285928",
    position: "พนักงาน",
    department: "Marketing",
    team: "Digital Marketing",
    role: "Viewer",
    accountStatus: "Active",
    lockStatus: "Unlocked",
    createdAt: "2026-04-02",
  },
  {
    id: "4",
    fullName: "สมหมาย ใจดี",
    email: "Som4@gmail.com",
    password: "sornmanee234",
    phone: "0849279047",
    position: "พนักงาน",
    department: "Finance",
    team: "Accountant",
    role: "User",
    accountStatus: "Active",
    lockStatus: "Unlocked",
    createdAt: "2026-04-05",
  },
];

export const departments = ["HR", "IT", "Marketing", "Finance", "Legal", "Operations", "ขาย", "กฎหมาย", "จัดซื้อ", "บริการลูกค้า"];
export const teams = ["HR Manager", "Software Developer", "Digital Marketing", "Accountant", "Legal Counsel", "Operations Manager"];
export const roles: UserRole[] = ["Admin", "DPO", "Viewer", "User"];
export const lockStatuses: LockStatus[] = ["Locked", "Unlocked"];
export const accountStatuses: UserStatus[] = ["Active", "InActive", "Locked"];
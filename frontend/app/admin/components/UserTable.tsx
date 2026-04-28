"use client";
import React from "react";
import { UserData, UserRole, UserStatus, LockStatus } from "../data/userMock";
import { EllipsisVertical, Lock, Unlock, ShieldCheck, Eye, User, UserCog } from "lucide-react";

const roleMap: Record<UserRole, { color: string; icon: React.ReactNode }> = {
    Admin: { color: "border border-[#03369D] text-[#03369D]", icon: <UserCog size={12} /> },
    DPO: { color: "border border-[#1a3a8f] text-[#1a3a8f]", icon: <ShieldCheck size={12} /> },
    Viewer: { color: "border border-[#5E84DB] text-[#5E84DB]", icon: <Eye size={12} /> },
    User: { color: "border border-gray-400 text-gray-500", icon: <User size={12} /> },
};

const statusMap: Record<UserStatus, { color: string; dot: string }> = {
    Active: { color: "bg-[#03369D] text-white", dot: "bg-white" },
    InActive: { color: "bg-gray-200 text-gray-600", dot: "bg-gray-500" },
    Locked: { color: "bg-[#F0AFBE] text-[#BD263F]", dot: "bg-[#BD263F]" },
};

const lockMap: Record<LockStatus, { color: string; icon: React.ReactNode }> = {
    Locked: { color: "text-[#BD263F]", icon: <Lock size={12} /> },
    Unlocked: { color: "text-[#228679]", icon: <Unlock size={12} /> },
};

const col = "1fr 1.2fr 1.3fr 0.8fr 1fr 0.7fr 1.2fr 1fr 1fr 1fr 0.15fr";
//                         
const headers = [
    "ชื่อ-นามสกุล", "Email", "Password", "เบอร์โทรศัพท์",
    "ที่อยู่", "ฝ่าย", "ตำแหน่ง",
    "บทบาทผู้เข้าถึงข้อมูล", "สถานะการล็อกบัญชี", "สถานะบัญชี", ""
];

const isHashed = (pw: string) => pw.startsWith("$2b$") || pw.startsWith("$2a$");

interface Props {
    data: UserData[];
    onRowClick: (user: UserData) => void;
}

export default function UserTable({ data, onRowClick }: Props) {
    return (
        <div className="bg-white rounded-xl shadow p-3 overflow-x-auto">
            <div className="min-w-[900px]">
                <div className="w-full flex flex-col">

                    {/* Header */}
                    <div
                        className="grid gap-2 mb-2 pl-3 pr-1 text-center text-[11px]"
                        style={{ gridTemplateColumns: col }}
                    >
                        {headers.map((h, i) => (
                            <div key={i} className={`px-2 py-[11px] rounded-[6px] ${h ? "bg-[#03369D] text-white" : ""}`}>
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* Body */}
                    <div className="flex flex-col font-prompt">
                        {data.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-[8px]">ไม่พบข้อมูล</div>
                        ) : (
                            data.map((item) => (
                                <div
                                    key={item.id}
                                    className="grid items-center pl-4 pr-1 py-3 border-b hover:bg-gray-50 transition cursor-pointer text-[11px]"
                                    style={{ gridTemplateColumns: col }}
                                    onClick={() => onRowClick(item)}
                                >
                                    {/* ชื่อ-นามสกุล */}
                                    <div className="truncate font-medium text-[12px] text-gray-800 pr-2">{item.fullName || "-"}</div>

                                    {/* Email */}
                                    <div className="truncate text-[12px] text-gray-600 pr-2">{item.email}</div>

                                    {/* Password — plain text ตามภาพ */}
                                    {/* <div className="truncate text-[12px] text-gray-600 pr-2">{item.password}</div> */}
                                    <div className="truncate text-[12px] text-gray-600 pr-2" 
                                    title={isHashed(item.password) ? "Password hidden" : item.password}>
                                        {isHashed(item.password) ? "********" : item.password}
                                    </div>

                                    {/* เบอร์โทร */}
                                    <div className="text-gray-600 text-[12px]">{item.phone}</div>

                                    {/* ที่อยู่ — truncate พร้อม tooltip */}
                                    <div className="truncate text-gray-500 pr-1 text-[12px]" title={item.team}>
                                        มม.เกาะรังสิต...
                                    </div>

                                    {/* ฝ่าย */}
                                    <div className="text-gray-600 text-[12px]">{item.department || "-"}</div>

                                    {/* ตำแหน่ง */}
                                    <div className="truncate text-gray-600 text-[12px]">{item.team}</div>

                                    {/* บทบาท (Role) */}
                                    <div className="flex justify-center">
                                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${roleMap[item.role].color}`}>
                                            {roleMap[item.role].icon}
                                            {item.role}
                                        </span>
                                    </div>

                                    {/* สถานะการล็อก */}
                                    <div className="flex justify-center">
                                        <span className={`flex items-center gap-1 text-[10px] font-medium ${lockMap[item.lockStatus].color}`}>
                                            {lockMap[item.lockStatus].icon}
                                            {item.lockStatus}
                                        </span>
                                    </div>

                                    {/* สถานะบัญชี */}
                                    <div className="flex justify-center">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${statusMap[item.accountStatus].color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusMap[item.accountStatus].dot}`} />
                                            {item.accountStatus}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    {/* <div className="flex justify-end">
                                        <button
                                            className="p-1 hover:bg-gray-200 rounded"
                                            onClick={(e) => { e.stopPropagation(); onRowClick(item); }}
                                        >
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </div> */}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
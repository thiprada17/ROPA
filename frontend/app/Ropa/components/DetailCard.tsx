// app/Ropa/components/DetailCard.tsx
"use client";
import {
    X,
    Users,
    Clock,
    Building2,
    Scale,
    Columns2,
    MoreHorizontal,
    Shield,
    UserCog,
    ChevronsUp,
    ChevronUp,
    ChevronsDown,
    ChevronDown,
    ClockFading,
    CheckCircle,
    AlertTriangle,
    FolderOpen,
    ArrowLeftRight,
    Book,
    Folder,
    Trash2,
    Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import TabLegal from "./tabs/TabLegal";
import TabDataDetails from "./tabs/TabDataDetails";
import TabRetention from "./tabs/TabRetention";
import TabSecurity from "./tabs/TabSecurity";
import TabTransfer from "./tabs/TabTransfer";
import TabProcessor from "./tabs/TabProcessor";
import TabHistory from "./tabs/TabHistory";
import TabApprove from "./tabs/TabApprove";
import Link from "next/link";
import { RopaItem } from "../types/ropa";

const riskMap: Record<string, { color: string; icon: React.ReactNode }> = {
    Critical: {
        color: "bg-[#F0AFBE] text-[#BD263F]",
        icon: <ChevronsUp size={12} />,
    },
    "At Risk": {
        color: "bg-[#F3E3AE] text-[#A37D00]",
        icon: <ChevronUp size={12} />,
    },
    Stable: {
        color: "bg-[#D1E7F0] text-[#0078A3]",
        icon: <ChevronsDown size={12} />,
    },
    Safe: {
        color: "bg-[#B5DDD8] text-[#228679]",
        icon: <ChevronDown size={12} />,
    },
};

const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
    Pending: {
        color: "border border-gray-300 text-[#03369D] bg-transparent",
        icon: <ClockFading size={14} />,
    },
    Complete: {
        color: "border border-gray-300 text-[#1C635A] bg-transparent",
        icon: <CheckCircle size={14} />,
    },
    Revision: {
        color: "border border-gray-300 text-[#AC273C] bg-transparent",
        icon: <AlertTriangle size={14} />,
    },
};

const badgeBase =
    "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap";

type Tab =
    | "dataDetails"
    | "legal"
    | "transfer"
    | "retention"
    | "security"
    | "processor"
    | "history"
    | "approve";

const Tag = ({ label }: { label: string }) => (
    <span className="bg-[#DFE9FF] text-[#03369D] px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap">
        {label}
    </span>
);

const InfoRow = ({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 py-2">
        <div className="text-[#A6A6A6] mt-0.5 shrink-0">{icon}</div>

        {/* กำหนด grid */}
        <div className="grid grid-cols-[170px_1fr] gap-2 flex-1">
            <p className="text-[11px] text-[#A6A6A6]">{label}</p>
            <div className="flex flex-wrap gap-1.5 text-[#1C1B1F]">{children}</div>
        </div>
    </div>
);

const InfoRowPlain = ({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) => (
    <div className="grid grid-cols-[180px_1fr] gap-2 py-2">
        <p className="text-[11px] text-[#A6A6A6]">{label}</p>
        <div className="flex flex-wrap gap-1.5 text-[#1C1B1F]">{children}</div>
    </div>
);

const BulletRow = ({
    label,
    children,
    indent = false,
    labelClassName,
}: {
    label: string;
    children: React.ReactNode;
    indent?: boolean;
    labelClassName?: string;
}) => (
    <div className={`flex items-start gap-2 ${indent ? "ml-4" : ""}`}>
        {/* bullet */}
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 shrink-0" />

        {/* content */}
        <div className="grid grid-cols-[165px_1fr] gap-2 w-full">
            <p className={`text-[11px] ${labelClassName || "text-[#A6A6A6]"}`}>{label}</p>
            <div className="flex flex-wrap gap-1.5 text-[#1C1B1F]">{children}</div>
        </div>
    </div>
);

export const display = (val?: string | string[] | null) => {
    const empty = (
        <span className="text-[11px] text-[#A6A6A6] italic">ไม่มีข้อมูล</span>
    );

    if (!val) return empty;

    if (Array.isArray(val)) {
        return val.length > 0 ? val.join(", ") : empty;
    }

    return val.trim() !== "" ? val : empty;
};

interface DetailCardProps {
    item: RopaItem | null;
    onClose: () => void;
    role?: "DPO" | "User" | "Admin" | "Viewer";
    existingComments?: { username: string; text: string }[];
    onStatusChange?: (itemId: string, newStatus: string) => void;
    onAddComment?: (itemId: string, comment: { username: string; text: string }) => void;
}

const RenderValue = ({ value }: { value?: string[] }) => {
    if (!value || value.length === 0) {
        return <span className="text-[#A6A6A6]">ไม่มีข้อมูล</span>;
    }

    if (value.length === 1) {
        return <span>{value[0]}</span>;
    }

    return (
        <>
            {value.map((v, i) => (
                <Tag key={i} label={v} />
            ))}
        </>
    );
};

const role =
    typeof window !== "undefined"
        ? (localStorage.getItem("role") as "DPO" | "User" | "Viewer" | "Admin")
        : undefined;

export default function DetailCard({ item, onClose, role, existingComments, onStatusChange, onAddComment }: DetailCardProps) {
    
    const [activeTab, setActiveTab] = useState<Tab>("dataDetails");
    const [showMenu, setShowMenu] = useState(false);
    const [isApprovingEdit, setIsApprovingEdit] = useState(false);
    const [approveStatus, setApproveStatus] = useState(item?.status ?? "");
    const [approveComments, setApproveComments] = useState<{ username: string; text: string }[]>([]);

    const currentUser = typeof window !== "undefined"
        ? { username: localStorage.getItem("username") ?? undefined, email: localStorage.getItem("email") ?? undefined }
        : undefined;

    useEffect(() => {
        if (item) setActiveTab("dataDetails");
    }, [item?.id]);

    useEffect(() => {
        const handleClickOutside = () => setShowMenu(false);
        if (showMenu) {
            window.addEventListener("click", handleClickOutside);
        }
        return () => window.removeEventListener("click", handleClickOutside);
    }, [showMenu]);

    useEffect(() => {
        setApproveStatus(item?.status ?? "");
        setApproveComments([]);
        setIsApprovingEdit(false);
    }, [item?.id]);

    if (!item) return null;

    const risk = riskMap[item.risk] ?? {
        color: "bg-gray-100 text-gray-600",
        icon: null,
    };
    const status = statusMap[item.status] ?? {
        color: "bg-gray-100 text-gray-600",
        icon: null,
    };

    const tabs: { key: Tab | "approve"; label: string; icon: React.ReactNode }[] =
        [
            {
                key: "dataDetails",
                label: "ข้อมูลส่วนบุคคลที่จัดเก็บ",
                icon: <FolderOpen size={12} />,
            },
            {
                key: "legal",
                label: "ข้อกฎหมายและการให้ความยินยอม",
                icon: <Scale size={12} />,
            },
            {
                key: "transfer",
                label: "การส่งและการถ่ายโอนข้อมูล",
                icon: <ArrowLeftRight size={12} />,
            },
            {
                key: "retention",
                label: "การเก็บรักษาและการใช้/เปิดเผยข้อมูล",
                icon: <Folder size={12} />,
            },
            { key: "security", label: "ความปลอดภัย", icon: <Shield size={12} /> },
            { key: "processor", label: "Processor", icon: <UserCog size={12} /> },
            {
                key: "history",
                label: "ประวัติการแก้ไข",
                icon: <ClockFading size={12} />,
            },
        ];

    const formatRetention = (text: string) => {
        if (!text) return text;
        return text.replace(/\b0+(\d)/g, "$1"); // ตัด 0 นำหน้าออก
    };

    if (role === "DPO") {
        tabs.push({
            key: "approve",
            label: "Approve",
            icon: <CheckCircle size={12} />,
        });
    }

    return (
        <div className="flex flex-col h-full bg-white border-l border-gray-200 overflow-hidden font-prompt text-[12px]">
            {/* top toolbar */}
            <div className="flex items-center justify-between px-4 py-1 border-b border-gray-100 shrink-0">
                <button
                    className="p-1.5 hover:bg-gray-100 rounded text-[#A6A6A6]"
                    onClick={onClose}
                >
                    <Columns2 size={16} />
                </button>
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded text-[#A6A6A6]"
                    >
                        <MoreHorizontal size={16} />
                    </button>

                    {/* dropdown */}
                    {showMenu && (
                        role === "DPO" ? (
                            <button onClick={() => { setActiveTab("approve"); setIsApprovingEdit(true); }}>
                                แก้ไขสถานะ
                            </button>
                        ) : (
                            <>
                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-md z-50">
                                    <button
                                        className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-100"
                                        onClick={() => {
                                            console.log("edit activity");
                                            setShowMenu(false);
                                        }}
                                    >
                                        <Link href="/form">
                                            <div className="flex flex-col-2 gap-2">
                                                <Pencil size={14} /> แก้ไขกิจกรรม
                                            </div>
                                        </Link>
                                    </button>

                                    <button
                                        className="w-full text-left px-3 py-2 text-[12px] hover:bg-red-50 text-red-500"
                                        onClick={() => {
                                            console.log("delete activity");
                                            setShowMenu(false);
                                        }}
                                    >
                                        <div className="flex flex-col-2 gap-2">
                                            <Trash2 size={14} /> ลบกิจกรรม
                                        </div>
                                    </button>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>

            {/* scroll wrapper */}
            <div className="flex-1 overflow-y-auto">
                {/* header */}
                <div className="px-5 pt-4 pb-3">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <h2 className="text-[22px] font-bold text-[#1C1B1F] leading-tight font-prompt">
                            {item.activity}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded text-[#A6A6A6] shrink-0 mt-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <span className={`${badgeBase} ${risk.color} gap-1`}>
                            {risk.icon} {item.risk}
                        </span>
                        <span className={`${badgeBase} ${status.color} gap-1`}>
                            {status.icon} {item.status}
                        </span>
                    </div>
                </div>

                {/* meta info */}
                <div className="px-5 border-b border-gray-100 pb-3">
                    <InfoRow
                        icon={<Users size={14} className="text-[#656565]" />}
                        label="เจ้าของข้อมูลส่วนบุคคล"
                    >
                        {display(item.owner_name ?? item.dataOwner)}
                    </InfoRow>
                    <InfoRow
                        icon={<Clock size={14} className="text-[#656565]" />}
                        label="ระยะเวลาการเก็บรักษา"
                    >
                        <span className="text-[#1C1B1F]">
                            {formatRetention(item.retention?.retentionPeriod ?? "-")}
                        </span>
                    </InfoRow>
                    <InfoRow
                        icon={<Building2 size={14} className="text-[#656565]" />}
                        label="ฝ่ายที่เกี่ยวข้อง"
                    >
                        {item.parties.length > 1 ? (
                            item.parties.map((p, i) => <Tag key={i} label={p} />)
                        ) : (
                            <span>{item.parties[0]}</span>
                        )}
                    </InfoRow>
                    <InfoRow
                        icon={<Scale size={14} className="text-[#656565]" />}
                        label="ฐานกฎหมาย"
                    >
                        {item.legal?.basis?.length ? (
                            item.legal.basis.length > 1 ? (
                                item.legal.basis.map((l, i) => <Tag key={i} label={l} />)
                            ) : (
                                <span>{item.legal.basis[0]}</span>
                            )
                        ) : (
                            <span className="text-[#A6A6A6]">ไม่มีข้อมูล</span>
                        )}
                    </InfoRow>
                    <div className="flex items-start gap-3 py-2">
                        <div className="text-[#A6A6A6] mt-0.5 shrink-0">
                            <Book size={14} className="text-[#656565]" />
                        </div>
                        <p className="text-[11px] text-[#A6A6A6]">
                            วัตถุประสงค์ของการประมวลผล
                        </p>
                    </div>

                    <textarea
                        readOnly
                        value={item.purposeDetail ?? ""}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 min-h-[80px] text-[#1C1B1F] bg-gray-50 text-[12px] leading-relaxed resize-y"
                    />
                </div>

                {/* tabs bar */}
                <div className="border-b border-gray-100">
                    <div className="flex px-2 pt-2 gap-0 overflow-x-auto scrollbar-none">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 whitespace-nowrap pb-2.5 px-3 text-[11px] font-medium border-b-2 transition-colors ${activeTab === t.key
                                    ? "border-[#03369D] text-[#03369D]"
                                    : "border-transparent text-[#A6A6A6] hover:text-[#1C1B1F]"
                                    }`}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* tab content */}
                <div className="px-5 py-4">
                    {activeTab === "dataDetails" && (
                        <TabDataDetails
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                            InfoRowPlain={InfoRowPlain}
                            InfoRow={InfoRow}
                        />
                    )}
                    {activeTab === "legal" && (
                        <TabLegal
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                        />
                    )}
                    {activeTab === "transfer" && (
                        <TabTransfer
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                            InfoRow={InfoRow}
                        />
                    )}
                    {activeTab === "retention" && (
                        <TabRetention
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                            InfoRow={InfoRow}
                            InfoRowPlain={InfoRowPlain}
                        />
                    )}
                    {activeTab === "security" && (
                        <TabSecurity
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                            InfoRow={InfoRow}
                            InfoRowPlain={InfoRowPlain}
                        />
                    )}
                    {activeTab === "processor" && (
                        <TabProcessor
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                            InfoRowPlain={InfoRowPlain}
                            InfoRow={InfoRow}
                        />
                    )}
                    {activeTab === "history" && (
                        <TabHistory
                            item={item}
                            RenderValue={RenderValue}
                            BulletRow={BulletRow}
                            InfoRowPlain={InfoRowPlain}
                            InfoRow={InfoRow}
                        />
                    )}
                    {activeTab === "approve" && role === "DPO" && (
                        <TabApprove
                            itemId={item.id}
                            currentStatus={approveStatus}
                            currentUser={currentUser}
                            existingComments={existingComments}
                            isEditingFromParent={isApprovingEdit}
                            onEditingChange={setIsApprovingEdit}
                            onAddComment={onAddComment}
                            onUpdateStatus={(status, comments) => {
                                fetch(`http://localhost:8000/api/form/ropa/${item.id}/`, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                    body: JSON.stringify({ status, comments }),
                                })
                                    .then(() => {
                                        setApproveStatus(status);
                                        if (comments) setApproveComments(comments);
                                        setIsApprovingEdit(false);
                                        onStatusChange?.(item.id, status); // ← แจ้ง parent
                                        alert("อัปเดตสถานะเรียบร้อย");
                                    })
                                    .catch(() => alert("อัปเดตสถานะไม่สำเร็จ"));
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
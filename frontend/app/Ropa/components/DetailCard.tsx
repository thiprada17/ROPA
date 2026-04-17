// app/Ropa/components/DetailCard.tsx
"use client";
import { X, Users, Clock, Building2, Scale, FileText, ChevronRight, Columns2, MoreHorizontal, } from "lucide-react";
import { useEffect, useState } from "react";

export interface RopaItem {
  id: number;
  activity: string;
  parties: string[];
  purpose: string;
  legal: string[];
  retention: string;
  risk: string;
  status: string;
  // detail fields
  dataOwner?: string;
  purposeDetail?: string;
  categories?: string[];
  dataClass?: string;
  collectMethods?: string[];
  dataSource?: string;
}

interface DetailCardProps {
  item: RopaItem | null;
  onClose: () => void;
}

// Badge maps ลอกหน้าโรป้ามา 
const riskMap: Record<string, { color: string; icon: React.ReactNode }> = {
  Critical: { color: "bg-red-100 text-red-600", icon: <span className="mr-1">⚑</span> },
  High:     { color: "bg-orange-100 text-orange-600", icon: <span className="mr-1">⚑</span> },
  Medium:   { color: "bg-yellow-100 text-yellow-600", icon: <span className="mr-1">⚑</span> },
  Low:      { color: "bg-green-100 text-green-600", icon: <span className="mr-1">⚑</span> },
};
const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
  Pending:  { color: "bg-blue-100 text-blue-600", icon: <span className="mr-1">◷</span> },
  Approved: { color: "bg-green-100 text-green-600", icon: <span className="mr-1">✓</span> },
  Rejected: { color: "bg-red-100 text-red-600", icon: <span className="mr-1">✕</span> },
};
const badgeBase = "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap";

// tab ลลื่นได้ตรงนั้น
type Tab = "data" | "legal" | "transfer";
const tabs: { key: Tab; label: string }[] = [
  { key: "data",     label: "ข้อมูลส่วนบุคคลที่จัดเก็บ" },
  { key: "legal",    label: "ฐานกฎหมายและการให้ความยินยอม" },
  { key: "transfer", label: "การส่ง/โอนข้อมูล" },
];

// chip ถ้ามีมากกว่าหนึ่งอันจะเป็นแบบนี้
const Tag = ({ label }: { label: string }) => (
  <span className="bg-[#DFE9FF] text-[#03369D] px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap">
    {label}
  </span>
);

// info row
const InfoRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="text-[#A6A6A6] mt-0.5 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-[#A6A6A6] mb-0.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  </div>
);

export default function DetailCard({ item, onClose }: DetailCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("data");
  const [visible, setVisible] = useState(false);

  // animate in/out
  useEffect(() => {
    if (item) {
      requestAnimationFrame(() => setVisible(true));
      setActiveTab("data");
    } else {
      setVisible(false);
    }
  }, [item]);

  if (!item) return null;

  const risk   = riskMap[item.risk]   ?? { color: "bg-gray-100 text-gray-600", icon: null };
  const status = statusMap[item.status] ?? { color: "bg-gray-100 text-gray-600", icon: null };

  return (
    <div
      className="flex flex-col bg-white border-l border-gray-200 shadow-xl overflow-hidden font-prompt text-[12px]"
      style={{
        width: visible ? "420px" : "0px",
        minWidth: visible ? "420px" : "0px",
        opacity: visible ? 1 : 0,
        transition: "width 280ms cubic-bezier(0.4,0,0.2,1), min-width 280ms cubic-bezier(0.4,0,0.2,1), opacity 200ms ease",
        overflow: "hidden",
      }}
    >
      {/* inner scroll container */}
      <div className="w-[420px] flex flex-col h-full overflow-y-auto">

        {/* top bar*/}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <button className="p-1.5 hover:bg-gray-100 rounded text-[#A6A6A6]">
            <Columns2 size={16} />
          </button>
          <button className="p-1.5 hover:bg-gray-100 rounded text-[#A6A6A6]">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* header */}
        <div className="px-5 pt-4 pb-3 shrink-0">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-[22px] font-bold text-[#1C1B1F] leading-tight font-gabarito">
              {item.activity}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded text-[#A6A6A6] shrink-0 mt-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* status badges */}
          <div className="flex gap-2 flex-wrap">
            <span className={`${badgeBase} ${risk.color}`}>{risk.icon}{item.risk}</span>
            <span className={`${badgeBase} ${status.color}`}>{status.icon}{item.status}</span>
          </div>
        </div>

        {/* meta info rows */}
        <div className="px-5 border-b border-gray-100 pb-3 shrink-0">
          <InfoRow icon={<Users size={14} />} label="เจ้าของข้อมูลส่วนบุคคล">
            <span className="text-[#1C1B1F]">{item.dataOwner ?? "นายเจ้าของ ข้อมูล"}</span>
          </InfoRow>
          <InfoRow icon={<Clock size={14} />} label="ระยะเวลาการเก็บรักษา">
            <span className="text-[#1C1B1F]">{item.retention}</span>
          </InfoRow>
          <InfoRow icon={<Building2 size={14} />} label="ฝ่ายที่เกี่ยวข้อง">
            {item.parties.map((p, i) => <Tag key={i} label={p} />)}
          </InfoRow>
          <InfoRow icon={<Scale size={14} />} label="ฐานกฎหมาย">
            {item.legal.map((l, i) => <Tag key={i} label={l} />)}
          </InfoRow>
          <InfoRow icon={<FileText size={14} />} label="วัตถุประสงค์ของการประมวลผล">
            <span className="text-[#1C1B1F]">{item.purpose}</span>
          </InfoRow>
        </div>

        {/* purpose textarea */}
        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <p className="text-[11px] text-[#A6A6A6] mb-2">คำอธิบายวัตถุประสงค์</p>
          <div className="border border-gray-200 rounded-lg px-3 py-2 min-h-[72px] text-[#1C1B1F] bg-gray-50 text-[12px] leading-relaxed">
            {item.purposeDetail ?? ""}
          </div>
        </div>

        {/* tabs */}
        <div className="shrink-0 border-b border-gray-100">
          <div className="flex overflow-x-auto px-4 pt-3 gap-1 scrollbar-none">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap pb-2.5 px-1 text-[11px] font-medium border-b-2 transition-colors ${
                  activeTab === t.key
                    ? "border-[#03369D] text-[#03369D]"
                    : "border-transparent text-[#A6A6A6] hover:text-[#1C1B1F]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* tab content */}
        <div className="px-5 py-4 flex-1 overflow-y-auto">
          {activeTab === "data" && <TabData item={item} />}
          {activeTab === "legal" && <TabLegal item={item} />}
          {activeTab === "transfer" && <TabTransfer />}
        </div>
      </div>
    </div>
  );
}

// ข้อมูลส่วนบุคคลที่เก็บของ tab
function TabData({ item }: { item: RopaItem }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">ประเภทข้อมูลส่วนบุคคล</p>
        <p className="text-[#1C1B1F]">{item.dataClass ?? "ข้อมูลผู้สมัครงาน"}</p>
        {item.categories && item.categories.length > 0 && (
          <ul className="mt-1.5 space-y-1">
            {item.categories.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5 text-[#1C1B1F]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#03369D] shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border border-gray-100 rounded-lg px-3 py-2 min-h-[80px] bg-gray-50">
        <p className="text-[11px] text-[#A6A6A6] mb-1">รายละเอียดข้อมูล</p>
      </div>

      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">หมวดหมู่ข้อมูล</p>
        <div className="flex flex-wrap gap-1.5">
          {(item.categories ?? ["ข้อมูลลูกค้า", "ข้อมูลคู่ค้า"]).map((c, i) => (
            <Tag key={i} label={c} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">ประเภทของข้อมูล</p>
        <p className="text-[#1C1B1F]">ข้อมูลทั่วไป</p>
      </div>

      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">วิธีได้มาซึ่งข้อมูล</p>
        <div className="flex flex-wrap gap-1.5">
          {(item.collectMethods ?? ["เอกสาร", "ข้อมูลอิเล็กทรอนิกส์"]).map((m, i) => (
            <Tag key={i} label={m} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">แหล่งที่ได้มาซึ่งข้อมูล</p>
        <p className="text-[#1C1B1F]">{item.dataSource ?? "จากเจ้าของข้อมูลส่วนบุคคลโดยตรง"}</p>
      </div>
    </div>
  );
}

// tab ฐานกฎหมาย
function TabLegal({ item }: { item: RopaItem }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">ฐานกฎหมายหลัก</p>
        <div className="flex flex-wrap gap-1.5">
          {item.legal.map((l, i) => <Tag key={i} label={l} />)}
        </div>
      </div>
      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">ฐานกฎหมายเสริม</p>
        <p className="text-[#A6A6A6] text-[11px] italic">ไม่มีข้อมูล</p>
      </div>
      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">การยินยอมผู้เยาว์</p>
        <p className="text-[#A6A6A6] text-[11px] italic">ไม่มีข้อมูล</p>
      </div>
    </div>
  );
}

// Tab: การส่ง/โอนข้อมูล 
function TabTransfer() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">การส่งข้อมูลไปต่างประเทศ</p>
        <p className="text-[#1C1B1F]">ไม่มี</p>
      </div>
      <div>
        <p className="text-[11px] text-[#A6A6A6] mb-1.5">ผู้ประมวลผลข้อมูล (Processor)</p>
        <p className="text-[#A6A6A6] text-[11px] italic">ไม่มีข้อมูล</p>
      </div>
    </div>
  );
}

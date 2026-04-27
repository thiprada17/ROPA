import { MoveUp, BadgeCheck, Info } from "lucide-react";

type Props = {
  total: number;
  growth: number;
};

export default function ApprovalCard({ total, growth }: Props) {
  const isPositive = growth >= 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-[240px] h-[139px] flex flex-col justify-between">
      {/* TOP ROW (title + icon) */}
      <div className="flex items-start justify-between ">
        <div className="flex items-center gap-2 relative group">
          {/* title */}
          <p className="text-sm text-gray-500 font-[12px]">Approval</p>

          {/* INFO ICON */}
          <Info size={14} className="text-gray-400 cursor-pointer" />

          {/* TOOLTIP */}
          <div className="font-prompt absolute left-0 top-6 w-[220px] text-xs border border-gray-300 bg-gray-100 text-black px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            แสดงจำนวนรายการ ROPA ที่ได้รับการอนุมัติ
            พร้อมอัตราการเติบโตเมื่อเทียบกับเดือนก่อนหน้า
          </div>
        </div>

        {/* icon top right */}
        <BadgeCheck size={26} className="text-[#000000]" />
      </div>

      {/* number */}
      <h2 className="text-[48px] font-bold leading-none mb-[6px]">{total}</h2>

      {/* bottom row */}
      <div className="flex items-center gap-2">
        <div
          className={`px-2 py-0.5 rounded-[12px] text-[12px] font-medium flex items-center
        ${isPositive ? "bg-[#ACE5D1] text-[#1C635A]" : "bg-[#F0AFBE] text-[#BD263F]"}
    `}
        >
          <MoveUp className={isPositive ? "" : "rotate-180"} size={14} />
          {Math.abs(growth)}%
        </div>

        <span className="text-gray-400 text-[12px]">since last month</span>
      </div>
    </div>
  );
}
import { MoveUp, BadgeCheck } from "lucide-react";

export default function ApprovalCard({ total, growth }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm w-[240px] h-[139px] flex flex-col justify-between">

      {/* TOP ROW (title + icon) */}
      <div className="flex items-start justify-between ">
        
        {/* title */}
        <p className="text-sm text-gray-500 font-[12px]">
          Approval
        </p>

        {/* icon top right */}
        <BadgeCheck size={26} className="text-[#000000]" />

      </div>

      {/* number */}
      <h2 className="text-[48px] font-bold leading-none mb-[6px]">
        {total}
      </h2>

      {/* bottom row */}
      <div className="flex items-center gap-2">
        <div className="bg-[#ACE5D1] text-[#1C635A] px-2 py-0.5 rounded-[12px] text-[12px] font-medium flex items-center">
          <MoveUp size={14} />
          {growth}%
        </div>

        <span className="text-gray-400 text-[12px]">
          since last month
        </span>
      </div>

    </div>
  );
}
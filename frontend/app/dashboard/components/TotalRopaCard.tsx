"use client";

import { Archive, Info } from "lucide-react";

type Props = {
    total: number;
    newCount: number;
};

export default function TotalRopaCard({ total, newCount }: Props) {
    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm w-[240px] h-[139px] flex flex-col justify-between">
            {/* TOP ROW (title + icon) */}
            <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-2 relative group">
                    {/* title */}
                    <p className="text-sm text-gray-500 font-[12px] ">Total ROPA</p>

                    {/* INFO ICON */}
                    <Info
                        size={14}
                        className="text-gray-400 cursor-pointer"
                    />

                    {/* TOOLTIP */}
                    <div className="font-prompt absolute left-0 top-6 w-[220px] text-xs border border-gray-300 bg-gray-100 text-black px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        แสดงจำนวนรายการ ROPA ทั้งหมด
                    </div>
                </div>
                {/* icon top right */}
                <Archive size={26} className="text-[#000000]" />
            </div>

            {/* number */}
            <h2 className="text-[48px] font-bold leading-none mb-[8px]">
                {total}
            </h2>

            {/* bottom row */}
            <div className="flex items-center gap-2">

                {/* green badge */}
                <div className="bg-[#ACE5D1] text-[#1C635A] px-2 py-0.5 rounded-[12px] text-[12px] font-medium">
                    +{newCount}
                </div>

                <span className="text-gray-400 text-[12px]">new</span>
            </div>

        </div>
    );
}
"use client";

import {
    ChevronsUp,
    ChevronUp,
    ChevronsDown,
    ChevronDown,
    ClipboardClock,
    Info, 
} from "lucide-react";

type Activity = {
    id: string;
    activity: string;
    parties: string[];
    risk: "Critical" | "At Risk" | "Stable" | "Safe";
    date?: string;
};

const riskMap = {
    Critical: {
        color: "bg-[#F0AFBE] text-[#BD263F]",
        icon: <ChevronsUp size={14} />,
    },
    "At Risk": {
        color: "bg-[#F3E3AE] text-[#A37D00]",
        icon: <ChevronUp size={14} />,
    },
    Stable: {
        color: "bg-[#D1E7F0] text-[#0078A3]",
        icon: <ChevronsDown size={14} />,
    },
    Safe: {
        color: "bg-[#B5DDD8] text-[#228679]",
        icon: <ChevronDown size={14} />,
    },
};

export default function ActivityCard({
    activities = [],
}: {
    activities?: Activity[];
}) {
    const limitedActivities = activities.slice(0, 5);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm w-full h-[307px] flex flex-col">

            {/* HEADER + ICON */}
            <div className="flex items-center justify-between mb-4">

                {/* TITLE + INFO */}
                <div className="flex items-center gap-2 relative group">
                    <p className="text-sm text-gray-500">
                        Latest Activity
                    </p>

                    {/* INFO ICON */}
                    <Info
                        size={14}
                        className="text-gray-400 cursor-pointer"
                    />

                    {/* TOOLTIP */}
                    <div className="font-prompt absolute left-0 top-6 w-[220px] text-xs border border-gray-300 bg-gray-100 text-black px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        แสดงรายการ ROPA ล่าสุด พร้อมความเสี่ยงและฝ่ายที่เกี่ยวข้อง
                    </div>
                </div>

                <ClipboardClock
                    size={26}
                    className="text-[#000000]"
                />
            </div>

            {/* Scroll area */}
            <div className="space-y-3 overflow-y-auto pr-1">

                {limitedActivities.map((a) => {
                    const risk = riskMap[a.risk] ?? {
                        color: "bg-gray-200 text-gray-600",
                        icon: <ClipboardClock size={14} />,
                    };

                    return (
                        <div
                            key={a.id}
                            className="border rounded-xl p-3 flex flex-col gap-2"
                        >

                            {/* TOP ROW */}
                            <div className="flex items-start justify-between gap-3">

                                <p className="text-sm text-gray-800 font-medium leading-snug">
                                    {a.activity}
                                </p>

                                <div
                                    className={`px-2 py-1 rounded-md flex items-center justify-center ${risk.color}`}
                                >
                                    {risk.icon}
                                </div>

                            </div>

                            {/* TAGS */}
                            <div className="flex flex-wrap gap-1">
                                {(a.parties ?? []).map((p, i) => (
                                    <span
                                        key={`${p}-${i}`}
                                        className="bg-[#DFE9FF] text-[#03369D] px-2 py-0.5 rounded-md text-[11px]"
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>

                        </div>
                    );
                })}

            </div>
        </div>
    );
}
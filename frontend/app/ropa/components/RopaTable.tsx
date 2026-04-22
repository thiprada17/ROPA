"use client";
import React from "react";
import { RopaItem } from "./DetailCard";
import { EllipsisVertical } from "lucide-react";

interface Props {
    data: RopaItem[];
    selectedItem: RopaItem | null;
    onRowClick: (item: RopaItem) => void;

    col: string;
    riskMap: any;
    statusMap: any;
    badgeBase: string;
}

export default function RopaTable({
    data,
    selectedItem,
    onRowClick,
    col,
    riskMap,
    statusMap,
    badgeBase,
}: Props) {
    return (
        <>
            {/* header */}
            <div
                className="grid gap-2 mb-2 pl-4 pr-2 text-center"
                style={{ gridTemplateColumns: col }}
            >
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    กิจกรรมประมวลผล
                </div>
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    ฝ่ายที่เกี่ยวข้อง
                </div>
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    วัตถุประสงค์
                </div>
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    ฐานกฎหมาย
                </div>
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    ระยะเวลาการเก็บรักษา
                </div>
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    ความเสี่ยง
                </div>
                <div className="bg-[#03369D] text-white px-4 py-3 rounded-lg">
                    สถานะ
                </div>
                <div />
            </div>

            {/* body */}
            <div className="flex flex-col gap-2">
                {data.length > 0 ? (
                    data.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => onRowClick(item)}
                            className={`grid items-center pl-4 pr-1 py-3 border-b cursor-pointer transition ${
                                selectedItem?.id === item.id
                                    ? "bg-[#EEF3FF]"
                                    : "hover:bg-gray-50"
                            }`}
                            style={{ gridTemplateColumns: col }}
                        >
                            <div className="px-2 truncate text-[#1C1B1F]">
                                {item.activity}
                            </div>

                            <div className="px-1 flex items-center gap-1 overflow-hidden min-w-0">
                                {item.parties.map((p, i) => (
                                    <span
                                        key={i}
                                        className={`bg-[#DFE9FF] text-[#03369D] px-2 py-1 rounded-md text-[11px]
                                            ${
                                                i === 0
                                                    ? "whitespace-nowrap shrink-0"
                                                    : "truncate min-w-0"
                                            }`}
                                    >
                                        {p}
                                    </span>
                                ))}
                            </div>

                            <div className="px-2 truncate text-[#1C1B1F]">
                                {item.purpose}
                            </div>

                            <div className="px-1 flex items-center gap-1 overflow-hidden min-w-0">
                                {item.legal?.basis?.length ? (
                                    item.legal.basis.map((l, i) => (
                                        <span
                                            key={i}
                                            className={`bg-[#DFE9FF] text-[#03369D] px-2 py-1 rounded-md text-[11px]
                                                ${
                                                    i === 0
                                                        ? "whitespace-nowrap shrink-0"
                                                        : "truncate min-w-0"
                                                }`}
                                        >
                                            {l}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[#A6A6A6] text-[11px]">
                                        ไม่มีข้อมูล
                                    </span>
                                )}
                            </div>

                            <div>
                                <span className="px-4 text-[#1C1B1F]">
                                    {item.retention.retentionPeriod}
                                </span>
                            </div>

                            <div className="flex justify-center">
                                <span
                                    className={`${badgeBase} ${
                                        riskMap[item.risk]?.color
                                    }`}
                                >
                                    {riskMap[item.risk]?.icon}
                                    {item.risk}
                                </span>
                            </div>

                            <div className="flex justify-center">
                                <span
                                    className={`${badgeBase} ${
                                        statusMap[item.status]?.color
                                    }`}
                                >
                                    {statusMap[item.status]?.icon}
                                    {item.status}
                                </span>
                            </div>

                            <div className="flex justify-end w-full">
                                <button
                                    className="p-1 hover:bg-gray-200 rounded"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRowClick(item);
                                    }}
                                >
                                    <EllipsisVertical size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-6">
                        ไม่พบข้อมูล
                    </div>
                )}
            </div>
        </>
    );
}
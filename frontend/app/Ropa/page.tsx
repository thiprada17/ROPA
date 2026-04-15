"use client";

import React, { useState, useRef, useEffect } from "react";
import FilterModal from "./components/FilterModal";
import Breadcrumb from "./components/Breadcrumb";
import { ropaMock } from "./data/ropaMock";
import {
    Search,
    Filter,
    Plus,
    Calendar,
    EllipsisVertical,
    ChevronsUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Ellipsis,
    ClockFading,
    CheckCircle,
    AlertTriangle,
    ChevronUp,
    ChevronsDown,
    Shield,
    ShieldAlert,
} from "lucide-react";

// ================= MOCK DATA =================
const data = ropaMock;

export default function RopaPage() {
    // ================= BREADCRUMB ================
    const breadcrumbItems = [
        { label: <ShieldAlert size={16} />, href: "/" },
        { label: "ROPA" },
    ];
    // ================= STATE =================
    // date filter
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    // toggle date picker
    const [open, setOpen] = useState(false);
    // pagination
    const [page, setPage] = useState(1);
    // search keyword
    const [search, setSearch] = useState("");
    // filter modal
    const [openFilter, setOpenFilter] = useState(false);
    // filter: type + risk
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
    // filter: retention (ช่วงเวลา)
    const [retention, setRetention] = useState({
        start: { year: "", month: "", day: "" },
        end: { year: "", month: "", day: "" },
    });
    // ================= FILTER COUNT (badge บนปุ่ม filter) =================
    const filterCount =
        selectedTypes.length +
        selectedRisks.length +
        (retention.start.year ||
            retention.start.month ||
            retention.start.day ||
            retention.end.year ||
            retention.end.month ||
            retention.end.day
            ? 1
            : 0);

    const ref = useRef<HTMLDivElement>(null);

    // ================= CLICK OUTSIDE =================
    useEffect(() => {
        function handleClickOutside(e: any) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ================= DATE FORMAT =================
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const today = new Date().toISOString().split("T")[0];
    const isSameDay = startDate && endDate && startDate === endDate;
    const isToday = isSameDay && startDate === today;

    // ================= SEARCH FILTER =================
    const normalize = (text: string) => text.toLowerCase();

    const filteredData = data.filter((item) => {
        const keyword = normalize(search);

        // filter search
        const matchSearch =
            normalize(item.activity).includes(keyword)

        // filter type
        const matchType =
            selectedTypes.length === 0 ||
            selectedTypes.includes(item.type);

        // filter risk
        const matchRisk =
            selectedRisks.length === 0 ||
            selectedRisks.includes(item.risk);

        // ================= RETENTION =================
        const hasRetentionFilter =
            retention.start.year ||
            retention.start.month ||
            retention.start.day ||
            retention.end.year ||
            retention.end.month ||
            retention.end.day;

        let matchRetention = true;

        if (hasRetentionFilter) {
            // แปลง text → วัน
            const convertToDays = (text: string) => {
                if (!text) return 0;

                const clean = text.replace(/\s+/g, "");

                if (clean.includes("วัน")) {
                    return parseInt(clean.replace("วัน", "")) || 0;
                }

                if (clean.includes("สัปดาห์")) {
                    return (parseInt(clean.replace("สัปดาห์", "")) || 0) * 7;
                }

                if (clean.includes("เดือน")) {
                    return (parseInt(clean.replace("เดือน", "")) || 0) * 30;
                }

                if (clean.includes("ปี")) {
                    return (parseInt(clean.replace("ปี", "")) || 0) * 365;
                }

                return 0;
            };

            const itemDays = convertToDays(item.retention);

            const startDays =
                (Number(retention.start.year || 0) * 365) +
                (Number(retention.start.month || 0) * 30) +
                (Number(retention.start.day || 0));

            const endDays =
                (Number(retention.end.year || 0) * 365) +
                (Number(retention.end.month || 0) * 30) +
                (Number(retention.end.day || 0));

            const minDays = Math.min(startDays, endDays);
            const maxDays = Math.max(startDays, endDays);

            if (minDays > 0 && maxDays > 0) {
                matchRetention = itemDays >= minDays && itemDays <= maxDays;
            } else if (minDays > 0) {
                matchRetention = itemDays >= minDays;
            } else if (maxDays > 0) {
                matchRetention = itemDays <= maxDays;
            }
        }

        return matchSearch && matchType && matchRisk && matchRetention;
    });

    // ================= PAGINATION =================
    const itemsPerPage = 10;
    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

    const paginatedData = filteredData.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
    );

    // reset page ถ้าค้นหาแล้วจำนวนหน้าลดลง
    useEffect(() => {
        setPage(1);
    }, [search]);

    // ================= GRID CONFIG =================
    const colConfig = {
        activity: 2,
        parties: 1.25,
        purpose: 1.5,
        legal: 1.5,
        retention: 1.5,
        risk: 1,
        status: 1,
        action: 0.1,
    };

    const col = Object.values(colConfig)
        .map((v) => `${v}fr`)
        .join(" ");

    // ================= STYLE MAP =================
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

    const statusMap = {
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
        "flex items-center justify-center gap-1 px-3 py-[4px] rounded-full text-[11px] font-medium min-w-[100px]";


    return (
        <div className="flex h-screen bg-gray-100 font-prompt text-[12px] overflow-hidden">
            {/* ================= Sidebar ================= */}
            <aside className="w-20 bg-gray-700 text-white flex flex-col items-center py-4 flex-shrink-0">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-black mb-6">
                    LOGO
                </div>

                <div className="flex flex-col gap-6 mt-4">
                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                    <div className="w-6 h-6 bg-gray-500 rounded"></div>
                </div>

                <div className="mt-auto w-10 h-10 bg-gray-300 rounded-full"></div>
            </aside>

            {/* ================= Main ================= */}
            <main className="flex-1 overflow-y-auto px-[120px] py-6">
                <div className="max-w-[1440px] mx-auto">
                    {/* HEADER WRAPPER */}
                    <div className="mb-4">

                        {/* ROW 1: BREADCRUMB */}
                        <div className="mb-3">
                            <Breadcrumb items={breadcrumbItems} />
                        </div>

                        {/* LINE DIVIDER */}
                        <div className="border-b border-gray-200 mb-4" />

                        <br />

                        {/* ROW 2: FILTER + ACTIONS */}
                        <div className="flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center">
                            {/* ================= DATE FILTER ================= */}
                            <div className="relative" ref={ref}>
                                <button
                                    onClick={() => setOpen(!open)}
                                    className="flex items-center justify-between gap-2 bg-white border rounded-lg px-4 h-[40px] w-[274px] shadow-sm hover:border-gray-400 transition"
                                >
                                    <span className="text-sm flex items-center gap-2 text-gray-700">
                                        <Calendar size={16} className="shrink-0" />
                                        <span className="truncate">
                                            {startDate && endDate ? (
                                                isSameDay ? (
                                                    <>
                                                        {formatDate(startDate)}
                                                        {isToday && <span className="text-blue-600">(today)</span>}
                                                    </>
                                                ) : (
                                                    <>
                                                        {formatDate(startDate)}
                                                        <span className="text-gray-400 mx-1">-</span>
                                                        {formatDate(endDate)}
                                                    </>
                                                )
                                            ) : (
                                                <span className="text-gray-400">เลือกช่วงวันที่</span>
                                            )}
                                        </span>
                                    </span>

                                    <ChevronDown size={16} className="text-gray-500" />
                                </button>

                                {open && (
                                    <div className="absolute mt-2 w-[264px] bg-white border rounded-xl shadow-lg p-4 z-20">

                                        {/* header */}
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="text-sm font-semibold text-gray-800">
                                                เลือกช่วงวันที่
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setStartDate("");
                                                    setEndDate("");
                                                }}
                                                className="text-xs text-blue-600 font-gabarito hover:underline"
                                            >
                                                Clear all
                                            </button>
                                        </div>

                                        {/* form */}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">วันเริ่มต้น</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs text-gray-500">วันสิ้นสุด</label>
                                                <input
                                                    type="date"
                                                    value={endDate}
                                                    onChange={(e) => setEndDate(e.target.value)}
                                                    className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* footer action (optional แต่ช่วยให้ดูโปร) */}
                                        <div className="flex justify-end mt-4">
                                            <button
                                                onClick={() => setOpen(false)}
                                                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-gabarito"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ================= ACTIONS ================= */}
                            <div className="flex gap-4 items-center">
                                <button className="flex items-center justify-center gap-2 w-[128px] h-[40px] bg-[#03369D] text-white rounded-lg">
                                    <Plus size={16} /> เพิ่มกิจกรรม
                                </button>

                                <div className="flex items-center gap-2 border rounded-lg px-3 w-[304px] h-[40px] bg-white">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder="ค้นหาชื่อกิจกรรม"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full outline-none text-sm"
                                    />
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => setOpenFilter(!openFilter)}
                                        className="flex items-center justify-center gap-2 w-[88px] h-[40px] border bg-white rounded-lg relative"
                                    >
                                        <Filter size={16} />
                                        <span className="font-gabarito text-[14px]">Filter</span>

                                        {filterCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                                {filterCount}
                                            </span>
                                        )}
                                    </button>

                                    <FilterModal
                                        open={openFilter}
                                        onClose={() => setOpenFilter(false)}
                                        selectedTypes={selectedTypes}
                                        setSelectedTypes={setSelectedTypes}
                                        selectedRisks={selectedRisks}
                                        setSelectedRisks={setSelectedRisks}
                                        retention={retention}
                                        setRetention={setRetention}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ================= TABLE ================= */}
                        <div className="mt-6">
                            <div className="bg-white rounded-xl shadow p-3">
                                <div className="w-full flex flex-col">
                                    {/* HEADER */}
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

                                    {/* BODY */}
                                    <div className="flex flex-col gap-2">
                                        {paginatedData.length > 0 ? (
                                            paginatedData.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="grid items-center pl-4 pr-1 py-3 border-b hover:bg-gray-50 transition"
                                                    style={{ gridTemplateColumns: col }}
                                                >
                                                    {/* activity */}
                                                    <div className="px-2 truncate">
                                                        {item.activity}
                                                    </div>

                                                    {/* parties */}
                                                    <div className="px-1 flex items-center gap-1 overflow-hidden min-w-0">
                                                        {item.parties.map((p, i) => (
                                                            <span
                                                                key={i}
                                                                className={`bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[11px]
                                                                    ${i === 0 ? "whitespace-nowrap shrink-0" : "truncate min-w-0"}
                                                        `}
                                                                title={p}
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* purpose */}
                                                    <div className="px-2 truncate text-gray-700">
                                                        {item.purpose}
                                                    </div>

                                                    {/* legal */}
                                                    <div className="px-1 flex items-center gap-1 overflow-hidden min-w-0">
                                                        {item.legal.map((l, i) => (
                                                            <span
                                                                key={i}
                                                                className={`bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-[11px]
                                                                    ${i === 0 ? "whitespace-nowrap shrink-0" : "truncate min-w-0"}
                                                        `}
                                                                title={l}
                                                            >
                                                                {l}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* retention */}
                                                    <div>
                                                        <span className="px-4">
                                                            {item.retention}
                                                        </span>
                                                    </div>

                                                    {/* risk */}
                                                    <div className="flex justify-center">
                                                        <span className={`${badgeBase} ${riskMap[item.risk]?.color}`}>
                                                            {riskMap[item.risk]?.icon}
                                                            {item.risk}
                                                        </span>
                                                    </div>

                                                    {/* status */}
                                                    <div className="flex justify-center">
                                                        <span className={`${badgeBase} ${statusMap[item.status]?.color}`}>
                                                            {statusMap[item.status]?.icon}
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    {/* action */}
                                                    <div className=" flex justify-end w-full">
                                                        <button className="p-1 hover:bg-gray-200 rounded">
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
                                </div>
                            </div>
                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="mt-4 flex justify-between items-center text-sm">
                            <span className="text-gray-500">{totalItems} items</span>

                            <div className="flex items-center gap-2">
                                <ChevronLeft
                                    className={`cursor-pointer ${page === 1 ? "opacity-30 pointer-events-none" : ""
                                        }`}
                                    size={18}
                                    onClick={() => setPage(page - 1)}
                                />

                                <span className="font-gabarito">Page</span>

                                <input
                                    type="number"
                                    value={page}
                                    min={1}
                                    max={totalPages}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (val >= 1 && val <= totalPages) setPage(val);
                                    }}
                                    className="w-12 border rounded px-2 py-1"
                                />

                                <span className="font-gabarito">of {totalPages}</span>

                                <ChevronRight
                                    className={`cursor-pointer ${page === totalPages ? "opacity-30 pointer-events-none" : ""
                                        }`}
                                    size={18}
                                    onClick={() => setPage(page + 1)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
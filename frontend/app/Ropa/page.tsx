"use client";

import React, { useState, useRef, useEffect } from "react";
import FilterModal from "./components/FilterModal";
import {
    Search,
    Filter,
    Plus,
    Calendar,
    MoreVertical,
    ChevronsUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const data = [
    {
        id: 1,
        activity: "รายชื่อผู้ผ่านเข้ารอบการสัมภาษณ์",
        type: "ข้อมูลผู้สมัครงาน",
        owner: "นายเจ้าของ ข้อมูล",
        department: "HR",
        receiver: "นางสาวผู้รับ ข้อมูล",
        retention: "2 เดือน",
        risk: "Very High",
    },
    {
        id: 2,
        activity: "ประวัติส่วนตัวของนายบังการ กอง",
        type: "ข้อมูลบุคลากร",
        owner: "นายบังการ กอง",
        department: "HR",
        receiver: "นางสาวบังการ เงิน",
        retention: "1 สัปดาห์",
        risk: "Low",
    },
];

export default function RopaPage() {
    // ================= STATE =================
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [openFilter, setOpenFilter] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
    const [retention, setRetention] = useState({
        start: { year: "", month: "", day: "" },
        end: { year: "", month: "", day: "" },
    });

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

        // ================= SEARCH =================
        const matchSearch =
            normalize(item.activity).includes(keyword) ||
            normalize(item.owner).includes(keyword) ||
            normalize(item.department).includes(keyword);

        // ================= TYPE =================
        const matchType =
            selectedTypes.length === 0 ||
            selectedTypes.includes(item.type);

        // ================= RISK =================
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
            // แปลง "2 เดือน", "1 สัปดาห์" → เป็นวัน
            const convertToDays = (text: string) => {
                if (!text) return 0;

                // 🔥 ตัดช่องว่าง + normalize
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
    const itemsPerPage = 5;
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

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* ================= Sidebar ================= */}
            <aside className="w-20 bg-gray-700 text-white flex flex-col items-center py-4">
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
            <main className="flex-1 px-[120px] py-6">
                <div className="flex flex-col md:flex-row md:justify-between gap-4">

                    {/* ================= DATE FILTER ================= */}
                    <div className="relative" ref={ref}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center justify-between gap-2 bg-white border rounded-lg px-4 h-[40px] w-[264px] shadow-sm hover:border-gray-400 transition"
                        >
                            <span className="text-sm flex items-center gap-2 text-gray-700 truncate">
                                <Calendar size={16} />

                                {startDate && endDate ? (
                                    isSameDay ? (
                                        <>
                                            {formatDate(startDate)}
                                            {isToday && <span className="text-blue-600">(today)</span>}
                                        </>
                                    ) : (
                                        <>
                                            {formatDate(startDate)}
                                            <span className="text-gray-400">-</span>
                                            {formatDate(endDate)}
                                        </>
                                    )
                                ) : (
                                    <span className="text-gray-400">เลือกช่วงวันที่</span>
                                )}
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
                                        className="text-xs text-blue-600 hover:underline"
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
                                        className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700"
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
                                placeholder="ชื่อกิจกรรม, เจ้าของข้อมูล, หน่วยงาน"
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
                                <Filter size={16} /> Filter

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
                <div className="mt-6 bg-white rounded-xl shadow p-3">

                    {/* HEADER */}
                    <div className="flex text-sm mb-2 gap-2">
                        {[
                            "กิจกรรม",
                            "ประเภท",
                            "เจ้าของ",
                            "หน่วยงาน",
                            "ผู้รับ",
                            "ระยะเวลา",
                            "ความเสี่ยง",
                            "",
                        ].map((h, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-blue-700 text-white px-4 py-3 rounded-lg"
                            >
                                {h}
                            </div>
                        ))}
                    </div>

                    {/* BODY */}
                    <div className="flex flex-col gap-2">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 rounded-lg"
                                >
                                    <div className="flex-1">{item.activity}</div>

                                    <div className="flex-1">
                                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                            {item.type}
                                        </span>
                                    </div>

                                    <div className="flex-1">{item.owner}</div>
                                    <div className="flex-1">{item.department}</div>
                                    <div className="flex-1">{item.receiver}</div>
                                    <div className="flex-1">{item.retention}</div>

                                    <div className="flex-1 flex items-center gap-1">
                                        <ChevronsUp size={14} className="text-red-500" />
                                        <span>{item.risk}</span>
                                    </div>

                                    <div className="flex-1 text-right">
                                        <button
                                            onClick={() => console.log("go to detail", item.id)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            <MoreVertical size={16} />
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

                {/* ================= FOOTER ================= */}
                <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-gray-500">{totalItems} items</span>

                    <div className="flex items-center gap-2">
                        <ChevronLeft
                            className={`cursor-pointer ${page === 1 ? "opacity-30 cursor-not-allowed" : ""}`}
                            size={18}
                            onClick={() => page > 1 && setPage(page - 1)}
                        />

                        <span>Page</span>

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

                        <span>of {totalPages}</span>

                        <ChevronRight
                            className={`cursor-pointer ${page === totalPages ? "opacity-30 cursor-not-allowed" : ""}`}
                            size={18}
                            onClick={() => page < totalPages && setPage(page + 1)}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
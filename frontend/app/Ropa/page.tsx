"use client";

import React, { useState, useRef, useEffect } from "react";
import FilterModal from "./components/FilterModal";
import Breadcrumb from "./components/Breadcrumb";
import RopaTable from "./components/RopaTable";
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
import DetailCard, { RopaItem } from "./components/DetailCard";
import Sidebar from "../components/Sidebar";
import Link from "next/link";


// ================= MOCK DATA =================
const data = ropaMock;

export default function RopaPage() {
    const [selectedItem, setSelectedItem] = useState<RopaItem | null>(null);
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
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
    // filter: retention (ช่วงเวลา)
    const [retention, setRetention] = useState({
        start: { year: "", month: "", day: "" },
        end: { year: "", month: "", day: "" },
    });
    // filter: parties
    const [selectedParties, setSelectedParties] = useState<string[]>([]);

    // ================= FILTER COUNT (badge บนปุ่ม filter) =================
    const filterCount =
        selectedStatus.length +
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

        // filter status
        const matchStatus =
            selectedStatus.length === 0 ||
            selectedStatus.includes(item.status);

        // filter risk
        const matchRisk =
            selectedRisks.length === 0 ||
            selectedRisks.includes(item.risk);

        // filter parties
        const matchParties =
            selectedParties.length === 0 ||
            item.parties.some((p) => selectedParties.includes(p));

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

            const itemDays = convertToDays(item.retention.retentionPeriod);

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

        return matchSearch && matchStatus && matchRisk && matchRetention && matchParties;
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
        "Critical": {
            color: "bg-[#F0AFBE] text-[#BD263F]",
            icon: <ChevronsUp size={14} />,
        },
        "At Risk": {
            color: "bg-[#F3E3AE] text-[#A37D00]",
            icon: <ChevronUp size={14} />,
        },
        "Stable": {
            color: "bg-[#D1E7F0] text-[#0078A3]",
            icon: <ChevronsDown size={14} />,
        },
        "Safe": {
            color: "bg-[#B5DDD8] text-[#228679]",
            icon: <ChevronDown size={14} />,
        },
    };

    const statusMap: Record<"Pending" | "Complete" | "Revision", {
        color: string;
        icon: React.ReactElement;
    }> = {
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

    const [tableWidth, setTableWidth] = useState<number | string>("auto");
    const [detailWidth, setDetailWidth] = useState<number>(400);

    const initResize = (e: React.MouseEvent) => {
        const startX = e.clientX;
        const startDetailWidth = detailWidth;

        const onMouseMove = (e: MouseEvent) => {
            const dx = startX - e.clientX;
            let newWidth = startDetailWidth + dx;
            if (newWidth < 300) newWidth = 300;
            if (newWidth > 800) newWidth = 800;
            setDetailWidth(newWidth);
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };


    return (
        <div className="flex h-screen bg-gray-100 font-prompt overflow-hidden">
            <Sidebar userName="test" userEmail="test@example.com" />
            {/* ================= Main ================= */}
            {/* <main className="flex-1 overflow-y-auto px-[120px] py-6"> */}
            <main className="ml-16 flex-1 flex flex-col overflow-hidden">
                {/* ฝั่งซ้ายโรป้า */}
                {/*  Filter bar ให้มันอยู่บนสุด เต็มความกว้าง */}
                <div className="px-10 pt-6 pb-4 shrink-0">
                    <div className="mb-3">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    {/* LINE DIVIDER */}
                    <div className="border-b border-gray-200 mb-4" />
                    <br />
                    {/* FILTER + ACTIONS */}
                    <div className="flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center">
                        {/* ฟิลเตอร์เลือกวันที่ */}
                        <div className="relative" ref={ref}>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center justify-between gap-2 bg-white border rounded-lg px-4 h-[40px] w-[274px] shadow-sm hover:border-gray-400 transition"
                            >
                                <span className="text-sm flex items-center gap-2 text-[#1C1B1F]">
                                    <Calendar size={16} className="shrink-0" />
                                    <span className="truncate">
                                        {startDate && endDate ? (
                                            isSameDay ? (
                                                <>
                                                    {formatDate(startDate)}
                                                    {isToday && <span className="text-[#03369D]">(today)</span>}
                                                </>
                                            ) : (
                                                <>
                                                    {formatDate(startDate)}
                                                    <span className="text-gray-400 mx-1">-</span>
                                                    {formatDate(endDate)}
                                                </>
                                            )
                                        ) : (
                                            <span className="text-[#616872] text-[12px]">เลือกช่วงวันที่</span>
                                        )}
                                    </span>
                                </span>

                                <ChevronDown size={16} className="text-[#A6A6A6]" />
                            </button>

                            {open && (
                                <div className="absolute mt-2 w-[264px] bg-white border rounded-xl shadow-lg p-4 z-20">

                                    {/* header */}
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="text-sm font-semibold text-[#1C1B1F]">
                                            เลือกช่วงวันที่
                                        </div>

                                        <button
                                            onClick={() => {
                                                setStartDate("");
                                                setEndDate("");
                                            }}
                                            className="text-xs text-[#03369D] font-gabarito hover:underline"
                                        >
                                            Clear all
                                        </button>
                                    </div>

                                    {/* form */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-[#1C1B1F]">วันเริ่มต้น</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="border rounded-md px-2 py-1.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-[#1C1B1F]">วันสิ้นสุด</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="border rounded-md px-2 py-1.5 text-sm text-[#1C1B1F] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* footer action */}
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="text-sm bg-[#03369D] text-white px-4 py-1.5 rounded-md hover:bg-[#012a7c] font-gabarito"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* แถบเครื่องมือ เพิ่ม ค้นหา ฟิลเตอร์ */}
                        <div className="flex gap-4 items-center text-[12px]">
                            {/* ปุ่มเพิ่มกิจกรรม */}
                            <Link href="/form">
                                <button className="flex items-center justify-center gap-2 w-[128px] h-[40px] bg-[#03369D] hover:bg-[#012a7c] text-white rounded-lg">
                                    <Plus size={16} /> เพิ่มกิจกรรม
                                </button>
                            </Link>

                            {/* ช่องค้นหา */}
                            <div className="flex items-center gap-2 border rounded-lg px-3 w-[304px] h-[40px] bg-white">
                                <Search size={16} className="text-[#A6A6A6]" />
                                <input
                                    type="text"
                                    placeholder="ค้นหาชื่อกิจกรรม"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full outline-none text-sm placeholder-[#D8D8D8] text-[#1C1B1F]"
                                />
                            </div>

                            {/* ปุ่มฟิลเตอร์ */}
                            <div className="relative">
                                <button
                                    onClick={() => setOpenFilter(!openFilter)}
                                    className="flex items-center justify-center gap-2 w-[88px] h-[40px] border bg-white rounded-lg relative text-[#1C1B1F]"
                                >
                                    <Filter size={16} />
                                    <span className="font-gabarito text-[14px]">Filter</span>

                                    {filterCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-[#03369D] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                            {filterCount}
                                        </span>
                                    )}
                                </button>

                                <FilterModal
                                    open={openFilter}
                                    onClose={() => setOpenFilter(false)}
                                    selected={selectedParties}
                                    setSelected={setSelectedParties}
                                    selectedStatus={selectedStatus}
                                    setSelectedStatus={setSelectedStatus}
                                    selectedRisks={selectedRisks}
                                    setSelectedRisks={setSelectedRisks}
                                    retention={retention}
                                    setRetention={setRetention}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* Body table + detail card */}
                <div className="flex flex-1 overflow-hidden text-[12px] px-10 pb-6 gap-0">
                    {/* ตาราง  flex-1 หดตัวเมื่อ card เปิด */}
                    <div className="flex-1 flex flex-col overflow-hidden min-w-[300px]"
                        style={{ width: tableWidth }}>
                        {/* ตาราง */}
                        <div className="bg-white rounded-xl shadow p-3 flex-1 overflow-y-auto">
                            <RopaTable
                                data={paginatedData}
                                selectedItem={selectedItem}
                                onRowClick={(item) => setSelectedItem(item)}
                                col={col}
                                riskMap={riskMap}
                                statusMap={statusMap}
                                badgeBase={badgeBase}
                            />

                        </div>

                        {/* ================= FOOTER ================= */}
                        <div className="mt-4 flex justify-between items-center text-sm shrink-0">
                            <span className="text-[#1C1B1F]">{totalItems} items</span>

                            <div className="flex items-center gap-2 text-[#1C1B1F]">
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
                    {/* เส้นกั้นสองตาราง */}
                    {selectedItem && (
                        <div
                            className="w-1 cursor-col-resize bg-gray-200"
                            onMouseDown={(e) => initResize(e)}
                        />
                    )}

                    {/* DetailCard */}
                    {selectedItem && (
                        <div
                            className="flex-shrink-0 rounded-xl overflow-hidden shadow"
                            style={{ width: detailWidth }}
                        >
                            <DetailCard item={selectedItem} onClose={() => setSelectedItem(null)} />
                        </div>
                    )}
                </div>

                {/* <div
    className="flex-1 overflow-y-auto py-6 transition-all duration-300"
    style={{ paddingLeft: selectedItem ? "40px" : "120px", paddingRight: selectedItem ? "40px" : "120px" }}
  >
                <div className="max-w-[1440px] mx-auto">
                    <div className="mb-4">
                        <div className="mt-6">
                            <div className="bg-white rounded-xl shadow p-3">
                                <div className="w-full flex flex-col">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
                  <DetailCard item={selectedItem} onClose={() => setSelectedItem(null)} /> */}
            </main>
        </div>
    );
}
"use client";

import React, { useState, useRef, useEffect } from "react";
import FilterModal from "./components/FilterModal";
import Breadcrumb from "./components/Breadcrumb";
import RopaTable from "./components/RopaTable";
import DetailCard from "./components/DetailCard";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { RopaItem } from "./types/ropa";
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
import LoadingScreen from "../components/Loading";


export default function RopaPage() {
  const [selectedItem, setSelectedItem] = useState<RopaItem | null>(null);
  const [data, setData] = useState<RopaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [formOptions, setFormOptions] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [role, setRole] = useState<"DPO" | "User" | "Admin" | "Viewer" | undefined>(undefined);
  
    useEffect(() => {
      const storedRole = localStorage.getItem("role") as
        | "DPO"
        | "User"
        | "Admin"
        | "Viewer"
        | null;
      setRole(storedRole ?? undefined);
    }, []);

  const breadcrumbItems = [
    { label: <ShieldAlert size={16} />, href: "/" },
    { label: "ROPA" },
  ];

  // ================= STATE =================
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [retention, setRetention] = useState({
    start: { year: "", month: "", day: "" },
    end: { year: "", month: "", day: "" },
  });
  const [detailWidth, setDetailWidth] = useState(420);

  const handleRowClick = async (item: RopaItem) => {
    setSelectedItem(item);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:8000/api/form/activity/${item.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const detailData = await res.json();

      if (!res.ok) {
        throw new Error(detailData.detail || "โหลดรายละเอียดไม่สำเร็จ");
      }

      setSelectedItem((prev) => ({
        ...item,
        ...(prev ?? {}),
        ...detailData,

        parties: detailData.parties?.length ? detailData.parties : item.parties,

        legal: detailData.legal ?? item.legal,

        retention: detailData.retention ?? item.retention,

        transfer: detailData.transfer ?? item.transfer,

        security: detailData.security ?? item.security,

        processors: detailData.processors ?? item.processors,
      }));
    } catch (err) {
      console.error("fetch detail error:", err);
    } finally {
    setLoadingDetail(false); 
  }
  };
  const ref = useRef<HTMLDivElement>(null);

  // ================= FETCH BACKEND =================
  useEffect(() => {
    const fetchRopa = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("กรุณา login ก่อน");

        const res = await fetch("http://localhost:8000/api/form/ropa", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const text = await res.text();
        let result: any;
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error("Backend ไม่ได้ส่ง JSON");
        }

        if (!res.ok)
          throw new Error(
            result.detail || result.error || "โหลดข้อมูล ROPA ไม่สำเร็จ",
          );

        console.log("ROPA RAW TEXT:", text);
        console.log("ROPA RESULT:", result);
        console.log("IS ARRAY:", Array.isArray(result));
        setData(Array.isArray(result) ? result : []);
      } catch (err: any) {
        setApiError(err.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    fetchRopa();
  }, []);

  // ================= CLICK OUTSIDE =================
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedStatus, selectedRisks, selectedParties, retention]);

  // ================= FILTER =================
  const normalize = (text: string) => String(text || "").toLowerCase();

  const filteredData = data.filter((item) => {
    const keyword = normalize(search);
    const matchSearch = normalize(item.activity).includes(keyword);
    const matchStatus =
      selectedStatus.length === 0 || selectedStatus.includes(item.status);
    const matchRisk =
      selectedRisks.length === 0 || selectedRisks.includes(item.risk);
    const matchParties =
      selectedParties.length === 0 ||
      (item.parties || []).some((p) => selectedParties.includes(p));

    const hasRetentionFilter =
      retention.start.year ||
      retention.start.month ||
      retention.start.day ||
      retention.end.year ||
      retention.end.month ||
      retention.end.day;

    let matchRetention = true;
    if (hasRetentionFilter) {
      const convertToDays = (text: string) => {
        const clean = (text || "").replace(/\s+/g, "");
        if (clean.includes("วัน")) return parseInt(clean) || 0;
        if (clean.includes("สัปดาห์")) return (parseInt(clean) || 0) * 7;
        if (clean.includes("เดือน")) return (parseInt(clean) || 0) * 30;
        if (clean.includes("ปี")) return (parseInt(clean) || 0) * 365;
        return 0;
      };
      const itemDays = convertToDays(item.retention?.retentionPeriod || "");
      const startDays =
        Number(retention.start.year || 0) * 365 +
        Number(retention.start.month || 0) * 30 +
        Number(retention.start.day || 0);
      const endDays =
        Number(retention.end.year || 0) * 365 +
        Number(retention.end.month || 0) * 30 +
        Number(retention.end.day || 0);
      const minDays = Math.min(startDays, endDays);
      const maxDays = Math.max(startDays, endDays);
      if (minDays > 0 && maxDays > 0)
        matchRetention = itemDays >= minDays && itemDays <= maxDays;
      else if (minDays > 0) matchRetention = itemDays >= minDays;
      else if (maxDays > 0) matchRetention = itemDays <= maxDays;
    }

    return (
      matchSearch && matchStatus && matchRisk && matchRetention && matchParties
    );
  });

  // ================= PAGINATION =================
  const itemsPerPage = 10;
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage,
  );

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

  const today = new Date().toISOString().split("T")[0];
  const isSameDay = startDate && endDate && startDate === endDate;
  const isToday = isSameDay && startDate === today;
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // ================= RESIZE =================
  const initResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startW = detailWidth;
    const containerWidth = window.innerWidth;

    const onMove = (e: MouseEvent) => {
      const dx = startX - e.clientX;
      const newW = startW + dx;

      // min 280px, max 60% ของหน้าจอ
      const minW = 280;
      const maxW = containerWidth * 0.6;

      setDetailWidth(Math.min(maxW, Math.max(minW, newW)));
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // เพิ่ม useEffect นี้ใน RopaPage
  useEffect(() => {
    const handleResize = () => {
      const maxW = window.innerWidth * 0.6;
      setDetailWidth((prev) => Math.min(prev, maxW));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:8000/api/form/options", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "โหลด options ไม่สำเร็จ");
      }

      setFormOptions(data);
    } catch (err) {
      console.error("fetchOptions error:", err);
    }
  };

  fetchOptions();
}, []);

  return (
    <div className="flex h-screen bg-gray-100 font-prompt overflow-hidden">
      {/* ================= Sidebar ================= */}
      {/* <aside className="w-20 flex flex-col items-center py-4 flex-shrink-0">
        <Sidebar userEmail="" userName="" />
      </aside> */}

      {/* ================= Main ================= */}
      {/* <main className="flex-1 overflow-y-auto px-[120px] py-6"> */}
      <main className="flex-1 flex flex-col overflow-hidden text-[12px] ">
        {/* ฝั่งซ้ายโรป้า */}
        {/*  Filter bar ให้มันอยู่บนสุด เต็มความกว้าง */}
        <div className="px-10 pt-6 pb-4 shrink-0">
          <div className="mb-3">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="border-b border-gray-200 mb-4" />
          <br />

          <div className="flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center">
            {/* DATE FILTER */}
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
                          {isToday && (
                            <span className="text-[#03369D]">(today)</span>
                          )}
                        </>
                      ) : (
                        <>
                          {formatDate(startDate)}
                          <span className="text-gray-400 mx-1">-</span>
                          {formatDate(endDate)}
                        </>
                      )
                    ) : (
                      <span className="text-[#616872] text-[12px]">
                        เลือกช่วงวันที่
                      </span>
                    )}
                  </span>
                </span>
                <ChevronDown size={16} className="text-[#A6A6A6]" />
              </button>

              {open && (
                <div className="absolute mt-2 w-[264px] bg-white border rounded-xl shadow-lg p-4 z-20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-[#1C1B1F]">
                      เลือกช่วงวันที่
                    </span>
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="text-xs text-[#03369D] hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      ["วันเริ่มต้น", startDate, setStartDate],
                      ["วันสิ้นสุด", endDate, setEndDate],
                    ].map(([label, value, setter]: any) => (
                      <div key={label} className="flex flex-col gap-1">
                        <label className="text-xs text-[#1C1B1F]">
                          {label}
                        </label>
                        <input
                          type="date"
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setOpen(false)}
                      className="text-sm bg-[#03369D] text-white px-4 py-1.5 rounded-md hover:bg-[#012a7c]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-4 items-center text-[12px]">
              <Link href="/form">
                <button className="flex items-center justify-center gap-2 w-[128px] h-[40px] bg-[#03369D] hover:bg-[#012a7c] text-white rounded-lg">
                  <Plus size={16} /> เพิ่มกิจกรรม
                </button>
              </Link>
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
              <div className="relative">
                <button
                  onClick={() => setOpenFilter(!openFilter)}
                  className="flex items-center justify-center gap-2 w-[88px] h-[40px] border bg-white rounded-lg text-[#1C1B1F]"
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
                  departmentOptions={[
                    { label: "ฝ่าย HR", value: "HR" },
                    { label: "ฝ่าย IT", value: "IT" },
                    { label: "ฝ่ายการตลาด", value: "Marketing" },
                    { label: "ฝ่ายขาย", value: "Sales" },
                    { label: "ฝ่ายประชาสัมพันธ์", value: "PR" },
                  ]}
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

        {/* BODY */}
        <div className="flex flex-1 overflow-hidden text-[12px] px-10 pb-6 gap-0">
          {/* <div className="flex-1 flex flex-col overflow-hidden min-w-[300px]"> */}
          <div
            className="flex flex-col overflow-hidden"
            style={{
              flex: 1,
              minWidth: selectedItem ? "320px" : "auto",
            }}
          >
            <div className="bg-white rounded-xl shadow p-3 flex-1 overflow-y-auto">
              {/* {loading ? (
                <div className="text-center text-gray-400 py-6">
                  กำลังโหลดข้อมูล...
                </div> */}
              {loading ? (
                <LoadingScreen
                  message="กำลังโหลดข้อมูล ROPA..."
                  fullScreen={false}
                />
              ) : apiError ? (
                <div className="text-center text-red-500 py-6">{apiError}</div>
              ) : (
                <RopaTable
                  data={paginatedData}
                  selectedItem={selectedItem}
                  onRowClick={handleRowClick}
                  col={col}
                  riskMap={riskMap}
                  statusMap={statusMap}
                  badgeBase={badgeBase}
                />
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex justify-between items-center text-sm shrink-0">
              <span className="text-[#1C1B1F]">{totalItems} items</span>
              <div className="flex items-center gap-2 text-[#1C1B1F]">
                <ChevronLeft
                  size={18}
                  className={`cursor-pointer ${page === 1 ? "opacity-30 pointer-events-none" : ""}`}
                  onClick={() => setPage(page - 1)}
                />
                <span className="font-gabarito">Page</span>
                <input
                  type="number"
                  value={page}
                  min={1}
                  max={totalPages}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1 && v <= totalPages) setPage(v);
                  }}
                  className="w-12 border rounded px-2 py-1"
                />
                <span className="font-gabarito">of {totalPages}</span>
                <ChevronRight
                  size={18}
                  className={`cursor-pointer ${page === totalPages ? "opacity-30 pointer-events-none" : ""}`}
                  onClick={() => setPage(page + 1)}
                />
              </div>
            </div>
          </div>

          {/* Resize handle */}
          {selectedItem && (
            <div
              className="w-1.5 cursor-col-resize bg-gray-200 hover:bg-blue-300 transition flex-shrink-0 mx-0.5"
              onMouseDown={initResize}
            />
          )}

          {/* Detail card */}
          {selectedItem && (
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden shadow"
              style={{
                width: detailWidth,
                minWidth: "280px",
                maxWidth: "60vw",
              }}
            >
              <DetailCard
  item={selectedItem}
  onClose={() => setSelectedItem(null)}
  role={role}
  formOptions={formOptions}
  loadingDetail={loadingDetail}
  onDelete={(itemId) => {
    setData((prev) => prev.filter((x) => x.id !== itemId));
    setSelectedItem(null);
  }}
/>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
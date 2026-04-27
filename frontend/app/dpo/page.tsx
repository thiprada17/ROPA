"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronUp,
  ChevronsDown,
  ClockFading,
  CheckCircle,
  AlertTriangle,
  EllipsisVertical,
  Shield,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Breadcrumb from "../Ropa/components/Breadcrumb";
import DetailCard from "../Ropa/components/DetailCard";
import FilterModal from "../Ropa/components/FilterModal";
import { RopaItem } from "../Ropa/types/ropa";

const role =
  typeof window !== "undefined"
    ? (localStorage.getItem("role") as "DPO" | "User")
    : undefined;

export default function DpoPage() {
  const breadcrumbItems = [
    { label: <Shield size={16} />, href: "/" },
    { label: "DPO" },
  ];

  const [data, setData] = useState<RopaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [selectedItem, setSelectedItem] = useState<RopaItem | null>(null);
  const [detailWidth, setDetailWidth] = useState(420);
  const [commentsMap, setCommentsMap] = useState<Record<string, {username: string; text: string}[]>>({});

  // filters
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [openDate, setOpenDate] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node))
        setOpenDate(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, selectedStatus, selectedRisks, selectedParties]);

  useEffect(() => {
    const fetchDpo = async () => {
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
        if (!res.ok) throw new Error(result.error || "โหลดข้อมูลไม่สำเร็จ");
        setData(Array.isArray(result) ? result : []);
      } catch (err: any) {
        setApiError(err.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    fetchDpo();
  }, []);

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  const filtered = data.filter((item) => {
    const kw = search.toLowerCase();
    const matchSearch = String(item.activity || "")
      .toLowerCase()
      .includes(kw);
    const matchStatus =
      selectedStatus.length === 0 || selectedStatus.includes(item.status);
    const matchRisk =
      selectedRisks.length === 0 || selectedRisks.includes(item.risk);
    const matchParties =
      selectedParties.length === 0 ||
      (item.parties || []).some((p) => selectedParties.includes(p));
    const matchDate = (!startDate && !endDate) || true;
    return matchSearch && matchStatus && matchRisk && matchParties && matchDate;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );
  const filterCount =
    selectedStatus.length + selectedRisks.length + selectedParties.length;

  const riskMap: Record<string, { color: string; icon: React.ReactNode }> = {
    Critical: {
      color: "bg-[#F0AFBE] text-[#BD263F]",
      icon: <ChevronsUp size={13} />,
    },
    "At Risk": {
      color: "bg-[#F3E3AE] text-[#A37D00]",
      icon: <ChevronUp size={13} />,
    },
    Stable: {
      color: "bg-[#D1E7F0] text-[#0078A3]",
      icon: <ChevronsDown size={13} />,
    },
    Safe: {
      color: "bg-[#B5DDD8] text-[#228679]",
      icon: <ChevronDown size={13} />,
    },
  };

  const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
    Pending: {
      color: "border border-gray-300 text-[#03369D]",
      icon: <ClockFading size={13} />,
    },
    Complete: {
      color: "border border-gray-300 text-[#1C635A]",
      icon: <CheckCircle size={13} />,
    },
    Revision: {
      color: "border border-gray-300 text-[#AC273C]",
      icon: <AlertTriangle size={13} />,
    },
  };

  const badge =
    "flex items-center justify-center gap-1 px-3 py-[4px] rounded-full text-[11px] font-medium min-w-[90px]";

  const colConfig = "2fr 1.2fr 1.5fr 1.5fr 1fr 1fr 0.1fr";

  // resize
  const initResize = (e: React.MouseEvent) => {
    const startX = e.clientX;
    const startW = detailWidth;
    const onMove = (e: MouseEvent) => {
      const dx = startX - e.clientX;
      setDetailWidth(Math.min(800, Math.max(300, startW + dx)));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div className="flex h-screen bg-gray-100 font-prompt text-[12px] overflow-hidden">
      <aside className="w-20 flex-shrink-0">
        <Sidebar userName="DPO User" userEmail="dpo@mail.com" />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-10 pt-6 pb-4 shrink-0">
          <div className="mb-3">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div className="border-b border-gray-200 mb-4" />
          <br />

          <div className="flex flex-col md:flex-row md:justify-between gap-4 items-start md:items-center">
            {/* Date picker */}
            <div className="relative" ref={dateRef}>
              <button
                onClick={() => setOpenDate(!openDate)}
                className="flex items-center justify-between gap-2 bg-white border rounded-lg px-4 h-[40px] w-[274px] shadow-sm hover:border-gray-400 transition"
              >
                <span className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar size={15} className="shrink-0" />
                  <span className="truncate text-[12px]">
                    {startDate && endDate ? (
                      `${formatDate(startDate)} — ${formatDate(endDate)}`
                    ) : (
                      <span className="text-gray-400">เลือกช่วงวันที่</span>
                    )}
                  </span>
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {openDate && (
                <div className="absolute mt-2 w-[264px] bg-white border rounded-xl shadow-lg p-4 z-20">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[13px] font-semibold text-gray-800">
                      เลือกช่วงวันที่
                    </span>
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {[
                      ["วันเริ่มต้น", startDate, setStartDate],
                      ["วันสิ้นสุด", endDate, setEndDate],
                    ].map(([label, val, setter]: any) => (
                      <div key={label}>
                        <label className="text-[11px] text-gray-500 block mb-1">
                          {label}
                        </label>
                        <input
                          type="date"
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          className="border rounded-md px-2 py-1.5 text-[12px] w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => setOpenDate(false)}
                      className="text-[12px] bg-[#03369D] text-white px-4 py-1.5 rounded-md hover:bg-[#012a7c]"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search + Filter */}
            <div className="flex gap-3 items-center">
              <div className="flex items-center gap-2 border rounded-lg px-3 w-[304px] h-[40px] bg-white">
                <Search size={15} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="ค้นหากิจกรรม หน่วยงานที่รับผิดชอบ"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full outline-none text-[12px] text-gray-700"
                />
              </div>

              <div className="relative">
                <button
                  onClick={() => setOpenFilter(!openFilter)}
                  className="flex items-center justify-center gap-2 w-[88px] h-[40px] border bg-white rounded-lg text-[12px] relative hover:bg-gray-50"
                >
                  <Filter size={15} />
                  <span>Filters</span>
                  {filterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#03369D] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                      {filterCount}
                    </span>
                  )}
                </button>
                <FilterModal
                  open={openFilter}
                  onClose={() => setOpenFilter(false)}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedRisks={selectedRisks}
                  setSelectedRisks={setSelectedRisks}
                  selectedParties={selectedParties}
                  setSelectedParties={setSelectedParties}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table + Detail */}
        <div className="flex flex-1 overflow-hidden px-10 pb-6 gap-0">
          {/* Table */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-[300px]">
            <div className="bg-white rounded-xl shadow p-3 flex-1 overflow-y-auto">
              {/* Header */}
              <div
                className="grid gap-2 mb-2 pl-4 pr-2 text-center text-[11px]"
                style={{ gridTemplateColumns: colConfig }}
              >
                {[
                  "กิจกรรมประมวลผล",
                  "ฝ่ายที่เกี่ยวข้อง",
                  "วัตถุประสงค์",
                  "ฐานกฎหมาย",
                  "ความเสี่ยง",
                  "สถานะ",
                  "",
                ].map((h, i) => (
                  <div
                    key={i}
                    className={`px-3 py-3 rounded-lg ${h ? "bg-[#03369D] text-white" : ""}`}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Body */}
              <div className="flex flex-col gap-1">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">
                    กำลังโหลดข้อมูล...
                  </div>
                ) : apiError ? (
                  <div className="text-center text-red-500 py-8">
                    {apiError}
                  </div>
                ) : paginated.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    ไม่พบข้อมูล
                  </div>
                ) : (
                  paginated.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`grid items-center pl-4 pr-1 py-3 border-b cursor-pointer transition ${selectedItem?.id === item.id ? "bg-[#EEF3FF]" : "hover:bg-gray-50"}`}
                      style={{ gridTemplateColumns: colConfig }}
                    >
                      {/* กิจกรรม */}
                      <div className="truncate text-gray-800 font-medium pr-2">
                        {item.activity}
                      </div>

                      {/* ฝ่าย */}
                      <div className="flex items-center gap-1 overflow-hidden min-w-0">
                        {(item.parties || []).slice(0, 2).map((p, i) => (
                          <span
                            key={i}
                            className="bg-[#DFE9FF] text-[#03369D] px-2 py-1 rounded-md text-[10px] whitespace-nowrap shrink-0"
                            title={p}
                          >
                            {p}
                          </span>
                        ))}
                        {(item.parties || []).length > 2 && (
                          <span className="text-gray-400 text-[10px]">
                            +{(item.parties || []).length - 2}
                          </span>
                        )}
                      </div>

                      {/* วัตถุประสงค์ */}
                      <div className="truncate text-gray-600 pr-2">
                        {item.purpose}
                      </div>

                      {/* ฐานกฎหมาย */}
                      <div className="flex items-center gap-1 overflow-hidden min-w-0">
                        {(item.legal?.basis || []).slice(0, 1).map((l, i) => (
                          <span
                            key={i}
                            className="bg-[#DFE9FF] text-[#03369D] px-2 py-1 rounded-md text-[10px] truncate"
                            title={l}
                          >
                            {l}
                          </span>
                        ))}
                        {(item.legal?.basis || []).length > 1 && (
                          <span className="text-gray-400 text-[10px]">
                            +{(item.legal?.basis || []).length - 1}
                          </span>
                        )}
                      </div>

                      {/* ความเสี่ยง */}
                      <div className="flex justify-center">
                        <span
                          className={`${badge} ${riskMap[item.risk]?.color || "bg-gray-100 text-gray-600"}`}
                        >
                          {riskMap[item.risk]?.icon}
                          {item.risk}
                        </span>
                      </div>

                      {/* สถานะ */}
                      <div className="flex justify-center">
                        <span
                          className={`${badge} ${statusMap[item.status]?.color || "border border-gray-300 text-gray-600"}`}
                        >
                          {statusMap[item.status]?.icon}
                          {item.status}
                        </span>
                      </div>

                      {/* action */}
                      <div className="flex justify-end">
                        <button
                          className="p-1 hover:bg-gray-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                          }}
                        >
                          <EllipsisVertical size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center text-[12px] shrink-0">
              <span className="text-gray-500">{filtered.length} items</span>
              <div className="flex items-center gap-2">
                <ChevronLeft
                  size={18}
                  className={`cursor-pointer ${page === 1 ? "opacity-30 pointer-events-none" : "hover:text-blue-600"}`}
                  onClick={() => setPage((p) => p - 1)}
                />
                <span>Page</span>
                <input
                  type="number"
                  value={page}
                  min={1}
                  max={totalPages}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1 && v <= totalPages) setPage(v);
                  }}
                  className="w-12 border rounded px-2 py-1 text-center"
                />
                <span>of {totalPages}</span>
                <ChevronRight
                  size={18}
                  className={`cursor-pointer ${page === totalPages ? "opacity-30 pointer-events-none" : "hover:text-blue-600"}`}
                  onClick={() => setPage((p) => p + 1)}
                />
              </div>
            </div>
          </div>

          {/* Resize handle */}
          {selectedItem && (
            <div
              className="w-1 cursor-col-resize bg-gray-200 hover:bg-blue-300 transition mx-1"
              onMouseDown={initResize}
            />
          )}

          {/* Detail card */}
          {selectedItem && (
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden shadow"
              style={{ width: detailWidth }}
            >
              <DetailCard
                item={selectedItem}
                onClose={() => setSelectedItem(null)}
                role={role}
                existingComments={commentsMap[selectedItem.id] ?? []}
                onStatusChange={(itemId, newStatus) => {
                  setData((prev) =>
                    prev.map((r) =>
                      r.id === itemId ? { ...r, status: newStatus } : r,
                    ),
                  );
                  setSelectedItem((prev) =>
                    prev ? { ...prev, status: newStatus } : prev,
                  );
                }}
                onAddComment={(itemId, comment) => {
                  setCommentsMap((prev) => ({
                    ...prev,
                    [itemId]: [...(prev[itemId] ?? []), comment],
                  }));
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

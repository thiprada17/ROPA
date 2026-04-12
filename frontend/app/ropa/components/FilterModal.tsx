"use client";

import { useEffect, useRef, useState } from "react";
import {
    X,
    ChevronsUp,
    ChevronDown,
    ChevronUp,
    ChevronsDown,
    Check,
} from "lucide-react";

export default function FilterModal({
    open,
    onClose,
    selectedTypes,
    setSelectedTypes,
    selectedRisks,
    setSelectedRisks,
    retention,
    setRetention,
}: any) {
    // =========================
    // STATE & REF
    // =========================
    const ref = useRef<HTMLDivElement>(null);
    const [retentionError, setRetentionError] = useState(false);

    // =========================
    // HANDLE CLICK OUTSIDE MODAL
    // =========================
    useEffect(() => {
        function handleClick(e: any) {
            if (ref.current && !ref.current.contains(e.target)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    // ถ้า modal ไม่เปิด → ไม่ render
    if (!open) return null;

    // =========================
    // UTIL FUNCTIONS
    // =========================

    // เช็คว่ากรอก retention ครบหรือยัง
    const isRetentionFilled = () => {
        const { start, end } = retention;

        return (
            start.year !== "" &&
            start.month !== "" &&
            start.day !== "" &&
            end.year !== "" &&
            end.month !== "" &&
            end.day !== ""
        );
    };

    // เติมค่า 0 ถ้ายังไม่ได้กรอก
    const fillZero = (r: any) => ({
        start: {
            year: r.start.year || "0",
            month: r.start.month || "0",
            day: r.start.day || "0",
        },
        end: {
            year: r.end.year || "0",
            month: r.end.month || "0",
            day: r.end.day || "0",
        },
    });

    // =========================
    // RENDER
    // =========================
    return (
        <div className="absolute right-0 mt-2 z-50">
            <div
                ref={ref}
                className="bg-white w-[410px] text-[12px] rounded-lg p-4 shadow-md border max-h-[64vh] overflow-y-auto"
            >
                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-center">
                    <h2 className="text-sm font-semibold">Filters</h2>
                    <X size={16} className="cursor-pointer" onClick={onClose} />
                </div>

                <hr className="my-3" />

                {/* ================= TYPE FILTER ================= */}
                <div className="mb-4">
                    <p className="text-xs font-medium mb-2">
                        ประเภทข้อมูลส่วนบุคคล
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {[
                            "ข้อมูลผู้สมัครงาน",
                            "ข้อมูลบุคลากรใหม่",
                            "ข้อมูลบุคลากร",
                            "อื่น ๆ",
                        ].map((item, i) => {
                            const active = selectedTypes.includes(item);

                            return (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (active) {
                                            // เอาออก
                                            setSelectedTypes(
                                                selectedTypes.filter(
                                                    (t: string) => t !== item
                                                )
                                            );
                                        } else {
                                            // เพิ่มเข้าไป
                                            setSelectedTypes([
                                                ...selectedTypes,
                                                item,
                                            ]);
                                        }
                                    }}
                                    className={`px-3 py-1.5 border rounded-full flex items-center gap-2 text-xs
                                    ${
                                        active
                                            ? "border-blue-600 bg-blue-50"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {/* checkbox circle */}
                                    <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center
                                        ${
                                            active
                                                ? "bg-blue-600 border-blue-600"
                                                : "border-gray-400"
                                        }`}
                                    >
                                        {active && (
                                            <Check
                                                size={10}
                                                className="text-white"
                                            />
                                        )}
                                    </div>

                                    {item}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ================= RETENTION FILTER ================= */}
                <div className="mb-4">
                    <p className="text-xs font-medium mb-2">
                        ระยะเวลาในการจัดเก็บข้อมูล
                        {retentionError && (
                            <span className="text-red-500 ml-2">
                                กรุณากรอกให้ครบ (ไม่มีใส่ 0)
                            </span>
                        )}
                    </p>

                    <div className="flex flex-wrap items-center gap-1">
                        {/* ---------- START ---------- */}
                        <input
                            value={retention.start.year}
                            placeholder="0"
                            onChange={(e) =>
                                setRetention({
                                    ...retention,
                                    start: {
                                        ...retention.start,
                                        year: e.target.value,
                                    },
                                })
                            }
                            className={`w-8 h-8 border rounded text-xs text-center
                            ${
                                retentionError
                                    ? "border-red-500 bg-red-50"
                                    : retention.start.year
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        />
                        ปี

                        <input
                            value={retention.start.month}
                            placeholder="0"
                            onChange={(e) =>
                                setRetention({
                                    ...retention,
                                    start: {
                                        ...retention.start,
                                        month: e.target.value,
                                    },
                                })
                            }
                            className={`w-8 h-8 border rounded text-xs text-center
                            ${
                                retentionError
                                    ? "border-red-500 bg-red-50"
                                    : retention.start.month
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        />
                        เดือน

                        <input
                            value={retention.start.day}
                            placeholder="0"
                            onChange={(e) =>
                                setRetention({
                                    ...retention,
                                    start: {
                                        ...retention.start,
                                        day: e.target.value,
                                    },
                                })
                            }
                            className={`w-8 h-8 border rounded text-xs text-center
                            ${
                                retentionError
                                    ? "border-red-500 bg-red-50"
                                    : retention.start.day
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        />
                        วัน

                        <span className="mx-1">-</span>

                        {/* ---------- END ---------- */}
                        <input
                            value={retention.end.year}
                            placeholder="0"
                            onChange={(e) =>
                                setRetention({
                                    ...retention,
                                    end: {
                                        ...retention.end,
                                        year: e.target.value,
                                    },
                                })
                            }
                            className={`w-8 h-8 border rounded text-xs text-center
                            ${
                                retentionError
                                    ? "border-red-500 bg-red-50"
                                    : retention.end.year
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        />
                        ปี

                        <input
                            value={retention.end.month}
                            placeholder="0"
                            onChange={(e) =>
                                setRetention({
                                    ...retention,
                                    end: {
                                        ...retention.end,
                                        month: e.target.value,
                                    },
                                })
                            }
                            className={`w-8 h-8 border rounded text-xs text-center
                            ${
                                retentionError
                                    ? "border-red-500 bg-red-50"
                                    : retention.end.month
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        />
                        เดือน

                        <input
                            value={retention.end.day}
                            placeholder="0"
                            onChange={(e) =>
                                setRetention({
                                    ...retention,
                                    end: {
                                        ...retention.end,
                                        day: e.target.value,
                                    },
                                })
                            }
                            className={`w-8 h-8 border rounded text-xs text-center
                            ${
                                retentionError
                                    ? "border-red-500 bg-red-50"
                                    : retention.end.day
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                            }`}
                        />
                        วัน
                    </div>
                </div>

                {/* ================= RISK FILTER ================= */}
                <div className="mb-4">
                    <p className="text-xs font-medium mb-2">
                        ระดับความเสี่ยง
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                label: "Very High",
                                icon: (
                                    <ChevronsUp
                                        size={14}
                                        className="text-red-500"
                                    />
                                ),
                            },
                            {
                                label: "High",
                                icon: (
                                    <ChevronUp
                                        size={14}
                                        className="text-red-400"
                                    />
                                ),
                            },
                            {
                                label: "Very Low",
                                icon: (
                                    <ChevronsDown
                                        size={14}
                                        className="text-green-400"
                                    />
                                ),
                            },
                            {
                                label: "Low",
                                icon: (
                                    <ChevronDown
                                        size={14}
                                        className="text-green-600"
                                    />
                                ),
                            },
                        ].map((r, i) => {
                            const active = selectedRisks.includes(r.label);

                            return (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (active) {
                                            setSelectedRisks(
                                                selectedRisks.filter(
                                                    (x: string) =>
                                                        x !== r.label
                                                )
                                            );
                                        } else {
                                            setSelectedRisks([
                                                ...selectedRisks,
                                                r.label,
                                            ]);
                                        }
                                    }}
                                    className={`border rounded-md p-2 flex items-center text-xs cursor-pointer relative
                                    ${
                                        active
                                            ? "bg-blue-50 border-blue-600"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    {/* label */}
                                    <div className="flex items-center gap-1 w-full justify-center">
                                        {r.icon}
                                        {r.label}
                                    </div>

                                    {/* remove button */}
                                    {active && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRisks(
                                                    selectedRisks.filter(
                                                        (x: string) =>
                                                            x !== r.label
                                                    )
                                                );
                                            }}
                                            className="absolute right-2 text-blue-600 cursor-pointer"
                                        >
                                            ✕
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <hr className="my-3" />

                {/* ================= FOOTER ================= */}
                <div className="flex justify-between items-center">
                    {/* CLEAR ALL */}
                    <button
                        onClick={() => {
                            setSelectedTypes([]);
                            setSelectedRisks([]);
                            setRetention({
                                start: { year: "", month: "", day: "" },
                                end: { year: "", month: "", day: "" },
                            });
                        }}
                        className="bg-red-500 font-gabarito text-white px-3 py-1 text-xs rounded-md"
                    >
                        Clear All
                    </button>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="bg-gray-200 px-3 py-1 text-xs rounded-md font-gabarito"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={() => {
                                const hasAnyValue =
                                    retention.start.year ||
                                    retention.start.month ||
                                    retention.start.day ||
                                    retention.end.year ||
                                    retention.end.month ||
                                    retention.end.day;

                                if (hasAnyValue) {
                                    const filled = fillZero(retention);
                                    setRetention(filled);
                                }

                                setRetentionError(false);
                                onClose();
                            }}
                            className="bg-blue-700 font-gabarito text-white px-3 py-1 text-xs rounded-md"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
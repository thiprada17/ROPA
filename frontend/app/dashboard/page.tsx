"use client";

import { ropaMock } from "../ropa/data/ropaMock";
import TotalRopaCard from "./components/TotalRopaCard";
import ApprovalCard from "./components/ApprovalCard";
import ActivityCard from "./components/ActivityCard";
import OverallDonutCard from "./components/OverallDonutCard";
import ComparisonBarChart from "./components/ComparisonBarChart";
import TrendLineChart from "./components/TrendLineChart";
import Sidebar from "../components/Sidebar";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import MultiSelect from "../components/MultiSelect";

// ================= TYPE =================
type Dept = {
    name: string;
    atRisk: number;
    critical: number;
    safe: number;
    stable: number;
};

export default function DashboardPage() {

    // ================= FILTER STATE =================
    // เลือกช่วงเวลา
    const [range, setRange] = useState("1W");

    // เก็บ department ที่เลือก (multi-select)
    const [selectedDept, setSelectedDept] = useState<string[]>([]);

    // ================= DEPARTMENT OPTIONS =================
    // ดึง list department ทั้งหมดจากข้อมูล (unique)
    const deptOptions = Array.from(
        new Set(ropaMock.flatMap((r) => r.parties ?? []))
    );

    // ================= FILTER DATA (สำคัญมาก) =================
    // ถ้าไม่เลือก = ใช้ทั้งหมด
    // ถ้าเลือก = filter ตาม department
    const filteredRopa = useMemo(() => {
        if (selectedDept.length === 0) return ropaMock;

        return ropaMock.filter((r) =>
            r.parties?.some((p) => selectedDept.includes(p))
        );
    }, [selectedDept]);

    // ================= KPI =================
    const total = filteredRopa.length;

    const newCount = filteredRopa.filter((r) =>
        r.history?.some((h) => h.action === "create")
    ).length;

    const approved = filteredRopa.filter((r) => r.status === "Complete").length;

    const approvalGrowth = total
        ? Number(((approved / total) * 100).toFixed(1))
        : 0;

    // ================= ACTIVITIES =================
    const activities = filteredRopa.flatMap((r, idx) =>
        (r.history ?? []).map((h, i) => ({
            id: `${r.id}-${idx}-${i}`,
            activity: r.activity ?? "No activity",
            parties: r.parties ?? [],
            risk: r.risk ?? "Safe",
            date: h?.date ?? "",
        }))
    );

    // ================= RISK SUMMARY =================
    const riskMap: Record<string, number> = {};

    filteredRopa.forEach((r) => {
        riskMap[r.risk] = (riskMap[r.risk] || 0) + 1;
    });

    const overall = Object.entries(riskMap).map(([name, value]) => ({
        name,
        value: total ? Number(((value / total) * 100).toFixed(2)) : 0,
    }));

    // ================= COMPARISON BY DEPT =================
    const deptMap: Record<string, Dept> = {};

    filteredRopa.forEach((r) => {
        (r.parties ?? []).forEach((p) => {
            if (!deptMap[p]) {
                deptMap[p] = {
                    name: p,
                    atRisk: 0,
                    critical: 0,
                    safe: 0,
                    stable: 0,
                };
            }

            if (r.risk === "At Risk") deptMap[p].atRisk++;
            if (r.risk === "Critical") deptMap[p].critical++;
            if (r.risk === "Safe") deptMap[p].safe++;
            if (r.risk === "Stable") deptMap[p].stable++;
        });
    });

    const comparison = Object.values(deptMap).filter((d) =>
        selectedDept.length === 0 || selectedDept.includes(d.name)
    );

    // ================= TREND DATA =================
    const getTrendData = (range: string) => {
        const now = new Date();
        const map: Record<string, number> = {};

        let labels: string[] = [];

        // ================= LABEL GENERATION =================
        if (range === "1W") {
            labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        }

        else if (range === "1M") {
            const daysInMonth = new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                0
            ).getDate();

            labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
        }

        else if (range === "3M" || range === "6M") {
            const count = range === "3M" ? 3 : 6;

            const months = [];
            for (let i = count - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push(
                    d.toLocaleString("en-US", { month: "short" })
                );
            }

            labels = months;
        }

        else if (range === "1Y") {
            labels = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
        }

        // ================= COUNT DATA =================
        filteredRopa.forEach((r) => {
            r.history?.forEach((h) => {
                if (!h?.date) return;

                const date = new Date(h.date);
                if (isNaN(date.getTime())) return;

                let key = "";

                if (range === "1W") {
                    key = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
                }

                else if (range === "1M") {
                    key = String(date.getDate());
                }

                else {
                    key = date.toLocaleString("en-US", { month: "short" });
                }

                if (labels.includes(key)) {
                    map[key] = (map[key] || 0) + 1;
                }
            });
        });

        // ================= FINAL RESULT =================
        return labels.map((label) => ({
            day: label,
            value: map[label] || 0,
        }));
    };

    const trend = useMemo(() => getTrendData(range), [range, filteredRopa]);

    // ================= UI =================
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />

            <main className="flex-1 bg-[#F7F8FA] h-screen overflow-y-auto font-gabarito">
                <div className="px-10 py-6 max-w-7xl ml-[180px] mr-[120px]">

                    {/* ================= HEADER ================= */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-[24px] font-semibold">Dashboard</h1>

                        <div className="flex gap-3">

                            {/* ================= RANGE SELECT ================= */}
                            <div className="relative">
                                <select
                                    className="appearance-none border border-[#616872] rounded-[6px] px-3 py-1 pr-8 text-sm"
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                >
                                    <option value="1W">Last 1 Week</option>
                                    <option value="1M">Last 1 Month</option>
                                    <option value="3M">Last 3 Months</option>
                                    <option value="6M">Last 6 Months</option>
                                    <option value="1Y">Last 1 Year</option>
                                </select>

                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            </div>

                            {/* ================= DEPARTMENT MULTI FILTER ================= */}
                            <div className="min-w-[180px] max-w-[600px]">
                                <MultiSelect
                                    options={deptOptions}
                                    selected={selectedDept}
                                    onChange={(val) => {
                                        // ถ้าเลือกครบทุก option
                                        if (val.length === deptOptions.length) {
                                            setSelectedDept([]); // 👉 reset เป็น All Department
                                        } else {
                                            setSelectedDept(val);
                                        }
                                    }}
                                    placeholder="All Department"
                                    className="!min-h-[30px] !h-[30px] px-3 py-1 text-sm border-[#616872] !rounded-[6px] text-black"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ================= CONTENT ================= */}
                    <div className="flex flex-col gap-6">

                        {/* TOP CARDS */}
                        <div className="flex justify-between">
                            <div className="w-[240px] flex flex-col gap-[28px]">
                                <TotalRopaCard total={total} newCount={newCount} />
                                <ApprovalCard total={approved} growth={approvalGrowth} />
                            </div>

                            <div className="w-[292px]">
                                <ActivityCard activities={activities} />
                            </div>

                            <div className="w-[509px]">
                                <OverallDonutCard
                                    dataSource={filteredRopa}
                                    selectedDept={selectedDept}
                                />
                            </div>
                        </div>

                        {/* CHARTS */}
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-8">
                                <ComparisonBarChart data={comparison} />
                            </div>

                            <div className="col-span-4">
                                <TrendLineChart data={trend} />
                            </div>
                        </div>

                    </div>

                </div>
            </main>
        </div>
    );
}
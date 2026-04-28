"use client";

import TotalRopaCard from "./components/TotalRopaCard";
import ApprovalCard from "./components/ApprovalCard";
import ActivityCard from "./components/ActivityCard";
import OverallDonutCard from "./components/OverallDonutCard";
import ComparisonBarChart from "./components/ComparisonBarChart";
import TrendLineChart from "./components/TrendLineChart";
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
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
  const [totalData, setTotalData] = useState({ total: 0, newCount: 0 });
  const [approvalData, setApprovalData] = useState({ total: 0, growth: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [rawList, setRawList] = useState<any[]>([]);
  const [comparison, setComparison] = useState<Dept[]>([]);
  const [trend, setTrend] = useState<{ day: string; value: number }[]>([]);

  // ================= FILTER STATE =================
  // เลือกช่วงเวลา
  const [range, setRange] = useState("1W");

  // เก็บ department ที่เลือก (multi-select)
  const [selectedDept, setSelectedDept] = useState<string[]>([]);

  const deptOptions = Array.from(
    new Set(rawList.flatMap((r) => r.parties ?? [])),
  );

  useEffect(() => {
    async function fetchDashboard() {
      const [
        totalRes,
        approvalRes,
        activitiesRes,
        rawRes,
        comparisonRes,
        trendRes,
      ] = await Promise.all([
        fetch("http://127.0.0.1:8000/api/dashboard/total"),
        fetch("http://127.0.0.1:8000/api/dashboard/approval"),
        fetch("http://127.0.0.1:8000/api/dashboard/activities"),
        fetch("http://127.0.0.1:8000/api/dashboard/raw"),
        fetch("http://127.0.0.1:8000/api/dashboard/comparison"),
        fetch(`http://127.0.0.1:8000/api/dashboard/trend?range=${range}`),
      ]);

      const totalJson = await totalRes.json();
      const approvalJson = await approvalRes.json();
      const activitiesJson = await activitiesRes.json();
      const rawJson = await rawRes.json();
      const comparisonJson = await comparisonRes.json();
      const trendJson = await trendRes.json();

      setTotalData(totalJson);
      setApprovalData(approvalJson);
      setActivities(activitiesJson.items ?? []);
      setRawList(rawJson.items ?? []);
      setComparison(comparisonJson.departments ?? []);
      setTrend(trendJson.items ?? []);
    }

    fetchDashboard();
  }, [range]);
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
                <TotalRopaCard
                  total={totalData.total}
                  newCount={totalData.newCount}
                />
                <ApprovalCard
                  total={approvalData.total}
                  growth={approvalData.growth}
                />
              </div>

              <div className="w-[292px]">
                <ActivityCard activities={activities} />
              </div>

              <div className="w-[509px]">
                <OverallDonutCard
                  dataSource={rawList}
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

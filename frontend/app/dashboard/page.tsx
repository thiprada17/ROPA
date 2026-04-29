"use client";

import TotalRopaCard from "./components/TotalRopaCard";
import ApprovalCard from "./components/ApprovalCard";
import ActivityCard from "./components/ActivityCard";
import OverallDonutCard from "./components/OverallDonutCard";
import ComparisonBarChart from "./components/ComparisonBarChart";
import TrendLineChart from "./components/TrendLineChart";
import Sidebar from "../components/Sidebar";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import DeptMultiSelect from "./components/DeptMultiSelect";

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
  const [deptOptions, setDeptOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // ================= FILTER STATE =================
  // เลือกช่วงเวลา
  const [range, setRange] = useState("1W");

  // เก็บ department ที่เลือก (multi-select)
  const [selectedDept, setSelectedDept] = useState<string[]>([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
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

        const [
          totalJson,
          approvalJson,
          activitiesJson,
          rawJson,
          comparisonJson,
          trendJson,
        ] = await Promise.all([
          totalRes.json(),
          approvalRes.json(),
          activitiesRes.json(),
          rawRes.json(),
          comparisonRes.json(),
          trendRes.json(),
        ]);

        setTotalData(totalJson);
        setApprovalData(approvalJson);
        setActivities(activitiesJson.items ?? []);
        setRawList(rawJson.items ?? []);
        setComparison(comparisonJson.departments ?? []);
        setTrend(trendJson.items ?? []);
        setRawList(rawJson.items ?? []);
        setDeptOptions(rawJson.departments ?? []);
      } catch (err) {
        console.error("fetchDashboard error:", err);
      }
    }

    fetchDashboard();
  }, [range]);

  // ================= FILTERED DATA =================
  // ใช้ rawList เป็น source หลัก เพื่อให้ทุก card/chart กรองตาม department เดียวกัน
  const filteredRawList = useMemo(() => {
    if (selectedDept.length === 0) return rawList;

    return rawList.filter((item) =>
      selectedDept.includes(item.ownerDepartment),
    );
  }, [rawList, selectedDept]);

  const filteredTotalData = useMemo(() => {
    return {
      total: filteredRawList.length,
      newCount: filteredRawList.length,
    };
  }, [filteredRawList]);

  const filteredApprovalData = useMemo(() => {
    const approved = filteredRawList.filter(
      (item) => item.status === "Complete",
    ).length;

    return {
      total: approved,
      growth:
        filteredRawList.length > 0
          ? Number(((approved / filteredRawList.length) * 100).toFixed(1))
          : 0,
    };
  }, [filteredRawList]);

  const filteredActivities = useMemo(() => {
    return filteredRawList.map((item) => ({
      id: item.id,
      activity: item.activity,
      parties: item.parties ?? [],
      risk: item.risk,
      date: item.submittedAt ?? "",
    }));
  }, [filteredRawList]);

  const filteredComparison = useMemo(() => {
    const map: Record<string, Dept> = {};

    filteredRawList.forEach((item) => {
      const dept = item.ownerDepartment || "Unknown";

      if (!map[dept]) {
        map[dept] = {
          name: dept,
          critical: 0,
          atRisk: 0,
          stable: 0,
          safe: 0,
        };
      }

      if (item.risk === "Critical") map[dept].critical += 1;
      else if (item.risk === "At Risk") map[dept].atRisk += 1;
      else if (item.risk === "Safe") map[dept].safe += 1;
      else map[dept].stable += 1;
    });

    return Object.values(map);
  }, [filteredRawList]);

  const filteredTrend = useMemo(() => {
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const map: Record<string, number> = {};

    filteredRawList.forEach((item) => {
      const raw = item.submittedAt;
      if (!raw) return;

      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return;

      const key = labels[date.getDay()];
      map[key] = (map[key] || 0) + 1;
    });

    return labels.map((day) => ({
      day,
      value: map[day] || 0,
    }));
  }, [filteredRawList]);

  // ================= UI =================
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 bg-[#F7F8FA] h-screen overflow-y-auto font-gabarito">
        <div className="px-10 py-6 max-w-7xl ml-[180px] mr-[120px]">
          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-[24px] font-semibold">Dashboard</h1>

            <div className="flex gap-3 item-center">
              {/* ================= RANGE SELECT ================= */}
              <div className="relative flex-shrink-0">
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
              {/* <div className="min-w-[180px] max-w-[600px] flex-shrink-0"> */}
              <div className="min-w-[180px] max-w-[800px]">
                <DeptMultiSelect
                  options={deptOptions}
                  selected={selectedDept}
                  onChange={(val) =>
                    setSelectedDept(
                      val.length === deptOptions.length ? [] : val,
                    )
                  }
                  placeholder="All Departments"
                  maxVisible={3}
                />
              </div>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="flex flex-col gap-6">
            {/* TOP CARDS */}
            {/* <div className="flex justify-between"> */}
            <div className="flex justify-between items-stretch h-[307px]">
              <div className="w-[240px] flex flex-col gap-[28px] flex-shrink-0">
                <TotalRopaCard
                  total={filteredTotalData.total}
                  newCount={filteredTotalData.newCount}
                />
                <ApprovalCard
                  total={filteredApprovalData.total}
                  growth={filteredApprovalData.growth}
                />
              </div>

              <div className="w-[292px] flex-shrink-0">
                <ActivityCard activities={filteredActivities} />
              </div>

              <div className="w-[509px] flex-shrink-0">
                <OverallDonutCard
                  dataSource={filteredRawList}
                  selectedDept={[]}
                />
              </div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8">
                <ComparisonBarChart data={filteredComparison} />
              </div>

              <div className="col-span-4">
                <TrendLineChart
                  data={filteredTrend}
                  selectedDept={selectedDept}
                  deptOptions={deptOptions}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: any[];
};

export default function ComparisonBarChart({ data }: Props) {

  // =========================
  // COLOR CONFIG
  // - สีของแต่ละ risk category
  // - ใช้ให้ตรงกับ donut chart เพื่อให้ UX consistent
  // =========================
  const COLORS = {
    atRisk: "#F3E3AE",
    critical: "#F0AFBE",
    safe: "#B5DDD8",
    stable: "#D1E7F0",
  };

  // =========================
  // CUSTOM TOOLTIP
  // - แสดง label (department)
  // - และ value ของแต่ละ bar
  // =========================
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white shadow-md border rounded-lg px-3 py-2 text-sm">

        {/* X-axis label (เช่น HR / IT / Finance) */}
        <p className="font-semibold text-gray-800 mb-1">
          {label}
        </p>

        {/* values ของแต่ละ risk type */}
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-gray-600">

            {/* colored dot */}
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: p.color }}
            />

            {/* series name + value */}
            {p.name}:{" "}
            <span className="font-semibold text-black">
              {p.value}
            </span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm h-[366px]">

      {/* =========================
          HEADER SECTION
          - title + legend (manual)
      ========================= */}
      <div className="flex justify-between items-center mb-6 mr-4">

        <p className="text-sm font-medium text-gray-500 ml-6">
          Overall Comparison
        </p>

        {/* STATIC LEGEND (match dashboard UI) */}
        <div className="flex gap-6 text-sm text-gray-600">

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F3E3AE]" />
            At Risk
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F0AFBE]" />
            Critical
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#B5DDD8]" />
            Safe
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#D1E7F0]" />
            Stable
          </div>

        </div>
      </div>

      {/* =========================
          CHART WRAPPER
          - fixed margin alignment
      ========================= */}
      <div className="mr-6 mt-6">

        <ResponsiveContainer width="100%" height={260}>

          {/* =========================
              BAR CHART CORE
              - data = pre-aggregated dataset (IMPORTANT)
              - 1 row = 1 department
          ========================= */}
          <BarChart data={data} barGap={6} barCategoryGap={30}>

            {/* background grid (horizontal only) */}
            <CartesianGrid stroke="#E5E7EB" vertical={false} />

            {/* X AXIS = department name */}
            <XAxis
              dataKey="name"
              tick={{ fill: "#6B7280", fontSize: 13 }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y AXIS = count */}
            <YAxis
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* hover tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* =========================
                GROUPED BARS (RISK BREAKDOWN)
                IMPORTANT:
                data MUST contain:
                atRisk / critical / safe / stable
            ========================= */}

            <Bar
              dataKey="atRisk"
              fill={COLORS.atRisk}
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

            <Bar
              dataKey="critical"
              fill={COLORS.critical}
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

            <Bar
              dataKey="safe"
              fill={COLORS.safe}
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

            <Bar
              dataKey="stable"
              fill={COLORS.stable}
              radius={[6, 6, 0, 0]}
              barSize={10}
            />

          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}
"use client";

import { Info } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Props = {
  data: { day: string; value: number }[];
  selectedDept: string[];
  deptOptions: { label: string; value: string }[];
};

export default function TrendLineChart({
  data,
  selectedDept,
  deptOptions,
}: Props) {
  const safeData =
    Array.isArray(data) && data.length > 0
      ? data
      : [
          { day: "Sun", value: 20 },
          { day: "Mon", value: 100 },
          { day: "Tue", value: 70 },
          { day: "Wed", value: 100 },
          { day: "Thu", value: 120 },
          { day: "Fri", value: 160 },
          { day: "Sat", value: 10 },
        ];

  const BASE_PALETTE = [
    "#F0AFBE",
    "#F3E3AE",
    "#B5DDD8",
    "#D1E7F0",
    "#E5D4F3",
    "#F7C8A0",
    "#CDE7C9",
    "#D6D6F5",
  ];

  const isAllSelected =
    selectedDept.length === 0 || selectedDept.length === deptOptions.length;

  const combinedData = safeData.map((d) => {
    const newItem: any = { day: d.day };

    if (isAllSelected) {
      newItem.value = d.value;
    } else {
      selectedDept.forEach((dept, index) => {
        newItem[dept] = d.value;
      });
    }

    return newItem;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white shadow-md border rounded-lg px-3 py-2 text-sm">
        {/* day */}
        <p className="font-semibold text-gray-800 mb-1">{label}</p>

        {payload.map((p: any, i: number) => (
          <p key={i} className="text-black">
            <span
              className="inline-block w-2 h-2 rounded-full mr-2"
              style={{ backgroundColor: p.color }}
            />
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm h-[366px] w-full">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2 relative group">
          <p className="text-sm text-gray-500 font-medium">ROPA Trend</p>
          {/* INFO ICON */}
          <Info size={14} className="text-gray-400 cursor-pointer" />

          {/* TOOLTIP */}
          <div className="font-prompt absolute left-0 top-6 w-[220px] text-xs border border-gray-300 bg-gray-100 text-black px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            แผนภูมิเส้นแสดงแนวโน้มจำนวนรายการ ROPA ที่เพิ่มเข้าสู่ระบบ
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={combinedData}
            margin={{ top: 5, right: 10, left: -35, bottom: 0 }}
          >
            {/* GRID (soft + modern) */}
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="#EEF2F7"
              vertical={false}
            />

            {/* AXIS */}
            <XAxis
              dataKey="day"
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 0, right: 2 }}
            />

            <YAxis
              allowDecimals={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            {/* TOOLTIP (clean card style) */}
            <Tooltip
              cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
              content={<CustomTooltip />}
            />

            {/* LINE (main visual) */}
            {isAllSelected ? (
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3B82F6" }}
                activeDot={{ r: 6 }}
                animationDuration={900}
              />
            ) : (
              selectedDept.map((dept, index) => (
                <Line
                  key={dept}
                  type="monotone"
                  dataKey={dept}
                  stroke={BASE_PALETTE[index % BASE_PALETTE.length]}
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: BASE_PALETTE[index % BASE_PALETTE.length],
                  }}
                  activeDot={{ r: 6 }}
                  animationDuration={900}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

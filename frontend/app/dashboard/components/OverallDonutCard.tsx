"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChevronDown, Info } from "lucide-react";

type RawItem = {
  risk: string;
  parties?: string[];
  legal?: {
    basis?: string[];
  };
};

type Props = {
  dataSource: RawItem[];
  selectedDept: string[];
};

type FilterType = "risk" | "department" | "legal";

export default function OverallDonutCard({ dataSource, selectedDept }: Props) {
  // =========================
  // STATE: เลือกประเภทข้อมูลที่จะแสดงใน donut
  // risk | department | legal
  // =========================
  const [filter, setFilter] = useState<FilterType>("risk");

  // =========================
  // DATA TRANSFORMATION (CORE LOGIC)
  // - แปลง raw data → summary format สำหรับ pie chart
  // - เปลี่ยนตาม filter ที่เลือก
  // =========================
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};

    // ===== RISK MODE =====
    if (filter === "risk") {
      dataSource.forEach((item) => {
        map[item.risk] = (map[item.risk] || 0) + 1;
      });
    }

    // ===== DEPARTMENT MODE =====
    if (filter === "department") {
      const map: Record<string, number> = {};

      dataSource.forEach((item) => {
        item.parties?.forEach((p: string) => {
          // ✅ กรองเฉพาะที่ user เลือก
          if (selectedDept.length === 0 || selectedDept.includes(p)) {
            map[p] = (map[p] || 0) + 1;
          }
        });
      });

      const entries = Object.entries(map);

      // ✅ ถ้าเลือกแค่ 1 department → 100%
      if (selectedDept.length === 1) {
        return [
          {
            name: selectedDept[0],
            value: entries.reduce((sum, [, v]) => sum + v, 0),
          },
        ];
      }

      // ✅ หลายอัน → แยก slice
      return entries
        .map(([key, val]) => ({
          name: key,
          value: val,
        }))
        .sort((a, b) => b.value - a.value);
    }

    // ===== LEGAL BASIS MODE =====
    if (filter === "legal") {
      dataSource.forEach((item) => {
        item.legal?.basis?.forEach((l: string) => {
          map[l] = (map[l] || 0) + 1;
        });
      });
    }

    // ===== CONVERT MAP → ARRAY (Recharts format) =====
    return (
      Object.entries(map)
        .map(([key, val]) => ({
          name: key,
          value: val,
        }))
        // sort จากมาก → น้อย เพื่อให้ legend อ่านง่าย
        .sort((a, b) => b.value - a.value)
    );
  }, [filter, dataSource, selectedDept]);

  // =========================
  // TOTAL VALUE (ใช้คำนวณ percentage ใน legend)
  // =========================
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // =========================
  // COLOR MAP สำหรับ RISK MODE (fix สีให้ semantic)
  // =========================
  const riskColorMap: Record<string, string> = {
    critical: "#F0AFBE",
    "at risk": "#F3E3AE",
    safe: "#B5DDD8",
    stable: "#D1E7F0",
  };

  // =========================
  // FALLBACK COLOR PALETTE
  // ใช้เมื่อไม่ใช่ risk mode (department / legal)
  // =========================
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

  // =========================
  // ASSIGN COLOR ให้แต่ละ slice (stable mapping)
  // =========================
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};

    chartData.forEach((d, i) => {
      // ===== RISK MODE → ใช้ semantic color =====
      if (filter === "risk") {
        map[d.name] = riskColorMap[d.name.toLowerCase()] || "#ddd";
      }

      // ===== OTHER MODES → ใช้ palette =====
      else {
        map[d.name] = BASE_PALETTE[i % BASE_PALETTE.length];
      }
    });

    return map;
  }, [chartData, filter]);

  // =========================
  // CUSTOM TOOLTIP (on hover pie)
  // =========================
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0];

    return (
      <div className="bg-white shadow-md rounded-lg px-3 py-2 border text-sm">
        {/* LABEL */}
        <p className="font-semibold text-gray-800">{data.name}</p>

        {/* VALUE */}
        <p className="text-gray-600">
          Value: <span className="font-semibold text-black">{data.value}</span>
        </p>
      </div>
    );
  };

  // แสดงสูงสุด 5 รายการใน leg เพื่อไม่ให้ล้น card
  const visibleData = chartData.slice(0, 5);
  const hiddenCount = chartData.length - visibleData.length;

  return (
    // <div className="bg-white rounded-2xl p-5 shadow-sm h-[307px] flex flex-col">
    <div className="bg-white rounded-2xl p-5 shadow-sm h-[307px] flex flex-col overflow-hidden">
      {/* =========================
          HEADER SECTION
          - title + dropdown filter
      ========================= */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-2 relative group">
          <p className="text-sm text-gray-500 ml-6">Overall</p>
          {/* INFO ICON */}
          <Info size={14} className="text-gray-400 cursor-pointer" />

          {/* TOOLTIP */}
          <div className="font-prompt absolute left-0 top-6 w-[220px] text-xs border border-gray-300 bg-gray-100 text-black px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            แผนภาพวงกลมแสดงจำนวนรายการ ROPA ทั้งหมด(%) ตามหัวข้อเป้าหมาย
          </div>
        </div>

        {/* FILTER DROPDOWN */}
        <div className="relative flex-shrink-0">
          <select
            className="appearance-none border border-[#616872] rounded-[6px] px-3 py-1 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#616872]"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
          >
            <option value="risk">Risk</option>
            <option value="department">Department</option>
            <option value="legal">Legal</option>
          </select>

          {/* dropdown icon */}
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* =========================
          BODY SECTION
          - donut chart + legend
      ========================= */}
      <div className="flex items-center gap-[22px] flex-1 min-h-0 overflow-hidden">
        {/* =========================
            DONUT CHART WRAPPER
        ========================= */}
        <div className="w-[200px] h-[200px] flex-shrink-0 flex items-center justify-center">
          <PieChart width={240} height={240}>
            {/* PIE CHART */}
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {/* EACH SLICE COLOR */}
              {chartData.map((d) => (
                <Cell key={d.name} fill={colorMap[d.name]} />
              ))}
            </Pie>

            {/* TOOLTIP */}
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </div>

        {/* =========================
            LEGEND SECTION
            - label + percent
        ========================= */}
        {/* <div className="space-y-3 w-full pl-2 flex flex-col justify-center">
          {chartData.map((d) => {
            // percent per category
            const percent = total ? ((d.value / total) * 100).toFixed(1) : "0";

            return (
              <div key={d.name} className="flex items-center justify-between"> */}
        {/* LEFT: color + label */}
        {/* <div className="flex items-center gap-2 ml-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: colorMap[d.name],
                    }}
                  />
                  <span className="text-[#616872] text-[12px] font-medium">
                    {d.name}
                  </span>
                </div> */}

        {/* RIGHT: percentage */}
        {/* <span className="flex items-center gap-[2px] shrink-0 mr-8">
                  <span className="text-black text-[16px] font-semibold">
                    {percent}
                  </span>
                  <span className="text-black text-sm font-semibold">%</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} */}

        <div className="flex flex-col justify-center gap-y-2.5 flex-1 min-w-0 overflow-hidden pr-2">
          {visibleData.map((d) => {
            const percent = total ? ((d.value / total) * 100).toFixed(1) : "0";
            return (
              <div key={d.name} className="flex items-center justify-between gap-2 min-w-0">
                {/* LEFT: dot + label (truncate ถ้ายาวเกิน) */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: colorMap[d.name] }}
                  />
                  <span
                    className="text-[#616872] text-[12px] font-medium truncate"
                    title={d.name}  // แสดง full text เมื่อ hover
                  >
                    {d.name}
                  </span>
                </div>

                {/* RIGHT: percentage — fixed width ไม่ขยับ */}
                <span className="flex items-center gap-[2px] flex-shrink-0 w-[52px] justify-end">
                  <span className="text-black text-[16px] font-semibold leading-none">
                    {percent}
                  </span>
                  <span className="text-black text-sm font-semibold">%</span>
                </span>
              </div>
            );
          })}

          {/* แสดงว่ายังมีรายการที่ซ่อนอยู่อีก */}
          {hiddenCount > 0 && (
            <p className="text-[11px] text-gray-400 ml-5">+{hiddenCount} more</p>
          )}
        </div>
      </div>
    </div>
  );
}

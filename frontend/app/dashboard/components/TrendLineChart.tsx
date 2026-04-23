"use client";

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
};

export default function TrendLineChart({ data }: Props) {
    const safeData =
        Array.isArray(data) && data.length > 0
            ? data
            : [
                { day: "Mon", value: 10 },
                { day: "Tue", value: 20 },
                { day: "Wed", value: 15 },
                { day: "Thu", value: 30 },
                { day: "Fri", value: 25 },
            ];

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm h-[366px] w-full">

            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <p className="text-sm text-gray-500 font-medium">
                    ROPA Trend
                </p>
            </div>

            {/* CHART */}
            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">

                    <LineChart data={safeData}>

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
                        />

                        <YAxis
                            tick={{ fill: "#9CA3AF", fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />

                        {/* TOOLTIP (clean card style) */}
                        <Tooltip
                            cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }}
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #E5E7EB",
                                borderRadius: "10px",
                                fontSize: "12px",
                                boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                            }}
                        />

                        {/* LINE (main visual) */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#3B82F6" }}
                            activeDot={{ r: 6 }}
                            animationDuration={900}
                        />

                    </LineChart>

                </ResponsiveContainer>
            </div>

        </div>
    );
}
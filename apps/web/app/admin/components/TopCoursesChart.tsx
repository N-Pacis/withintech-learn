"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { TopCourse } from "@/hooks/queries/analytics";
import {
  chartLegendFormatter,
  chartLegendStyle,
  chartTickStyle,
  chartTokens,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "./chartTheme";

// Truncate label based on available characters — caller passes the limit.
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Custom YAxis tick that renders at the measured width.
function YTick({
  x,
  y,
  payload,
  maxChars,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  maxChars: number;
}) {
  if (!payload) return null;
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill={chartTokens.tick}
      fontSize={11}
      fontFamily="var(--font-body)"
    >
      {truncate(payload.value, maxChars)}
    </text>
  );
}

export function TopCoursesChart({ data }: { data: TopCourse[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div style={{ height: 260 }} />;

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTokens.grid}
            strokeOpacity={0.8}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={chartTickStyle}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="title"
            width={120}
            axisLine={false}
            tickLine={false}
            tick={<YTick maxChars={17} />}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            cursor={{ fill: chartTokens.grid, fillOpacity: 0.08 }}
            formatter={(v, name) => [
              v,
              name === "enrolled" ? "Enrolled" : "Completed",
            ]}
          />
          <Legend
            wrapperStyle={chartLegendStyle}
            formatter={chartLegendFormatter}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="enrolled"
            name="enrolled"
            fill={chartTokens.primary}
            radius={[0, 4, 4, 0]}
          >
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={chartTokens.primary}
                fillOpacity={1 - i * 0.1}
              />
            ))}
          </Bar>
          <Bar
            dataKey="completed"
            name="completed"
            fill={chartTokens.success}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

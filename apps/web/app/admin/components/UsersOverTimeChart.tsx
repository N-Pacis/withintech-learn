"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { UsersOverTimePoint } from "@/hooks/queries/analytics";
import {
  chartActiveDot,
  chartTickStyle,
  chartTokens,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "./chartTheme";

function formatDate(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function UsersOverTimeChart({ data }: { data: UsersOverTimePoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div style={{ height: 260 }} />;

  const formatted = data.map((d) => ({ ...d, date: formatDate(d.date) }));

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart
          data={formatted}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradUOT" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartTokens.success}
                stopOpacity={0.22}
              />
              <stop
                offset="95%"
                stopColor={chartTokens.success}
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTokens.grid}
            strokeOpacity={0.8}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={chartTickStyle}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            tick={chartTickStyle}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            cursor={{ stroke: chartTokens.gridSoft, strokeDasharray: "3 3" }}
            formatter={(v) => [v, "New users"]}
          />
          <Area
            type="monotone"
            dataKey="users"
            name="New users"
            stroke={chartTokens.success}
            strokeWidth={2}
            fill="url(#gradUOT)"
            dot={false}
            activeDot={chartActiveDot(chartTokens.success)}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

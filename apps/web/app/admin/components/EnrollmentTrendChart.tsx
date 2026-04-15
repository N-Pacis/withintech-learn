"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/hooks/queries/analytics";
import {
  chartActiveDot,
  chartLegendFormatter,
  chartLegendStyle,
  chartTickStyle,
  chartTokens,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "./chartTheme";

function formatMonth(ym: string) {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function EnrollmentTrendChart({ data }: { data: TrendPoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div style={{ height: 260 }} />;

  const formatted = data.map((d) => ({ ...d, month: formatMonth(d.month) }));

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart
          data={formatted}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradEnrolled" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={chartTokens.primary}
                stopOpacity={0.22}
              />
              <stop
                offset="95%"
                stopColor={chartTokens.primary}
                stopOpacity={0}
              />
            </linearGradient>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
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
            dataKey="month"
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
            width={32}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            cursor={{ stroke: chartTokens.gridSoft, strokeDasharray: "3 3" }}
          />
          <Legend
            wrapperStyle={chartLegendStyle}
            formatter={chartLegendFormatter}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="enrolled"
            name="Enrolled"
            stroke={chartTokens.primary}
            strokeWidth={2}
            fill="url(#gradEnrolled)"
            dot={false}
            activeDot={chartActiveDot(chartTokens.primary)}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke={chartTokens.success}
            strokeWidth={2}
            fill="url(#gradCompleted)"
            dot={false}
            activeDot={chartActiveDot(chartTokens.success)}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

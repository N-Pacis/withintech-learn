"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { ChallengeAnalytics } from "@/hooks/queries/analytics";
import {
  chartTickStyle,
  chartTokens,
  chartTooltipItemStyle,
  chartTooltipLabelStyle,
  chartTooltipStyle,
} from "./chartTheme";

const DIFF_COLORS: Record<string, string> = {
  easy: chartTokens.success,
  medium: chartTokens.warning,
  hard: chartTokens.danger,
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

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

export function TopChallengesChart({
  data,
}: {
  data: ChallengeAnalytics["topChallenges"];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div style={{ height: 220 }} />;

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 48, left: 0, bottom: 0 }}
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
            width={110}
            axisLine={false}
            tickLine={false}
            tick={<YTick maxChars={15} />}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            cursor={{ fill: chartTokens.grid, fillOpacity: 0.08 }}
            formatter={(v, name) => [
              v,
              name === "submissions" ? "Submissions" : name,
            ]}
          />
          <Bar dataKey="submissions" name="submissions" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={DIFF_COLORS[d.difficulty] ?? chartTokens.primary}
                fillOpacity={1 - i * 0.12}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HardestChallengesChart({
  data,
}: {
  data: ChallengeAnalytics["hardestChallenges"];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return <div style={{ height: 220 }} />;

  const chartData = data.map((d) => ({ ...d, failRate: 100 - d.passRate }));

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 48, left: 0, bottom: 0 }}
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
            domain={[0, 100]}
            tick={chartTickStyle}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <YAxis
            type="category"
            dataKey="title"
            width={110}
            axisLine={false}
            tickLine={false}
            tick={<YTick maxChars={15} />}
          />
          <Tooltip
            contentStyle={chartTooltipStyle}
            labelStyle={chartTooltipLabelStyle}
            itemStyle={chartTooltipItemStyle}
            cursor={{ fill: chartTokens.grid, fillOpacity: 0.08 }}
            formatter={(v, name) => [
              `${v}%`,
              name === "passRate" ? "Pass Rate" : "Fail Rate",
            ]}
          />
          <Bar
            dataKey="passRate"
            name="passRate"
            stackId="a"
            fill={chartTokens.success}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="failRate"
            name="failRate"
            stackId="a"
            fill={chartTokens.dangerSoft}
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { CourseCompletionDuration } from '@/hooks/queries/analytics';

const tooltipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function YTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  if (!payload) return null;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#9CA3AF" fontSize={11} fontFamily="var(--font-body)">
      {truncate(payload.value, 17)}
    </text>
  );
}

export function CourseCompletionChart({ data }: { data: CourseCompletionDuration[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: Math.max(180, data.length * 52) }} />;

  const height = Math.max(180, data.length * 52);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 56, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tickFormatter={(v) => `${v}d`}
          />
          <YAxis
            type="category"
            dataKey="title"
            width={120}
            axisLine={false}
            tickLine={false}
            tick={<YTick />}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`${v} days`, 'Avg completion']}
          />
          <Bar dataKey="avgDays" name="avgDays" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#3D006B" fillOpacity={1 - i * 0.08} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

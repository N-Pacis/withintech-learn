'use client';

import { useState, useEffect } from 'react';
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
} from 'recharts';
import type { TopCourse } from '@/hooks/queries/analytics';

const tooltipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
};

// Truncate label based on available characters — caller passes the limit.
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// Custom YAxis tick that renders at the measured width.
function YTick({ x, y, payload, maxChars }: {
  x?: number; y?: number; payload?: { value: string }; maxChars: number;
}) {
  if (!payload) return null;
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fill="#9CA3AF"
      fontSize={11}
      fontFamily="var(--font-body)"
    >
      {truncate(payload.value, maxChars)}
    </text>
  );
}

export function TopCoursesChart({ data }: { data: TopCourse[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: '#9CA3AF' }}
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
            contentStyle={tooltipStyle}
            formatter={(v, name) => [v, name === 'enrolled' ? 'Enrolled' : 'Completed']}
          />
          <Legend
            wrapperStyle={{ fontFamily: 'var(--font-body)', fontSize: 12, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="enrolled" name="enrolled" fill="#3D006B" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#3D006B" fillOpacity={1 - i * 0.1} />
            ))}
          </Bar>
          <Bar dataKey="completed" name="completed" fill="#10B981" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

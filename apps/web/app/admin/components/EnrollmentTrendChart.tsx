'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TrendPoint } from '@/hooks/queries/analytics';

function formatMonth(ym: string) {
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

const tickStyle = { fontSize: 11, fontFamily: 'var(--font-body)', fill: '#9CA3AF' };
const tooltipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
};

export function EnrollmentTrendChart({ data }: { data: TrendPoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: 260 }} />;

  const formatted = data.map((d) => ({ ...d, month: formatMonth(d.month) }));

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEnrolled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3D006B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3D006B" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey="month"
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            minTickGap={48}
          />
          <YAxis
            tick={tickStyle}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend
            wrapperStyle={{ fontFamily: 'var(--font-body)', fontSize: 12, paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="enrolled"
            name="Enrolled"
            stroke="#3D006B"
            strokeWidth={2}
            fill="url(#gradEnrolled)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completed"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#gradCompleted)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { UsersOverTimePoint } from '@/hooks/queries/analytics';

function formatDate(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const tickStyle = { fontSize: 11, fontFamily: 'var(--font-body)', fill: '#9CA3AF' };
const tooltipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
};

export function UsersOverTimeChart({ data }: { data: UsersOverTimePoint[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: 260 }} />;

  const formatted = data.map((d) => ({ ...d, date: formatDate(d.date) }));

  return (
    <div className="w-full" style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <AreaChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradUOT" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} minTickGap={48} />
          <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, 'New users']} />
          <Area
            type="monotone"
            dataKey="users"
            name="New users"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#gradUOT)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

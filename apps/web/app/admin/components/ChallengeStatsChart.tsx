'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { ChallengeAnalytics } from '@/hooks/queries/analytics';

const tooltipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
};

const DIFF_COLORS: Record<string, string> = {
  easy:   '#10B981',
  medium: '#F59E0B',
  hard:   '#EF4444',
};

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function YTick({ x, y, payload, maxChars }: { x?: number; y?: number; payload?: { value: string }; maxChars: number }) {
  if (!payload) return null;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#9CA3AF" fontSize={11} fontFamily="var(--font-body)">
      {truncate(payload.value, maxChars)}
    </text>
  );
}

export function TopChallengesChart({ data }: { data: ChallengeAnalytics['topChallenges'] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: 220 }} />;

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <YAxis type="category" dataKey="title" width={110} axisLine={false} tickLine={false} tick={<YTick maxChars={15} />} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => [v, name === 'submissions' ? 'Submissions' : name]}
          />
          <Bar dataKey="submissions" name="submissions" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={DIFF_COLORS[d.difficulty] ?? '#3D006B'} fillOpacity={1 - i * 0.12} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HardestChallengesChart({ data }: { data: ChallengeAnalytics['hardestChallenges'] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <div style={{ height: 220 }} />;

  const chartData = data.map(d => ({ ...d, failRate: 100 - d.passRate }));

  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%" debounce={50}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 48, left: 0, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fontFamily: 'var(--font-body)', fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
          <YAxis type="category" dataKey="title" width={110} axisLine={false} tickLine={false} tick={<YTick maxChars={15} />} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v, name) => [`${v}%`, name === 'passRate' ? 'Pass Rate' : 'Fail Rate']}
          />
          <Bar dataKey="passRate" name="passRate" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="failRate" name="failRate" stackId="a" fill="#FEE2E2" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

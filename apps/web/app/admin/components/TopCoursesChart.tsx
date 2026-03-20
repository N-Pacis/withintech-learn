'use client';

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

const tickStyle = { fontSize: 11, fontFamily: 'var(--font-body)', fill: '#6B7280' };
const tooltipStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 13,
  borderRadius: 8,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
};

function truncate(s: string, n = 22) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export function TopCoursesChart({ data }: { data: TopCourse[] }) {
  const formatted = data.map((c) => ({ ...c, title: truncate(c.title) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={formatted}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis
          type="number"
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="title"
          width={130}
          tick={tickStyle}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, name) => [v, name === 'enrolled' ? 'Enrolled' : 'Completed']}
        />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--font-body)', fontSize: 13, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="enrolled" name="enrolled" fill="#3D006B" radius={[0, 4, 4, 0]}>
          {formatted.map((_, i) => (
            <Cell key={i} fill="#3D006B" fillOpacity={1 - i * 0.1} />
          ))}
        </Bar>
        <Bar dataKey="completed" name="completed" fill="#10B981" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

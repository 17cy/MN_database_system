'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  title: string;
  data: { label: string; count: number }[];
  colors: string[];
}

export default function DonutChartWithLegend({ title, data, colors }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">{title}</h3>
      <div className="flex items-center gap-4">
        <div className="h-56 w-1/2 min-w-0 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-2 text-sm">
          {data.map((d, i) => {
            const pct = total ? ((d.count / total) * 100).toFixed(1) : '0.0';
            return (
              <li key={d.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                  <span className="truncate text-slate-700">{d.label}</span>
                </span>
                <span className="shrink-0 font-medium text-slate-900">{pct}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
  );
}

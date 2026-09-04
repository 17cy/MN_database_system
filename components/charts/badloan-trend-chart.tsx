'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatMYR } from '@/lib/utils';

interface Props {
  data: { month: string; totalBadloan: number }[];
}

export default function BadloanTrendChart({ data }: Props) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Total Badloan Balance by Month</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 16, left: 10, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              width={90}
              tickFormatter={(v: number) => formatMYR(v)}
              label={{
                value: 'Total Badloan',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, textAnchor: 'middle' },
              }}
            />
            <Tooltip formatter={(value: number) => formatMYR(value)} />
            <Line type="monotone" dataKey="totalBadloan" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

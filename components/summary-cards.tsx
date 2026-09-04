import { Card } from '@/components/ui/card';
import { formatMYR } from '@/lib/utils';

interface SummaryCardsProps {
  totalDisbursed: number;
  totalBorrowers: number;
  averageSalary: number;
}

export default function SummaryCards({ totalDisbursed, totalBorrowers, averageSalary }: SummaryCardsProps) {
  const items = [
    { label: 'Total Disbursed', value: formatMYR(totalDisbursed) },
    { label: 'Total Borrowers', value: String(totalBorrowers) },
    { label: 'Average Salary', value: formatMYR(averageSalary) },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}

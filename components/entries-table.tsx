'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatMYR } from '@/lib/utils';

export interface Entry {
  id: number;
  transactionDate: string;
  customerName: string;
  age: number;
  gender: string;
  race: string;
  monthlySalary: number;
  loanAmount: number;
  employerCategory: string;
  skim: string;
  badloanBalance: number;
}

interface EntriesTableProps {
  entries: Entry[];
  loading: boolean;
  onEdit: (entry: Entry) => void;
  onDeleted: () => void;
}

export default function EntriesTable({ entries, loading, onEdit, onDeleted }: EntriesTableProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      onDeleted();
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  if (entries.length === 0) {
    return <p className="text-sm text-slate-500">No entries found for this date.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Date</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Customer</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Age</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Gender</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Race</th>
            <th className="px-3 py-2 text-right font-medium text-slate-600">Salary</th>
            <th className="px-3 py-2 text-right font-medium text-slate-600">Loan Amount</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Employer</th>
            <th className="px-3 py-2 text-left font-medium text-slate-600">Skim</th>
            <th className="px-3 py-2 text-right font-medium text-slate-600">Badloan Balance</th>
            <th className="px-3 py-2 text-right font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-3 py-2 whitespace-nowrap">{entry.transactionDate}</td>
              <td className="px-3 py-2">{entry.customerName}</td>
              <td className="px-3 py-2">{entry.age}</td>
              <td className="px-3 py-2">{entry.gender}</td>
              <td className="px-3 py-2">{entry.race}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap">{formatMYR(entry.monthlySalary)}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap">{formatMYR(entry.loanAmount)}</td>
              <td className="px-3 py-2">{entry.employerCategory}</td>
              <td className="px-3 py-2 whitespace-nowrap">{entry.skim}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap">{formatMYR(entry.badloanBalance)}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap space-x-2">
                <Button variant="outline" onClick={() => onEdit(entry)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  disabled={deletingId === entry.id}
                  onClick={() => handleDelete(entry.id)}
                >
                  {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

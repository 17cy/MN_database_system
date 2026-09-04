'use client';

import { useState, useCallback, useEffect } from 'react';
import EntryForm from '@/components/entry-form';
import EntriesTable, { Entry } from '@/components/entries-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { todayISO } from '@/lib/utils';

export default function EntryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewDate, setViewDate] = useState(todayISO());

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?date=${viewDate}`);
      const data = await res.json();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Data Entry</h1>
        <p className="text-sm text-slate-500">Add a new customer loan record. Fields marked with an asterisk are required.</p>
      </div>

      <EntryForm
        key={editing?.id ?? 'new'}
        initial={editing}
        onSaved={() => {
          setEditing(null);
          refresh();
        }}
        onCancelEdit={() => setEditing(null)}
      />

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Entries</h2>
          <div className="flex items-end gap-2">
            <div>
              <Label htmlFor="viewDate">View entries for</Label>
              <Input
                id="viewDate"
                type="date"
                value={viewDate}
                onChange={(e) => setViewDate(e.target.value)}
              />
            </div>
            <Button type="button" variant="outline" onClick={() => setViewDate(todayISO())}>
              Today
            </Button>
          </div>
        </div>
        <EntriesTable entries={entries} loading={loading} onEdit={(e) => setEditing(e)} onDeleted={refresh} />
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { loanSchema, GENDERS, RACES, EMPLOYER_CATEGORIES, SKIM_OPTIONS } from '@/lib/validation';
import { todayISO } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import type { Entry } from '@/components/entries-table';

interface EntryFormProps {
  initial?: Entry | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
}

const emptyForm = {
  transactionDate: todayISO(),
  customerName: '',
  age: '',
  gender: '',
  race: '',
  monthlySalary: '',
  loanAmount: '',
  employerCategory: '',
  skim: '',
  badloanBalance: '0',
};

export default function EntryForm({ initial, onSaved, onCancelEdit }: EntryFormProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          transactionDate: initial.transactionDate,
          customerName: initial.customerName,
          age: String(initial.age),
          gender: initial.gender,
          race: initial.race,
          monthlySalary: String(initial.monthlySalary),
          loanAmount: String(initial.loanAmount),
          employerCategory: initial.employerCategory,
          skim: initial.skim,
          badloanBalance: String(initial.badloanBalance),
        }
      : emptyForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = loanSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const url = initial ? `/api/entries/${initial.id}` : '/api/entries';
      const method = initial ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ? JSON.stringify(data.error) : 'Failed to save entry.');
        return;
      }
      if (!initial) {
        setForm(emptyForm);
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="transactionDate">Transaction Date *</Label>
          <Input
            id="transactionDate"
            type="date"
            value={form.transactionDate}
            onChange={(e) => update('transactionDate', e.target.value)}
          />
          {errors.transactionDate && <p className="text-xs text-red-600 mt-1">{errors.transactionDate}</p>}
        </div>

        <div>
          <Label htmlFor="customerName">Customer Name *</Label>
          <Input
            id="customerName"
            type="text"
            placeholder="Full name"
            value={form.customerName}
            onChange={(e) => update('customerName', e.target.value)}
          />
          {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
        </div>

        <div>
          <Label htmlFor="age">Age *</Label>
          <Input
            id="age"
            type="number"
            min={18}
            max={100}
            value={form.age}
            onChange={(e) => update('age', e.target.value)}
          />
          {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
        </div>

        <div>
          <Label htmlFor="gender">Gender *</Label>
          <Select id="gender" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
            <option value="">Select...</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
          {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
        </div>

        <div>
          <Label htmlFor="race">Race *</Label>
          <Select id="race" value={form.race} onChange={(e) => update('race', e.target.value)}>
            <option value="">Select...</option>
            {RACES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          {errors.race && <p className="text-xs text-red-600 mt-1">{errors.race}</p>}
        </div>

        <div>
          <Label htmlFor="monthlySalary">Monthly Salary (RM) *</Label>
          <Input
            id="monthlySalary"
            type="number"
            min={0}
            step="0.01"
            value={form.monthlySalary}
            onChange={(e) => update('monthlySalary', e.target.value)}
          />
          {errors.monthlySalary && <p className="text-xs text-red-600 mt-1">{errors.monthlySalary}</p>}
        </div>

        <div>
          <Label htmlFor="loanAmount">Loan Amount (RM) *</Label>
          <Input
            id="loanAmount"
            type="number"
            min={0}
            step="0.01"
            value={form.loanAmount}
            onChange={(e) => update('loanAmount', e.target.value)}
          />
          {errors.loanAmount && <p className="text-xs text-red-600 mt-1">{errors.loanAmount}</p>}
        </div>

        <div>
          <Label htmlFor="employerCategory">Employer Category *</Label>
          <Select
            id="employerCategory"
            value={form.employerCategory}
            onChange={(e) => update('employerCategory', e.target.value)}
          >
            <option value="">Select...</option>
            {EMPLOYER_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          {errors.employerCategory && <p className="text-xs text-red-600 mt-1">{errors.employerCategory}</p>}
        </div>

        <div>
          <Label htmlFor="skim">Skim *</Label>
          <Select id="skim" value={form.skim} onChange={(e) => update('skim', e.target.value)}>
            <option value="">Select...</option>
            {SKIM_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          {errors.skim && <p className="text-xs text-red-600 mt-1">{errors.skim}</p>}
        </div>

        <div>
          <Label htmlFor="badloanBalance">Badloan Balance (RM) *</Label>
          <Input
            id="badloanBalance"
            type="number"
            min={0}
            step="0.01"
            value={form.badloanBalance}
            onChange={(e) => update('badloanBalance', e.target.value)}
          />
          {errors.badloanBalance && <p className="text-xs text-red-600 mt-1">{errors.badloanBalance}</p>}
        </div>

        <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : initial ? 'Update Entry' : 'Add Entry'}
          </Button>
          {initial && (
            <Button type="button" variant="outline" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </div>
      </form>
    </Card>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import SummaryCards from '@/components/summary-cards';
import SalaryDistributionChart from '@/components/charts/salary-distribution-chart';
import AgeDistributionChart from '@/components/charts/age-distribution-chart';
import DonutChartWithLegend from '@/components/charts/donut-with-legend';
import EmployerBarChart from '@/components/charts/employer-bar-chart';
import SkimBarChart from '@/components/charts/skim-bar-chart';
import MonthlyTrendChart from '@/components/charts/monthly-trend-chart';
import BadloanTrendChart from '@/components/charts/badloan-trend-chart';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

interface DashboardData {
  totalDisbursed: number;
  totalBorrowers: number;
  averageSalary: number;
  salaryDistribution: { label: string; count: number }[];
  ageDistribution: { label: string; count: number }[];
  raceDistribution: { label: string; count: number }[];
  genderDistribution: { label: string; count: number }[];
  employerDistribution: { label: string; count: number }[];
  skimDistribution: { label: string; count: number }[];
  salaryDistributionYear: { label: string; count: number }[];
  ageDistributionYear: { label: string; count: number }[];
  raceDistributionYear: { label: string; count: number }[];
  genderDistributionYear: { label: string; count: number }[];
  employerDistributionYear: { label: string; count: number }[];
  skimDistributionYear: { label: string; count: number }[];
  monthlyTrend: { month: string; totalDisbursed: number; totalBadloan: number }[];
}

const RACE_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];
const GENDER_COLORS = ['#0ea5e9', '#ec4899'];

export default function DashboardPage() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);

  const yearOptions = useMemo(() => {
    const y = now.getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - 4 + i);
  }, [now]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?month=${month}&year=${year}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleExport() {
    window.location.href = `/api/export?month=${month}&year=${year}`;
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
          <p className="text-sm text-slate-500">Overview of loan disbursement activity.</p>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {loading || !data ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <SummaryCards
            totalDisbursed={data.totalDisbursed}
            totalBorrowers={data.totalBorrowers}
            averageSalary={data.averageSalary}
          />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Monthly Overview ({MONTH_NAMES[month - 1]} {year})
            </h2>
            <p className="text-sm text-slate-500 mb-3">Totals for the selected month only.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalaryDistributionChart data={data.salaryDistribution} />
              <AgeDistributionChart data={data.ageDistribution} />
              <DonutChartWithLegend title="Gender Distribution" data={data.genderDistribution} colors={GENDER_COLORS} />
              <DonutChartWithLegend title="Race Distribution" data={data.raceDistribution} colors={RACE_COLORS} />
              <EmployerBarChart data={data.employerDistribution} />
              <SkimBarChart data={data.skimDistribution} />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">Year-to-Date Overview ({year})</h2>
            <p className="text-sm text-slate-500 mb-3">Totals across all of {year}, not just the selected month.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalaryDistributionChart data={data.salaryDistributionYear} />
              <AgeDistributionChart data={data.ageDistributionYear} />
              <DonutChartWithLegend
                title="Gender Distribution"
                data={data.genderDistributionYear}
                colors={GENDER_COLORS}
              />
              <DonutChartWithLegend title="Race Distribution" data={data.raceDistributionYear} colors={RACE_COLORS} />
              <EmployerBarChart data={data.employerDistributionYear} />
              <SkimBarChart data={data.skimDistributionYear} />
            </div>
          </div>

          <MonthlyTrendChart data={data.monthlyTrend} />
          <BadloanTrendChart data={data.monthlyTrend} />
        </>
      )}
    </div>
  );
}

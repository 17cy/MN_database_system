import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { GENDERS, RACES, EMPLOYER_CATEGORIES, SKIM_OPTIONS } from '@/lib/validation';
import { LoanRow } from '@/lib/serialize';

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const SALARY_BINS = [
  { label: '<RM1000', min: -Infinity, max: 999.99 },
  { label: 'RM1000-1499', min: 1000, max: 1499.99 },
  { label: 'RM1500-1999', min: 1500, max: 1999.99 },
  { label: 'RM2000-2499', min: 2000, max: 2499.99 },
  { label: 'RM2500-2999', min: 2500, max: 2999.99 },
  { label: 'RM3000-3499', min: 3000, max: 3499.99 },
  { label: 'RM3500-3999', min: 3500, max: 3999.99 },
  { label: 'RM4000+', min: 4000, max: Infinity },
];

const AGE_BINS = [
  { label: '18-22', min: 18, max: 22 },
  { label: '23-27', min: 23, max: 27 },
  { label: '28-32', min: 28, max: 32 },
  { label: '33-37', min: 33, max: 37 },
  { label: '38-42', min: 38, max: 42 },
  { label: '43-47', min: 43, max: 47 },
  { label: '48-52', min: 48, max: 52 },
  { label: '53-57', min: 53, max: 57 },
  { label: '58+', min: 58, max: Infinity },
];

function countByBins(rows: LoanRow[], bins: { label: string; min: number; max: number }[], field: 'monthly_salary' | 'age') {
  return bins.map((bin) => ({
    label: bin.label,
    count: rows.filter((r) => r[field] >= bin.min && r[field] <= bin.max).length,
  }));
}

function countByCategory(
  rows: LoanRow[],
  categories: readonly string[],
  field: 'gender' | 'race' | 'employer_category' | 'skim'
) {
  return categories.map((cat) => ({
    label: cat,
    count: rows.filter((r) => r[field] === cat).length,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  if (!month || !year) {
    return NextResponse.json({ error: 'month and year are required' }, { status: 400 });
  }

  const prefix = `${year}-${month.padStart(2, '0')}`;
  const rows = db
    .prepare('SELECT * FROM loans WHERE transaction_date LIKE ? ORDER BY transaction_date ASC')
    .all(`${prefix}%`) as LoanRow[];

  const yearRows = db
    .prepare('SELECT * FROM loans WHERE transaction_date LIKE ? ORDER BY transaction_date ASC')
    .all(`${year}-%`) as LoanRow[];

  const totalDisbursed = rows.reduce((s, r) => s + r.loan_amount, 0);
  const totalBorrowers = rows.length;
  const averageSalary = totalBorrowers
    ? rows.reduce((s, r) => s + r.monthly_salary, 0) / totalBorrowers
    : 0;

  const salaryDistribution = countByBins(rows, SALARY_BINS, 'monthly_salary');
  const ageDistribution = countByBins(rows, AGE_BINS, 'age');
  const raceDistribution = countByCategory(rows, RACES, 'race');
  const genderDistribution = countByCategory(rows, GENDERS, 'gender');
  const employerDistribution = countByCategory(rows, EMPLOYER_CATEGORIES, 'employer_category');
  const skimDistribution = countByCategory(rows, SKIM_OPTIONS, 'skim');

  const salaryDistributionYear = countByBins(yearRows, SALARY_BINS, 'monthly_salary');
  const ageDistributionYear = countByBins(yearRows, AGE_BINS, 'age');
  const raceDistributionYear = countByCategory(yearRows, RACES, 'race');
  const genderDistributionYear = countByCategory(yearRows, GENDERS, 'gender');
  const employerDistributionYear = countByCategory(yearRows, EMPLOYER_CATEGORIES, 'employer_category');
  const skimDistributionYear = countByCategory(yearRows, SKIM_OPTIONS, 'skim');

  const monthlyTrend = MONTH_SHORT.map((label, i) => {
    const monthPrefix = `${year}-${String(i + 1).padStart(2, '0')}`;
    const monthRows = db
      .prepare('SELECT loan_amount, bad_loan_balance FROM loans WHERE transaction_date LIKE ?')
      .all(`${monthPrefix}%`) as { loan_amount: number; bad_loan_balance: number }[];
    return {
      month: label,
      totalDisbursed: monthRows.reduce((s, r) => s + r.loan_amount, 0),
      totalBadloan: monthRows.reduce((s, r) => s + r.bad_loan_balance, 0),
    };
  });

  return NextResponse.json({
    totalDisbursed,
    totalBorrowers,
    averageSalary,
    salaryDistribution,
    ageDistribution,
    raceDistribution,
    genderDistribution,
    employerDistribution,
    skimDistribution,
    salaryDistributionYear,
    ageDistributionYear,
    raceDistributionYear,
    genderDistributionYear,
    employerDistributionYear,
    skimDistributionYear,
    monthlyTrend,
  });
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { LoanRow } from '@/lib/serialize';

function csvEscape(value: string | number) {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  if (!month || !year) {
    return NextResponse.json({ error: 'month and year are required' }, { status: 400 });
  }

  const paddedMonth = month.padStart(2, '0');
  const prefix = `${year}-${paddedMonth}`;
  const rows = db
    .prepare('SELECT * FROM loans WHERE transaction_date LIKE ? ORDER BY transaction_date ASC')
    .all(`${prefix}%`) as LoanRow[];

  const headers = [
    'Transaction Date',
    'Customer Name',
    'Age',
    'Gender',
    'Race',
    'Monthly Salary (RM)',
    'Loan Amount (RM)',
    'Employer Category',
    'Skim',
    'Badloan Balance (RM)',
  ];
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.transaction_date,
        r.customer_name,
        r.age,
        r.gender,
        r.race,
        r.monthly_salary,
        r.loan_amount,
        r.employer_category,
        r.skim,
        r.bad_loan_balance,
      ]
        .map(csvEscape)
        .join(',')
    );
  }
  // Prepend UTF-8 BOM so Excel opens the file with correct encoding.
  const csv = String.fromCharCode(0xfeff) + lines.join('\r\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="loans-${year}-${paddedMonth}.csv"`,
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { loanSchema } from '@/lib/validation';
import { rowToEntry, LoanRow } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const rows = date
    ? (db
        .prepare('SELECT * FROM loans WHERE transaction_date = ? ORDER BY id DESC')
        .all(date) as LoanRow[])
    : (db.prepare('SELECT * FROM loans ORDER BY id DESC LIMIT 200').all() as LoanRow[]);

  return NextResponse.json(rows.map(rowToEntry));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const stmt = db.prepare(`
    INSERT INTO loans
      (transaction_date, customer_name, age, gender, race, monthly_salary, loan_amount, employer_category, skim, bad_loan_balance)
    VALUES
      (@transactionDate, @customerName, @age, @gender, @race, @monthlySalary, @loanAmount, @employerCategory, @skim, @badloanBalance)
  `);
  const info = stmt.run(d);
  const row = db.prepare('SELECT * FROM loans WHERE id = ?').get(info.lastInsertRowid) as LoanRow;

  return NextResponse.json(rowToEntry(row), { status: 201 });
}

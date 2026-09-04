import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { loanSchema } from '@/lib/validation';
import { rowToEntry, LoanRow } from '@/lib/serialize';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const body = await req.json();
  const parsed = loanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const existing = db.prepare('SELECT id FROM loans WHERE id = ?').get(id);
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  db.prepare(
    `UPDATE loans SET
      transaction_date = @transactionDate,
      customer_name = @customerName,
      age = @age,
      gender = @gender,
      race = @race,
      monthly_salary = @monthlySalary,
      loan_amount = @loanAmount,
      employer_category = @employerCategory,
      skim = @skim,
      bad_loan_balance = @badloanBalance
     WHERE id = @id`
  ).run({ ...d, id });

  const row = db.prepare('SELECT * FROM loans WHERE id = ?').get(id) as LoanRow;
  return NextResponse.json(rowToEntry(row));
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const result = db.prepare('DELETE FROM loans WHERE id = ?').run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

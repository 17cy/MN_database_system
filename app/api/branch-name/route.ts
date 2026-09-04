import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';

const DEFAULT_NAME = 'Insert Branch Name';

const bodySchema = z.object({
  branchName: z.string().trim().min(1).max(100),
});

export async function GET() {
  const row = db.prepare('SELECT branch_name FROM branch_settings WHERE id = 1').get() as
    | { branch_name: string }
    | undefined;
  return NextResponse.json({ branchName: row?.branch_name ?? DEFAULT_NAME });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  db.prepare('UPDATE branch_settings SET branch_name = ? WHERE id = 1').run(parsed.data.branchName);
  return NextResponse.json({ branchName: parsed.data.branchName });
}

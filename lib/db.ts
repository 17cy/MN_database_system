import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');

declare global {
  // eslint-disable-next-line no-var
  var __db: DatabaseSync | undefined;
}

// `timeout` (busy-timeout in ms) is supported at runtime but missing from the
// current @types/node definitions for node:sqlite, hence the `any` cast.
const db = global.__db ?? new DatabaseSync(dbPath, { timeout: 5000 } as any);
if (process.env.NODE_ENV !== 'production') {
  global.__db = db;
}

db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_date TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    race TEXT NOT NULL,
    monthly_salary REAL NOT NULL,
    loan_amount REAL NOT NULL,
    employer_category TEXT NOT NULL,
    skim TEXT NOT NULL DEFAULT 'Others',
    bad_loan_balance REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migration for databases created before a given column existed. The
// existence check and the ALTER are not atomic, so concurrent processes
// (e.g. Next.js's parallel build workers) can both see the column missing
// and both attempt to add it — the loser's error is caught and ignored.
function ensureColumn(name: string, columnDefinition: string) {
  const columns = db.prepare('PRAGMA table_info(loans)').all() as { name: string }[];
  if (columns.some((c) => c.name === name)) return;
  try {
    db.exec(`ALTER TABLE loans ADD COLUMN ${columnDefinition}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!message.includes('duplicate column name')) {
      throw err;
    }
  }
}

ensureColumn('skim', "skim TEXT NOT NULL DEFAULT 'Others'");
ensureColumn('bad_loan_balance', 'bad_loan_balance REAL NOT NULL DEFAULT 0');

db.exec(`
  CREATE TABLE IF NOT EXISTS branch_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    branch_name TEXT NOT NULL DEFAULT 'Insert Branch Name'
  );
`);
db.exec("INSERT OR IGNORE INTO branch_settings (id, branch_name) VALUES (1, 'Insert Branch Name')");

export default db;

export interface LoanRow {
  id: number;
  transaction_date: string;
  customer_name: string;
  age: number;
  gender: string;
  race: string;
  monthly_salary: number;
  loan_amount: number;
  employer_category: string;
  skim: string;
  bad_loan_balance: number;
  created_at: string;
}

export interface LoanEntry {
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
  createdAt: string;
}

export function rowToEntry(row: LoanRow): LoanEntry {
  return {
    id: row.id,
    transactionDate: row.transaction_date,
    customerName: row.customer_name,
    age: row.age,
    gender: row.gender,
    race: row.race,
    monthlySalary: row.monthly_salary,
    loanAmount: row.loan_amount,
    employerCategory: row.employer_category,
    skim: row.skim,
    badloanBalance: row.bad_loan_balance,
    createdAt: row.created_at,
  };
}

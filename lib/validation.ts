import { z } from 'zod';

export const GENDERS = ['Male', 'Female'] as const;
export const RACES = ['Malay', 'Chinese', 'Indian', 'Others'] as const;
export const EMPLOYER_CATEGORIES = [
  'Swasta',
  'Kilang',
  'Kerajaan',
  'Self-Employed',
  'Pencen',
  'Socso',
  'JKM',
  'Security',
  'Others',
] as const;
export const SKIM_OPTIONS = ['1 mth', '6 mths', '12 mths', '18 mths', '24 mths', 'Others'] as const;

export const loanSchema = z.object({
  transactionDate: z
    .string()
    .min(1, 'Transaction date is required')
    .refine((v) => !isNaN(Date.parse(v)), 'Invalid date'),
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  age: z.coerce
    .number({ invalid_type_error: 'Age is required' })
    .int('Age must be a whole number')
    .min(18, 'Age must be at least 18')
    .max(100, 'Age must be 100 or below'),
  gender: z.enum(GENDERS, { errorMap: () => ({ message: 'Select a gender' }) }),
  race: z.enum(RACES, { errorMap: () => ({ message: 'Select a race' }) }),
  monthlySalary: z.coerce
    .number({ invalid_type_error: 'Monthly salary is required' })
    .positive('Monthly salary must be greater than 0')
    .max(1000000, 'Monthly salary is too large'),
  loanAmount: z.coerce
    .number({ invalid_type_error: 'Loan amount is required' })
    .positive('Loan amount must be greater than 0')
    .max(10000000, 'Loan amount is too large'),
  employerCategory: z.enum(EMPLOYER_CATEGORIES, {
    errorMap: () => ({ message: 'Select an employer category' }),
  }),
  skim: z.enum(SKIM_OPTIONS, { errorMap: () => ({ message: 'Select a skim' }) }),
  badloanBalance: z.coerce
    .number({ invalid_type_error: 'Badloan balance is required' })
    .min(0, 'Badloan balance must be 0 or greater')
    .max(10000000, 'Badloan balance is too large'),
});

export type LoanInput = z.infer<typeof loanSchema>;

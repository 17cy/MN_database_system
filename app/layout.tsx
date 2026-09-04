import type { Metadata } from 'next';
import Link from 'next/link';
import BranchTitle from '@/components/branch-title';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pinjaman Wang Berlesen — Internal System',
  description: 'Internal loan data entry and analytics system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center gap-6">
            <BranchTitle />
            <Link href="/entry" className="text-sm text-slate-600 hover:text-slate-900">
              Data Entry
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProcGen | Hiring Portal',
  description: 'AI/ML Intern Assessment Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#050505] text-slate-200 antialiased min-h-screen flex flex-col font-mono selection:bg-cyan-900 selection:text-cyan-50">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}

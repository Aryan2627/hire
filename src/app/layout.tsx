import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProcGen | Assessment Portal',
  description: 'ProcGen Candidate Assessment Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}

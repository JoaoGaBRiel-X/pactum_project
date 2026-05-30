import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lefer SaaS - Gestão de Contratos',
  description: 'Plataforma SaaS de Gestão de Contratos e Cobrança',
};

import { Providers } from '@/components/Providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 min-h-screen`}>
        <Providers>
          <Sidebar />
          <Header />
          <main className="ml-64 p-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

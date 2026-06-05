import type { Metadata } from 'next';
import './globals.css';
import { MainLayoutWrapper } from '@/components/layout/MainLayoutWrapper';
import { Toaster } from 'sonner';
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
      <body className={`font-sans bg-slate-50 min-h-screen`}>
        <Providers>
          <MainLayoutWrapper>
            {children}
          </MainLayoutWrapper>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}

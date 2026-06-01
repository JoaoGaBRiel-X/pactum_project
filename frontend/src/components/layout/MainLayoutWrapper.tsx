'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/admin/tenants/new') {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <Header />
      <main className="md:ml-64 p-4 sm:p-6 md:p-8 min-h-screen transition-all">
        {children}
      </main>
    </>
  );
}

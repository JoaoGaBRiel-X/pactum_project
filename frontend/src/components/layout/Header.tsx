'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [activeTenant, setActiveTenant] = useState<string>('');

  useEffect(() => {
    const isClient = typeof window !== 'undefined';
    if (!isClient) return;

    const token = localStorage.getItem('gestao_token');
    if (!token && pathname !== '/login') {
      router.push('/login');
      return;
    }

    if (token) {
      apiFetch('/authentication/me/tenants').then((data) => {
        setTenants(data);
        const currentTenant = localStorage.getItem('gestao_tenant_id');
        if (currentTenant) {
          setActiveTenant(currentTenant);
        } else if (data.length > 0) {
          setActiveTenant(data[0].tenantId);
          localStorage.setItem('gestao_tenant_id', data[0].tenantId);
        }
      }).catch((err) => {
        if (err.message.includes('Token')) {
          localStorage.removeItem('gestao_token');
          router.push('/login');
        }
      });
    }
  }, [pathname, router]);

  if (pathname === '/login') {
    return null;
  }

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTenantId = e.target.value;
    setActiveTenant(newTenantId);
    localStorage.setItem('gestao_tenant_id', newTenantId);
    // Recarregar a página para limpar caches do react-query e contexto
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('gestao_token');
    localStorage.removeItem('gestao_tenant_id');
    router.push('/login');
  };

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-8 ml-64">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-medium text-slate-800">Tenant Atual:</h2>
        <select 
          className="text-sm border-slate-300 rounded-md border p-1"
          value={activeTenant}
          onChange={handleTenantChange}
        >
          {tenants.map(t => (
            <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800 font-medium mr-4">
          Sair
        </button>
        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
          AD
        </div>
      </div>
    </header>
  );
}

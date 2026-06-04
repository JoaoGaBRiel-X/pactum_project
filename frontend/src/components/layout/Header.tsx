'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [activeTenant, setActiveTenant] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

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

      apiFetch('/authentication/me').then((data) => {
        setUserProfile(data);
      }).catch(() => {});
    }
  }, [pathname, router]);

  // Fechar o menu mobile sempre que a rota mudar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 md:ml-64 transition-all">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <button className="p-2 -ml-2 rounded-md hover:bg-slate-100 text-slate-600">
                <Menu size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-slate-900 border-r-slate-800 text-slate-300 flex flex-col">
              <SidebarContent handleLogout={handleLogout} />
            </SheetContent>
          </Sheet>
        </div>

        <h2 className="text-sm font-medium text-slate-800 hidden sm:block">Tenant Atual:</h2>
        <select 
          className="text-sm border-slate-300 rounded-md border p-1 max-w-[150px] sm:max-w-[200px] truncate"
          value={activeTenant}
          onChange={handleTenantChange}
        >
          {tenants.map(t => (
            <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-slate-400 rounded-full">
              <span className="text-sm font-medium text-slate-700 hidden sm:block">
                {userProfile?.name || 'Carregando...'}
              </span>
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src={userProfile?.avatarUrl} alt={userProfile?.name || 'User'} />
                <AvatarFallback className="bg-slate-800 text-white text-xs">
                  {userProfile?.name?.substring(0, 2).toUpperCase() || 'AD'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              Configurações de Perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 focus:bg-red-50">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

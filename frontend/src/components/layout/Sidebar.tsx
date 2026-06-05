'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Package, Home, Settings, LogOut, FileText, DollarSign, TrendingUp, FileSignature, Mail, Key, Boxes, Building, Shield } from 'lucide-react';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';
import { getImageUrl } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export const navigationGroups = [
  {
    label: "Visão Geral",
    items: [
      { href: "/", icon: Home, label: "Dashboard", requiredPermissions: [] }
    ]
  },
  {
    label: "Cadastros",
    items: [
      { href: "/customers", icon: Users, label: "Clientes", requiredPermissions: ['customers:read', 'customers:read_own'] },
      { href: "/corporate-groups", icon: Users, label: "Grupos Econômicos", requiredPermissions: ['customers:read'] },
      { href: "/product-groups", icon: Boxes, label: "Grupos de Produtos", requiredPermissions: ['settings:manage'] },
      { href: "/products", icon: Package, label: "Produtos", requiredPermissions: ['settings:manage'] }
    ]
  },
  {
    label: "Comercial / Jurídico",
    items: [
      { href: "/contracts", icon: FileText, label: "Contratos", requiredPermissions: ['contracts:read', 'contracts:read_own'] },
      { href: "/templates", icon: FileSignature, label: "Templates", requiredPermissions: ['settings:manage'] }
    ]
  },
  {
    label: "Financeiro",
    items: [
      { href: "/financial", icon: DollarSign, label: "Financeiro", requiredPermissions: ['financial:read'] },
      { href: "/adjustments", icon: TrendingUp, label: "Reajustes", requiredPermissions: ['financial:read'] }
    ]
  },
  {
    label: "Configurações",
    items: [
      { href: "/admin/tenants", icon: Building, label: "Tenants (Locatários)", requiredPermissions: ['SUPERADMIN'] },
      { href: "/admin/notifications", icon: Mail, label: "Notificações", requiredPermissions: ['settings:manage'] },
      { href: "/admin/settings/general", icon: Settings, label: "Configurações", requiredPermissions: ['settings:manage'] },
      { href: "/admin/users", icon: Users, label: "Gestão de Usuários", requiredPermissions: ['users:manage'] }
    ]
  }
];

import { usePermissions } from '@/hooks/usePermissions';

export function SidebarContent({ handleLogout }: { handleLogout: () => void }) {
  const pathname = usePathname();
  const { settings } = useTenantSettings();
  const { role, hasPermission, isLoading } = usePermissions();
  const isSuperAdmin = role === 'SUPERADMIN';

  return (
    <>
      <div className="p-3 border-b border-[var(--sidebar-border,theme(colors.slate.800))] flex justify-center items-center min-h-[72px]">
        {settings?.logoUrl ? (
          <img src={getImageUrl(settings.logoUrl)} alt="Logo" className="max-h-16 max-w-full object-contain" />
        ) : (
          <h1 className="text-xl font-bold text-[var(--sidebar-fg,white)]">Lefer SaaS</h1>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="p-4 space-y-6">
          {navigationGroups.map((group, idx) => {
            const filteredItems = group.items.filter(item => {
              if (item.requiredPermissions.includes('SUPERADMIN') && !isSuperAdmin) return false;
              if (item.requiredPermissions.length === 0 || item.requiredPermissions.includes('SUPERADMIN')) return true;
              return hasPermission(item.requiredPermissions);
            });

            if (filteredItems.length === 0 && !isLoading) return null;

            return (
              <div key={idx}>
                <h3 className="px-4 text-xs font-semibold text-[var(--sidebar-fg,theme(colors.slate.500))] opacity-70 uppercase tracking-wider mb-2">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item, itemIdx) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                      <Link 
                        key={itemIdx} 
                        href={item.href} 
                        className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                          isActive ? 'bg-black/20 text-[var(--sidebar-fg,white)] font-medium' : 'text-[var(--sidebar-fg,theme(colors.slate.400))] opacity-80 hover:bg-black/10 hover:opacity-100'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-[var(--primary)]' : ''} /> 
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-[var(--sidebar-border,theme(colors.slate.800))]">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 rounded-md text-[var(--sidebar-fg,theme(colors.slate.400))] opacity-80 hover:bg-black/10 hover:opacity-100 transition-colors text-left">
          <LogOut size={18} /> <span>Sair</span>
        </button>
      </div>
    </>
  );
}

import { useQueryClient } from '@tanstack/react-query';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('gestao_token');
    localStorage.removeItem('gestao_tenant_id');
    queryClient.clear();
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[var(--sidebar-bg,theme(colors.slate.900))] text-[var(--sidebar-fg,theme(colors.slate.300))] h-screen fixed left-0 top-0 border-r border-[var(--sidebar-border,theme(colors.slate.800))] z-50">
      <SidebarContent handleLogout={handleLogout} />
    </aside>
  );
}

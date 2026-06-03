'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Package, Home, Settings, LogOut, FileText, DollarSign, TrendingUp, FileSignature, Mail, Key, Boxes } from 'lucide-react';
import { useTenantSettings } from '@/contexts/TenantSettingsContext';

export const navigationGroups = [
  {
    label: "Visão Geral",
    items: [
      { href: "/", icon: Home, label: "Dashboard" }
    ]
  },
  {
    label: "Cadastros",
    items: [
      { href: "/customers", icon: Users, label: "Clientes" },
      { href: "/corporate-groups", icon: Users, label: "Grupos Econômicos" },
      { href: "/product-groups", icon: Boxes, label: "Grupos de Produtos" },
      { href: "/products", icon: Package, label: "Produtos" }
    ]
  },
  {
    label: "Comercial / Jurídico",
    items: [
      { href: "/contracts", icon: FileText, label: "Contratos" },
      { href: "/templates", icon: FileSignature, label: "Templates" }
    ]
  },
  {
    label: "Financeiro",
    items: [
      { href: "/financial", icon: DollarSign, label: "Financeiro" },
      { href: "/adjustments", icon: TrendingUp, label: "Reajustes" }
    ]
  },
  {
    label: "Configurações",
    items: [
      { href: "/admin/notifications", icon: Mail, label: "Notificações" },
      { href: "/admin/settings/api-keys", icon: Key, label: "Chaves de API" },
      { href: "/admin/settings/general", icon: Settings, label: "Identidade Visual e Dados" }
    ]
  }
];

export function SidebarContent({ handleLogout }: { handleLogout: () => void }) {
  const pathname = usePathname();
  const { settings } = useTenantSettings();

  return (
    <>
      <div className="p-6 border-b border-slate-800">
        {settings?.logoUrl ? (
          <img src={settings.logoUrl} alt="Logo" className="max-h-12 max-w-full object-contain" />
        ) : (
          <h1 className="text-xl font-bold text-white">Lefer SaaS</h1>
        )}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="p-4 space-y-6">
          {navigationGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link 
                      key={itemIdx} 
                      href={item.href} 
                      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                        isActive ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-[var(--primary)]' : ''} /> 
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-left">
          <LogOut size={18} /> <span>Sair</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('gestao_token');
    localStorage.removeItem('gestao_tenant_id');
    router.push('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 h-screen fixed left-0 top-0 border-r border-slate-800 z-50">
      <SidebarContent handleLogout={handleLogout} />
    </aside>
  );
}

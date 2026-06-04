'use client';

import { Settings, Key, Shield, Palette } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Geral', href: '/admin/settings/general', icon: Settings },
    { name: 'Identidade Visual', href: '/admin/settings/visual-identity', icon: Palette },
    { name: 'Chaves de API', href: '/admin/settings/api-keys', icon: Key },
    { name: 'Perfis de Acesso', href: '/admin/settings/roles', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="text-primary w-8 h-8 hidden md:block" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configurações e Acessos</h1>
            <p className="text-slate-500 mt-1">Gerencie as configurações da empresa, integrações e perfis de acesso.</p>
          </div>
        </div>

        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors
                    ${isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }
                  `}
                >
                  <Icon size={16} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
}

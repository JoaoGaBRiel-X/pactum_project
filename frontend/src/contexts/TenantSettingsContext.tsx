"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { tenantSettingsApi, TenantSettings } from '@/services/tenant-settings-api';
import { usePathname } from 'next/navigation';

interface TenantSettingsContextType {
  settings: TenantSettings | null;
  loading: boolean;
}

const TenantSettingsContext = createContext<TenantSettingsContextType>({
  settings: null,
  loading: true,
});

export function TenantSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Não carregar em rotas públicas (login, setup, portal do cliente)
    if (
      pathname === '/login' ||
      pathname.startsWith('/portal/') ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password'
    ) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const data = await tenantSettingsApi.getSettings();
        setSettings(data);
        
        // Injetar variáveis CSS globais se estiverem definidas
        const root = document.documentElement;
        
        if (data.primaryColor) {
          // Extrair HSL ou usar direto se suportado. No tailwind v4, var(--primary) aceita a string literal em alguns contextos,
          // Mas é mais seguro setar a cor em hex que o Tailwind ou o CSS consumam, ou seja:
          // Como o Tailwind define hsl(...), para Hex precisamos sobrescrever. 
          // O mais simples é sobrescrever a rule base inteira para o primary.
        }
      } catch (err) {
        console.error("Failed to load tenant settings", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [pathname]);

  return (
    <TenantSettingsContext.Provider value={{ settings, loading }}>
      {(settings?.primaryColor || settings?.sidebarColor || settings?.sidebarTextColor) && (
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${settings.primaryColor ? `--primary: ${settings.primaryColor} !important;` : ''}
              ${settings.sidebarColor ? `--sidebar-bg: ${settings.sidebarColor} !important;` : ''}
              ${settings.sidebarTextColor ? `--sidebar-fg: ${settings.sidebarTextColor} !important;` : ''}
              ${settings.sidebarColor ? `--sidebar-border: ${settings.sidebarColor} !important;` : ''}
            }
          `
        }} />
      )}
      {children}
    </TenantSettingsContext.Provider>
  );
}

export function useTenantSettings() {
  return useContext(TenantSettingsContext);
}

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
      pathname.startsWith('/admin') ||
      pathname.startsWith('/portal/')
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
      {settings && settings.primaryColor && (
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${settings.primaryColor} !important;
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

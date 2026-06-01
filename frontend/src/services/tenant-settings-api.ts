import { apiFetch } from '@/lib/api';

export interface TenantSettings {
  id?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  supportEmail?: string;
  supportPhone?: string;
  companyDocument?: string;
  name?: string;
  tradeName?: string;
  document?: string;
  legalRepName?: string;
  legalRepCpf?: string;
}

export const tenantSettingsApi = {
  getSettings: async (): Promise<TenantSettings> => {
    return apiFetch('/tenant-settings');
  },
  
  updateSettings: async (data: Partial<TenantSettings>): Promise<TenantSettings> => {
    return apiFetch('/tenant-settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};

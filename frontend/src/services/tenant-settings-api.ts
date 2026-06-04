import { apiFetch } from '@/lib/api';

export interface TenantSettings {
  id?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  sidebarColor?: string;
  sidebarTextColor?: string;
  supportEmail?: string;
  supportPhone?: string;
  companyDocument?: string;
  name?: string;
  tradeName?: string;
  document?: string;
  legalRepName?: string;
  legalRepCpf?: string;
  billingCutoffStrategy?: 'GLOBAL' | 'PER_CONTRACT' | 'PER_PRODUCT_GROUP';
  globalCutoffDay?: number;
  allowActivationWithoutDocument?: boolean;
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
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
  },

  uploadLogo: async (file: File): Promise<TenantSettings> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/tenant-settings/logo', {
      method: 'POST',
      body: formData,
    });
  }
};

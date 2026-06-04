import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface UserPermissions {
  role: string;
  roleId: string;
  permissions: string[];
  maxDiscount: number | null;
}

export function usePermissions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-permissions'],
    queryFn: async (): Promise<UserPermissions> => {
      const response = await apiFetch('/authentication/me/permissions');
      return response;
    },
    // Cache per session / tab
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const hasPermission = (requiredPermissions: string | string[]) => {
    if (!data) return false;
    if (data.role === 'SUPERADMIN') return true;

    const reqPerms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    
    // Check if the user has ANY of the required permissions
    return reqPerms.some((perm) => data.permissions.includes(perm));
  };

  const hasAllPermissions = (requiredPermissions: string[]) => {
    if (!data) return false;
    if (data.role === 'SUPERADMIN') return true;

    return requiredPermissions.every((perm) => data.permissions.includes(perm));
  };

  return {
    permissions: data?.permissions || [],
    role: data?.role || '',
    maxDiscount: data?.maxDiscount ?? 0,
    isLoading,
    error,
    hasPermission,
    hasAllPermissions,
  };
}

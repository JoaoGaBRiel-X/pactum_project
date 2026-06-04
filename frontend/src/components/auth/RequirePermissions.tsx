import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface RequirePermissionsProps {
  permissions: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAll?: boolean;
}

export function RequirePermissions({ 
  permissions, 
  children, 
  fallback = null,
  requireAll = false 
}: RequirePermissionsProps) {
  const { hasPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return null; // Or a skeleton if needed
  }

  const isAuthorized = requireAll 
    ? hasAllPermissions(Array.isArray(permissions) ? permissions : [permissions])
    : hasPermission(permissions);

  if (!isAuthorized) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

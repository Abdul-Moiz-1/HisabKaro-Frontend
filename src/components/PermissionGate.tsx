// components/PermissionGate.tsx
import React, { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission, Role } from '../types/rbac.types';

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission | Permission[];
  role?: Role | Role[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, requires all permissions (AND logic)
}

/**
 * Component-level permission gate
 * Conditionally renders children based on permissions/roles
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  role,
  fallback = null,
  requireAll = true,
}) => {
  const { can, canAny, isRole } = usePermission();

  const hasAccess = (): boolean => {
    // Check role first if provided
    if (role && !isRole(role)) {
      return false;
    }

    // Check permissions
    if (permission) {
      if (Array.isArray(permission)) {
        return requireAll ? can(permission) : canAny(permission);
      }
      return can(permission);
    }

    return true;
  };

  return hasAccess() ? <>{children}</> : <>{fallback}</>;
};

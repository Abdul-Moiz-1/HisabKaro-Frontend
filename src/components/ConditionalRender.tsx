// components/ConditionalRender.tsx
import React, { ReactNode } from 'react';
import { usePermission } from '../hooks/usePermission';
import { Permission, Role } from '../types/rbac.types';

interface ConditionalRenderProps {
  permission?: Permission | Permission[];
  role?: Role | Role[];
  children: (hasAccess: boolean) => ReactNode;
}

/**
 * Render prop pattern for conditional rendering based on permissions
 */
export const ConditionalRender: React.FC<ConditionalRenderProps> = ({
  permission,
  role,
  children,
}) => {
  const { can, isRole } = usePermission();

  const hasAccess = (): boolean => {
    if (role && !isRole(role)) return false;
    if (permission && !can(permission)) return false;
    return true;
  };

  return <>{children(hasAccess())}</>;
};

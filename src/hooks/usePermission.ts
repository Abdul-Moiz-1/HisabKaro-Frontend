// hooks/usePermission.ts
import { useAuth } from '../context/AuthContext';
import { Permission, Role } from '../types/rbac.types';

/**
 * Custom hook for permission checks in components
 */
export const usePermission = () => {
  const { hasPermission, hasRole, user } = useAuth();

  /**
   * Check if user has all required permissions
   */
  const can = (permission: Permission | Permission[]): boolean => {
    return hasPermission(permission);
  };

  /**
   * Check if user has any of the provided permissions
   */
  const canAny = (permissions: Permission[]): boolean => {
    if (!user || !user.isActive) return false;
    return permissions.some(p => user.permissions.includes(p));
  };

  /**
   * Check if user has specific role
   */
  const isRole = (role: Role | Role[]): boolean => {
    return hasRole(role);
  };

  /**
   * Check if user can perform action on resource (with custom condition)
   */
  const canAccess = (
    permission: Permission,
    condition?: (user: any) => boolean,
  ): boolean => {
    if (!hasPermission(permission)) return false;
    if (condition && user) return condition(user);
    return true;
  };

  return {
    can,
    canAny,
    isRole,
    canAccess,
    user,
  };
};

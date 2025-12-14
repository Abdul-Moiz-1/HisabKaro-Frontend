// utils/rbac.utils.ts
import { Permission, Role, User } from '../types/rbac.types';
import { getRolePermissions } from '../config/rbac.config';

/**
 * Utility functions for RBAC operations
 */

export const RBACUtils = {
  /**
   * Check if user owns a resource
   */
  isOwner: (user: User, resourceOwnerId: string): boolean => {
    return user.id === resourceOwnerId;
  },

  /**
   * Check if user is in same organization
   */
  isSameOrganization: (user: User, resourceOrgId: string): boolean => {
    return user.organizationId === resourceOrgId;
  },

  /**
   * Get all permissions for a user
   */
  getUserPermissions: (user: User): Permission[] => {
    return getRolePermissions(user.role);
  },

  /**
   * Check if role has higher privilege than another role
   */
  hasHigherPrivilege: (userRole: Role, targetRole: Role): boolean => {
    const hierarchy: Record<Role, number> = {
      [Role.SUPER_ADMIN]: 7,
      [Role.ADMIN]: 6,
      [Role.MANAGER]: 5,
      [Role.ACCOUNTANT]: 4,
      [Role.INVENTORY_MANAGER]: 3,
      [Role.SALES_PERSON]: 2,
      [Role.VIEWER]: 1,
    };

    return hierarchy[userRole] > hierarchy[targetRole];
  },

  /**
   * Validate if a user can assign a specific role
   */
  canAssignRole: (assignerRole: Role, targetRole: Role): boolean => {
    // Super Admin can assign any role
    if (assignerRole === Role.SUPER_ADMIN) return true;

    // Admin can assign roles below Manager
    if (assignerRole === Role.ADMIN) {
      return [
        Role.MANAGER,
        Role.ACCOUNTANT,
        Role.INVENTORY_MANAGER,
        Role.SALES_PERSON,
        Role.VIEWER,
      ].includes(targetRole);
    }

    return false;
  },
};

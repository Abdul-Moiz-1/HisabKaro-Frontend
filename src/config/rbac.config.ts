// config/rbac.config.ts
import { Role, Permission, RolePermissions } from '../types/rbac.types';

/**
 * Role-Based Access Control Configuration
 * Defines permissions for each role in the system
 */
export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [Role.SUPER_ADMIN]: {
    role: Role.SUPER_ADMIN,
    description: 'Full system access with all permissions',
    permissions: Object.values(Permission), // All permissions
  },

  [Role.ADMIN]: {
    role: Role.ADMIN,
    description: 'Organization administrator with most permissions',
    permissions: [
      // User Management (except role management)
      Permission.USER_CREATE,
      Permission.USER_READ,
      Permission.USER_UPDATE,
      Permission.USER_DELETE,

      // All Transaction permissions
      Permission.TRANSACTION_CREATE,
      Permission.TRANSACTION_READ,
      Permission.TRANSACTION_UPDATE,
      Permission.TRANSACTION_DELETE,
      Permission.TRANSACTION_APPROVE,

      // All Reports
      Permission.REPORT_VIEW_BASIC,
      Permission.REPORT_VIEW_DETAILED,
      Permission.REPORT_EXPORT,
      Permission.REPORT_CUSTOMIZE,

      // All Inventory
      Permission.INVENTORY_CREATE,
      Permission.INVENTORY_READ,
      Permission.INVENTORY_UPDATE,
      Permission.INVENTORY_DELETE,
      Permission.INVENTORY_ADJUST,

      // All Customer
      Permission.CUSTOMER_CREATE,
      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,
      Permission.CUSTOMER_DELETE,

      // All Supplier
      Permission.SUPPLIER_CREATE,
      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,
      Permission.SUPPLIER_DELETE,

      // Settings
      Permission.SETTINGS_VIEW,
      Permission.SETTINGS_UPDATE,

      // Bank & Cash
      Permission.BANK_VIEW,
      Permission.BANK_MANAGE,
      Permission.CASH_VIEW,
      Permission.CASH_MANAGE,

      // Loans
      Permission.LOAN_CREATE,
      Permission.LOAN_VIEW,
      Permission.LOAN_MANAGE,
    ],
  },

  [Role.MANAGER]: {
    role: Role.MANAGER,
    description: 'Manager with operational permissions',
    permissions: [
      Permission.USER_READ,

      Permission.TRANSACTION_CREATE,
      Permission.TRANSACTION_READ,
      Permission.TRANSACTION_UPDATE,
      Permission.TRANSACTION_APPROVE,

      Permission.REPORT_VIEW_BASIC,
      Permission.REPORT_VIEW_DETAILED,
      Permission.REPORT_EXPORT,

      Permission.INVENTORY_CREATE,
      Permission.INVENTORY_READ,
      Permission.INVENTORY_UPDATE,
      Permission.INVENTORY_ADJUST,

      Permission.CUSTOMER_CREATE,
      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,

      Permission.SUPPLIER_CREATE,
      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,

      Permission.SETTINGS_VIEW,

      Permission.BANK_VIEW,
      Permission.CASH_VIEW,
      Permission.CASH_MANAGE,

      Permission.LOAN_VIEW,
    ],
  },

  [Role.ACCOUNTANT]: {
    role: Role.ACCOUNTANT,
    description: 'Financial and accounting operations',
    permissions: [
      Permission.TRANSACTION_CREATE,
      Permission.TRANSACTION_READ,
      Permission.TRANSACTION_UPDATE,

      Permission.REPORT_VIEW_BASIC,
      Permission.REPORT_VIEW_DETAILED,
      Permission.REPORT_EXPORT,

      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,

      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,

      Permission.BANK_VIEW,
      Permission.BANK_MANAGE,
      Permission.CASH_VIEW,
      Permission.CASH_MANAGE,

      Permission.LOAN_VIEW,
      Permission.LOAN_MANAGE,
    ],
  },

  [Role.SALES_PERSON]: {
    role: Role.SALES_PERSON,
    description: 'Sales and customer management',
    permissions: [
      Permission.TRANSACTION_CREATE,
      Permission.TRANSACTION_READ,

      Permission.REPORT_VIEW_BASIC,

      Permission.INVENTORY_READ,

      Permission.CUSTOMER_CREATE,
      Permission.CUSTOMER_READ,
      Permission.CUSTOMER_UPDATE,

      Permission.CASH_VIEW,
    ],
  },

  [Role.INVENTORY_MANAGER]: {
    role: Role.INVENTORY_MANAGER,
    description: 'Inventory and stock management',
    permissions: [
      Permission.TRANSACTION_READ,

      Permission.REPORT_VIEW_BASIC,

      Permission.INVENTORY_CREATE,
      Permission.INVENTORY_READ,
      Permission.INVENTORY_UPDATE,
      Permission.INVENTORY_ADJUST,

      Permission.SUPPLIER_READ,
      Permission.SUPPLIER_UPDATE,
    ],
  },

  [Role.VIEWER]: {
    role: Role.VIEWER,
    description: 'Read-only access to basic information',
    permissions: [
      Permission.TRANSACTION_READ,
      Permission.REPORT_VIEW_BASIC,
      Permission.INVENTORY_READ,
      Permission.CUSTOMER_READ,
      Permission.SUPPLIER_READ,
      Permission.CASH_VIEW,
      Permission.BANK_VIEW,
    ],
  },
};

/**
 * Get permissions for a specific role
 */
export const getRolePermissions = (role: Role): Permission[] => {
  return ROLE_PERMISSIONS[role]?.permissions || [];
};

/**
 * Check if a role has a specific permission
 */
export const roleHasPermission = (
  role: Role,
  permission: Permission,
): boolean => {
  return getRolePermissions(role).includes(permission);
};

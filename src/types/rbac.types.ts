// types/rbac.types.ts
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  SALES_PERSON = 'SALES_PERSON',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
  VIEWER = 'VIEWER',
}

export enum Permission {
  // User Management
  USER_CREATE = 'USER_CREATE',
  USER_READ = 'USER_READ',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_MANAGE_ROLES = 'USER_MANAGE_ROLES',

  // Transaction Management
  TRANSACTION_CREATE = 'TRANSACTION_CREATE',
  TRANSACTION_READ = 'TRANSACTION_READ',
  TRANSACTION_UPDATE = 'TRANSACTION_UPDATE',
  TRANSACTION_DELETE = 'TRANSACTION_DELETE',
  TRANSACTION_APPROVE = 'TRANSACTION_APPROVE',

  // Financial Reports
  REPORT_VIEW_BASIC = 'REPORT_VIEW_BASIC',
  REPORT_VIEW_DETAILED = 'REPORT_VIEW_DETAILED',
  REPORT_EXPORT = 'REPORT_EXPORT',
  REPORT_CUSTOMIZE = 'REPORT_CUSTOMIZE',

  // Inventory Management
  INVENTORY_CREATE = 'INVENTORY_CREATE',
  INVENTORY_READ = 'INVENTORY_READ',
  INVENTORY_UPDATE = 'INVENTORY_UPDATE',
  INVENTORY_DELETE = 'INVENTORY_DELETE',
  INVENTORY_ADJUST = 'INVENTORY_ADJUST',

  // Customer Management
  CUSTOMER_CREATE = 'CUSTOMER_CREATE',
  CUSTOMER_READ = 'CUSTOMER_READ',
  CUSTOMER_UPDATE = 'CUSTOMER_UPDATE',
  CUSTOMER_DELETE = 'CUSTOMER_DELETE',

  // Supplier Management
  SUPPLIER_CREATE = 'SUPPLIER_CREATE',
  SUPPLIER_READ = 'SUPPLIER_READ',
  SUPPLIER_UPDATE = 'SUPPLIER_UPDATE',
  SUPPLIER_DELETE = 'SUPPLIER_DELETE',

  // Settings
  SETTINGS_VIEW = 'SETTINGS_VIEW',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  SETTINGS_SYSTEM = 'SETTINGS_SYSTEM',

  // Bank & Cash
  BANK_VIEW = 'BANK_VIEW',
  BANK_MANAGE = 'BANK_MANAGE',
  CASH_VIEW = 'CASH_VIEW',
  CASH_MANAGE = 'CASH_MANAGE',

  // Loans
  LOAN_CREATE = 'LOAN_CREATE',
  LOAN_VIEW = 'LOAN_VIEW',
  LOAN_MANAGE = 'LOAN_MANAGE',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Permission[];
  organizationId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
  description: string;
}

export type PermissionCheck = Permission | Permission[];
export type ConditionalPermission = {
  permission: Permission;
  condition?: (user: User, resource?: any) => boolean;
};

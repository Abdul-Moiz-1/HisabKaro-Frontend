import apiClient from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export interface Company {
  id: number;
  name: string;
  tradeName?: string;
  taxId?: string;
  currency: string;
  fiscalYearStart?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CompanySettings {
  companyId: number;
  defaultCurrency: string;
  defaultPaymentTerms: number;
  salesTaxRate: number;
  invoicePrefix: string;
  autoGenerateInvoiceNumbers: boolean;
  enableMultiCurrency: boolean;
  roundingMethod: 'normal' | 'up' | 'down';
  decimalPlaces: number;
}

export interface CompanyUser {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer';
  isActive: boolean;
  joinedAt: string;
}

export interface CreateCompanyPayload {
  name: string;
  tradeName?: string;
  taxId?: string;
  currency: string;
  fiscalYearStart?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface UpdateCompanyPayload {
  name?: string;
  tradeName?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
}

export interface UpdateSettingsPayload {
  defaultCurrency?: string;
  defaultPaymentTerms?: number;
  salesTaxRate?: number;
  invoicePrefix?: string;
  autoGenerateInvoiceNumbers?: boolean;
  enableMultiCurrency?: boolean;
  roundingMethod?: 'normal' | 'up' | 'down';
  decimalPlaces?: number;
}

export interface InviteUserPayload {
  email: string;
  role: CompanyUser['role'];
}

// Mock data
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA
let mockCompanyId = 10;

const MOCK_COMPANIES: Company[] = [
  {
    id: 1,
    name: 'Demo Business LLC',
    tradeName: 'Demo Business',
    taxId: 'NTN-1234567',
    currency: 'PKR',
    fiscalYearStart: '01',
    address: '123 Main Street',
    city: 'Karachi',
    country: 'Pakistan',
    phone: '+92-300-1234567',
    email: 'contact@demobusiness.com',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const MOCK_SETTINGS: CompanySettings = {
  companyId: 1,
  defaultCurrency: 'PKR',
  defaultPaymentTerms: 30,
  salesTaxRate: 17,
  invoicePrefix: 'INV',
  autoGenerateInvoiceNumbers: true,
  enableMultiCurrency: false,
  roundingMethod: 'normal',
  decimalPlaces: 2,
};

const MOCK_USERS: CompanyUser[] = [
  {
    id: 1,
    userId: 1,
    email: 'owner@demobusiness.com',
    firstName: 'Demo',
    lastName: 'Owner',
    role: 'owner',
    isActive: true,
    joinedAt: '2024-01-01T00:00:00Z',
  },
];

const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Company API
export const companyApi = {
  // List user's companies
  getAll: async (): Promise<Company[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_COMPANIES;
    }
    return apiClient.get<Company[]>('/companies');
  },

  // Get company by ID
  getById: async (id: number): Promise<{ data: Company }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const company = MOCK_COMPANIES.find(c => c.id === id);
      if (!company) throw new Error('Company not found');
      return { data: company };
    }
    return apiClient.get<{ data: Company }>(`/companies/${id}`);
  },

  // Create new company
  create: async (payload: CreateCompanyPayload): Promise<{ data: Company }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(500);
      const newCompany: Company = {
        id: ++mockCompanyId,
        ...payload,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      MOCK_COMPANIES.push(newCompany);
      return { data: newCompany };
    }
    return apiClient.post<{ data: Company }>('/companies', payload);
  },

  // Update company
  update: async (id: number, payload: UpdateCompanyPayload): Promise<{ data: Company }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_COMPANIES.findIndex(c => c.id === id);
      if (index === -1) throw new Error('Company not found');
      MOCK_COMPANIES[index] = { ...MOCK_COMPANIES[index], ...payload };
      return { data: MOCK_COMPANIES[index] };
    }
    return apiClient.patch<{ data: Company }>(`/companies/${id}`, payload);
  },

  // Delete company
  delete: async (id: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_COMPANIES.findIndex(c => c.id === id);
      if (index !== -1) MOCK_COMPANIES.splice(index, 1);
      return;
    }
    return apiClient.delete<void>(`/companies/${id}`);
  },

  // Get company settings
  getSettings: async (id: number): Promise<{ data: CompanySettings }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return { data: MOCK_SETTINGS };
    }
    return apiClient.get<{ data: CompanySettings }>(`/companies/${id}/settings`);
  },

  // Update company settings
  updateSettings: async (id: number, payload: UpdateSettingsPayload): Promise<{ data: CompanySettings }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      Object.assign(MOCK_SETTINGS, payload);
      return { data: MOCK_SETTINGS };
    }
    return apiClient.patch<{ data: CompanySettings }>(`/companies/${id}/settings`, payload);
  },

  // List company users
  getUsers: async (id: number): Promise<CompanyUser[]> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_USERS;
    }
    return apiClient.get<CompanyUser[]>(`/companies/${id}/users`);
  },

  // Invite user to company
  inviteUser: async (id: number, payload: InviteUserPayload): Promise<{ message: string }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return { message: `Invitation sent to ${payload.email}` };
    }
    return apiClient.post<{ message: string }>(`/companies/${id}/invite`, payload);
  },

  // Remove user from company
  removeUser: async (companyId: number, userId: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return;
    }
    return apiClient.delete<void>(`/companies/${companyId}/users/${userId}`);
  },

  // Set active company for current user
  setActive: async (companyId: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return;
    }
    return apiClient.post<void>('/auth/set-company', { companyId });
  },
};

export default companyApi;

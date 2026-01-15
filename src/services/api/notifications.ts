import apiClient, { PaginatedResponse } from './client';
import { ENV_CONFIG } from '../../constants/env';

// Types matching API documentation
export type NotificationType = 'success' | 'info' | 'warning' | 'error';
export type NotificationCategory = 'payment' | 'invoice' | 'customer' | 'supplier' | 'system' | 'reminder';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  data?: Record<string, any>;
  createdAt: string;
}

export interface NotificationFilters {
  unreadOnly?: boolean;
  category?: NotificationCategory;
  page?: number;
  limit?: number;
}

export interface NotificationPreferences {
  email: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    paymentDue: boolean;
    lowStock: boolean;
  };
  push: {
    invoiceCreated: boolean;
    paymentReceived: boolean;
    paymentDue: boolean;
    lowStock: boolean;
  };
  sms: {
    paymentReceived: boolean;
    paymentDue: boolean;
  };
}

// Mock data
// Mock data flag is now in ENV_CONFIG.USE_MOCK_DATA
let mockNotificationId = 100;

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Payment Received',
    message: 'Payment of Rs. 50,000 received from Ahmed Electronics',
    type: 'success',
    category: 'payment',
    isRead: false,
    data: { paymentId: 1, amount: 50000 },
    createdAt: '2025-01-06T14:00:00Z',
  },
  {
    id: 2,
    title: 'Invoice Overdue',
    message: 'Invoice INV-000001 is 5 days overdue. Outstanding: Rs. 87,750',
    type: 'warning',
    category: 'invoice',
    isRead: false,
    data: { invoiceId: 1, daysOverdue: 5 },
    createdAt: '2025-01-05T09:00:00Z',
  },
  {
    id: 3,
    title: 'New Customer',
    message: 'New customer "Karachi Traders" has been added',
    type: 'info',
    category: 'customer',
    isRead: true,
    data: { customerId: 2 },
    createdAt: '2025-01-03T10:30:00Z',
  },
  {
    id: 4,
    title: 'Payment Due Tomorrow',
    message: 'Payment of Rs. 90,400 to Al-Rehman Traders is due tomorrow',
    type: 'warning',
    category: 'reminder',
    isRead: false,
    data: { supplierId: 1, amount: 90400 },
    createdAt: '2025-01-06T08:00:00Z',
  },
];

const MOCK_PREFERENCES: NotificationPreferences = {
  email: {
    invoiceCreated: true,
    paymentReceived: true,
    paymentDue: true,
    lowStock: false,
  },
  push: {
    invoiceCreated: true,
    paymentReceived: true,
    paymentDue: true,
    lowStock: true,
  },
  sms: {
    paymentReceived: true,
    paymentDue: true,
  },
};

const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Notifications API
export const notificationsApi = {
  // List notifications
  getAll: async (filters?: NotificationFilters): Promise<PaginatedResponse<Notification> & { unreadCount: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      let filtered = [...MOCK_NOTIFICATIONS];
      
      if (filters?.unreadOnly) {
        filtered = filtered.filter(n => !n.isRead);
      }
      if (filters?.category) {
        filtered = filtered.filter(n => n.category === filters.category);
      }
      
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      
      return {
        data: filtered.slice((page - 1) * limit, page * limit),
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
        unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
      };
    }
    return apiClient.get<PaginatedResponse<Notification> & { unreadCount: number }>('/notifications', filters);
  },

  // Get unread count
  getUnreadCount: async (): Promise<{ count: number }> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay(100);
      return { count: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length };
    }
    return apiClient.get<{ count: number }>('/notifications/unread-count');
  },

  // Mark as read
  markAsRead: async (id: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const notification = MOCK_NOTIFICATIONS.find(n => n.id === id);
      if (notification) notification.isRead = true;
      return;
    }
    return apiClient.patch<void>(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      MOCK_NOTIFICATIONS.forEach(n => n.isRead = true);
      return;
    }
    return apiClient.post<void>('/notifications/mark-all-read');
  },

  // Delete notification
  delete: async (id: number): Promise<void> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === id);
      if (index !== -1) MOCK_NOTIFICATIONS.splice(index, 1);
      return;
    }
    return apiClient.delete<void>(`/notifications/${id}`);
  },

  // Get preferences
  getPreferences: async (): Promise<NotificationPreferences> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      return MOCK_PREFERENCES;
    }
    return apiClient.get<NotificationPreferences>('/notifications/preferences');
  },

  // Update preferences
  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    if (ENV_CONFIG.USE_MOCK_DATA) {
      await mockDelay();
      Object.assign(MOCK_PREFERENCES, preferences);
      return MOCK_PREFERENCES;
    }
    return apiClient.patch<NotificationPreferences>('/notifications/preferences', preferences);
  },

  // Send email notification (admin only)
  sendEmail: async (payload: { to: string; subject: string; body: string }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/notifications/send/email', payload);
  },

  // Send SMS notification (admin only)
  sendSms: async (payload: { to: string; message: string }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/notifications/send/sms', payload);
  },

  // Broadcast notification (admin only)
  broadcast: async (payload: { title: string; message: string; type: NotificationType }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/notifications/broadcast', payload);
  },

  // Add mock notification (for testing)
  addMockNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: ++mockNotificationId,
      createdAt: new Date().toISOString(),
    };
    MOCK_NOTIFICATIONS.unshift(newNotification);
    return newNotification;
  },
};

export default notificationsApi;

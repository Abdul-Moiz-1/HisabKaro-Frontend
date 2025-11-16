// config/forms/customerSelection.config.ts

import { FormConfig, FieldType } from '../../types/forms';

export const customerSelectionConfig: FormConfig = {
  id: 'customer-selection',
  title: 'Who paid you?',
  sections: [
    {
      id: 'search-section',
      fields: [
        {
          id: 'search',
          name: 'search',
          label: '',
          type: FieldType.SEARCH,
          placeholder: '🔍 Search customer name...',
          icon: '🔍',
        },
      ],
    },
  ],
};

// This will be replaced by API call
export const mockCustomers = [
  {
    id: '1',
    name: 'Ahmed Electronics',
    outstanding: 125000,
    dueDate: '2025-11-10',
    phone: '+923001234567',
    email: 'ahmed@example.com',
  },
  {
    id: '2',
    name: 'Karachi Traders',
    outstanding: 85000,
    dueDate: '2025-11-20',
    phone: '+923009876543',
  },
  {
    id: '3',
    name: 'Bismillah Store',
    outstanding: 45000,
    dueDate: '2025-11-05',
    phone: '+923007654321',
  },
];

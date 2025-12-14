// config/forms/addCustomer.config.ts
import { FormConfig, FieldType } from '../../types/forms';

export const addCustomerFormConfig: FormConfig = {
  id: 'add-customer',
  title: 'Add New Customer',
  submitButtonText: '✓ Save Customer',
  cancelButtonText: 'Cancel',
  sections: [
    {
      id: 'basic-info',
      title: 'Basic Information',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Customer Name',
          type: FieldType.TEXT,
          placeholder: 'Enter customer name',
          required: true,
          validations: [
            {
              type: 'required',
              message: 'Customer name is required',
            },
            {
              type: 'min',
              value: 2,
              message: 'Name must be at least 2 characters',
            },
            {
              type: 'max',
              value: 100,
              message: 'Name must not exceed 100 characters',
            },
          ],
        },
        {
          id: 'phone',
          name: 'phone',
          label: 'Phone Number',
          type: FieldType.PHONE,
          placeholder: '3001234567',
          prefix: '+92',
          required: true,
          validations: [
            {
              type: 'required',
              message: 'Phone number is required',
            },
            {
              type: 'pattern',
              value: /^3[0-9]{9}$/,
              message: 'Invalid phone number format (03XXXXXXXXX)',
            },
          ],
        },
        {
          id: 'email',
          name: 'email',
          label: 'Email',
          type: FieldType.EMAIL,
          placeholder: 'customer@example.com',
          required: false,
          validations: [
            {
              type: 'pattern',
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email format',
            },
          ],
        },
        {
          id: 'address',
          name: 'address',
          label: 'Address',
          type: FieldType.TEXTAREA,
          placeholder: 'Enter customer address',
          multiline: true,
          numberOfLines: 3,
          required: false,
        },
      ],
    },
    {
      id: 'credit-info',
      title: 'Credit Terms',
      fields: [
        {
          id: 'openingBalance',
          name: 'openingBalance',
          label: 'Opening Balance',
          type: FieldType.AMOUNT,
          placeholder: '0',
          defaultValue: '0',
          suffix: 'PKR',
          required: false,
          validations: [
            {
              type: 'min',
              value: 0,
              message: 'Opening balance cannot be negative',
            },
          ],
        },
        {
          id: 'creditPeriod',
          name: 'creditPeriod',
          label: 'Credit Period',
          type: FieldType.DROPDOWN,
          placeholder: 'Select credit period',
          defaultValue: '30',
          required: true,
          options: [
            { label: 'Cash (0 days)', value: '0' },
            { label: '7 days', value: '7' },
            { label: '15 days', value: '15' },
            { label: '30 days', value: '30' },
            { label: '45 days', value: '45' },
            { label: '60 days', value: '60' },
            { label: '90 days', value: '90' },
          ],
        },
        {
          id: 'creditLimit',
          name: 'creditLimit',
          label: 'Credit Limit',
          type: FieldType.AMOUNT,
          placeholder: '0',
          suffix: 'PKR',
          hint: 'Maximum credit allowed for this customer',
          required: false,
          validations: [
            {
              type: 'min',
              value: 0,
              message: 'Credit limit cannot be negative',
            },
          ],
        },
      ],
    },
  ],
};

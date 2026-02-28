import { z } from 'zod';

// Pakistani phone number regex: 03xx-xxxxxxx or +92 xxx xxxxxxx
const PAKISTANI_PHONE_REGEX = /^(03\d{9}|\+92\s?\d{10})$/;

// Base customer schema with common fields
const baseCustomerSchema = {
  name: z
    .string()
    .min(1, 'Customer name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  phoneNumber: z.string().min(1, 'Phone number is required'),
  // .refine(
  //   (val) => PAKISTANI_PHONE_REGEX.test(val.replace(/\s|-/g, '')),
  //   { message: 'Please enter a valid Pakistani phone number (03xx-xxxxxxx or +92 xxx xxxxxxx)' }
  // ),

  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
};

// Add Customer Schema
export const addCustomerSchema = z.object({
  ...baseCustomerSchema,

  openingBalance: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: 'Please enter a valid amount',
    })
    .refine(val => !val || parseFloat(val) >= 0, {
      message: 'Opening balance cannot be negative',
    })
    .or(z.literal('')),

  creditPeriodDays: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(parseInt(val)), {
      message: 'Please enter a valid number',
    })
    .refine(val => !val || parseInt(val) >= 0, {
      message: 'Credit period cannot be negative',
    })
    .refine(val => !val || parseInt(val) <= 365, {
      message: 'Credit period cannot exceed 365 days',
    })
    .or(z.literal('')),
});

// Edit Customer Schema - only editable fields
export const editCustomerSchema = z.object({
  ...baseCustomerSchema,

  creditPeriodDays: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(parseInt(val)), {
      message: 'Please enter a valid number',
    })
    .refine(val => !val || parseInt(val) >= 0, {
      message: 'Credit period cannot be negative',
    })
    .refine(val => !val || parseInt(val) <= 365, {
      message: 'Credit period cannot exceed 365 days',
    })
    .or(z.literal('')),
});

// TypeScript types inferred from schemas
export type AddCustomerFormData = z.infer<typeof addCustomerSchema>;
export type EditCustomerFormData = z.infer<typeof editCustomerSchema>;

// Helper function to format phone number
export const formatPhoneNumber = (text: string): string => {
  // Remove non-numeric characters except +
  let cleaned = text.replace(/[^\d+]/g, '');

  // Format for display
  if (cleaned.startsWith('03') && cleaned.length > 4) {
    return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 11);
  } else if (cleaned.startsWith('+92') && cleaned.length > 5) {
    return (
      cleaned.slice(0, 3) +
      ' ' +
      cleaned.slice(3, 6) +
      ' ' +
      cleaned.slice(6, 13)
    );
  }

  return cleaned;
};

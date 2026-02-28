import { z } from 'zod';

// Base product schema with common fields
const baseProductSchema = {
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .trim(),

  sku: z
    .string()
    .max(50, 'SKU must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
};

// Add Product Schema
export const addProductSchema = z.object({
  ...baseProductSchema,

  salePrice: z
    .string()
    .min(1, 'Sale price is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Sale price must be greater than 0',
    }),

  purchasePrice: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: 'Please enter a valid amount',
    })
    .refine(val => !val || parseFloat(val) >= 0, {
      message: 'Purchase price cannot be negative',
    })
    .or(z.literal('')),
});

// Edit Product Schema - only editable fields
export const editProductSchema = z.object({
  ...baseProductSchema,

  salePrice: z
    .string()
    .min(1, 'Sale price is required')
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Sale price must be greater than 0',
    }),

  purchasePrice: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(parseFloat(val)), {
      message: 'Please enter a valid amount',
    })
    .refine(val => !val || parseFloat(val) >= 0, {
      message: 'Purchase price cannot be negative',
    })
    .or(z.literal('')),

  minStockLevel: z
    .string()
    .optional()
    .refine(val => !val || !isNaN(parseInt(val)), {
      message: 'Please enter a valid number',
    })
    .refine(val => !val || parseInt(val) >= 0, {
      message: 'Min stock level cannot be negative',
    })
    .or(z.literal('')),

  isActive: z.boolean(),
});

// TypeScript types inferred from schemas
export type AddProductFormData = z.infer<typeof addProductSchema>;
export type EditProductFormData = z.infer<typeof editProductSchema>;

// Category options
export const CATEGORY_OPTIONS = [
  { label: 'Electronics', value: 'cat_001' },
  { label: 'Cables & Wires', value: 'cat_002' },
  { label: 'Lighting', value: 'cat_003' },
  { label: 'Switches & Sockets', value: 'cat_004' },
  { label: 'Tools', value: 'cat_005' },
  { label: 'Other', value: 'cat_006' },
];

// Unit options
export const UNIT_OPTIONS = [
  { label: 'Piece', value: 'piece' },
  { label: 'Kilogram (kg)', value: 'kg' },
  { label: 'Liter (L)', value: 'liter' },
  { label: 'Meter (m)', value: 'meter' },
  { label: 'Box', value: 'box' },
  { label: 'Carton', value: 'carton' },
  { label: 'Dozen', value: 'dozen' },
  { label: 'Pack', value: 'pack' },
  { label: 'Roll', value: 'roll' },
  { label: 'Set', value: 'set' },
];

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString()}`;
};

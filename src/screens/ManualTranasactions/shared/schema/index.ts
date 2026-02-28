import { z } from 'zod';

// Quantity Price Schema
export const quantityPriceSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative').optional(),
  discount_type: z.enum(['amount', 'percent']).optional(),
});

// Payment Terms Schema (for credit sales)
export const creditTermsSchema = z.object({
  due_date: z.string().min(1, 'Due date is required'),
  credit_limit: z.number().min(0, 'Credit limit cannot be negative').optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export const directTotalSchema = z.object({
  total: z.number().min(1, 'Total amount must be greater than 0'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

export type DirectTotalFormValues = z.infer<typeof directTotalSchema>;

export type QuantityPriceFormValues = z.infer<typeof quantityPriceSchema>;
export type CreditTermsFormValues = z.infer<typeof creditTermsSchema>;

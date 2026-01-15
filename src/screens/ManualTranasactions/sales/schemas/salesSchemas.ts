import { z } from 'zod';

// Common validation patterns
const phonePattern = /^(\+92|0)?[0-9]{10}$/;

// Customer Schema
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'Customer name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine(val => !val || phonePattern.test(val), {
      message: 'Please enter a valid phone number',
    }),
  email: z
    .string()
    .optional()
    .refine(val => !val || z.string().email().safeParse(val).success, {
      message: 'Please enter a valid email address',
    }),
  address: z
    .string()
    .max(200, 'Address must be less than 200 characters')
    .optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  opening_balance: z
    .number()
    .min(0, 'Opening balance cannot be negative')
    .optional(),
});

// Sale Item Schema
export const saleItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
});

// Cart Summary Schema
export const cartSummarySchema = z.object({
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  discount_percent: z
    .number()
    .min(0)
    .max(100, 'Discount cannot exceed 100%')
    .optional(),
  discount_amount: z.number().min(0, 'Discount cannot be negative').optional(),
  tax_percent: z.number().min(0).max(100, 'Tax cannot exceed 100%').optional(),
  tax_amount: z.number().min(0, 'Tax cannot be negative').optional(),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

// Direct Total Schema
export const directTotalSchema = z.object({
  total: z.number().min(1, 'Total amount must be greater than 0'),
  notes: z
    .string()
    .max(500, 'Notes must be less than 500 characters')
    .optional(),
});

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

// Payment Details Schema
export const paymentDetailsSchema = z
  .object({
    payment_status: z.enum(['paid', 'partial', 'pending'], {
      required_error: 'Payment status is required',
    }),
    payment_method: z
      .enum(['Cash', 'Bank Transfer', 'Cheque', 'Credit'])
      .optional()
      .nullable(),
    paid_amount: z.number().min(0, 'Paid amount cannot be negative').optional(),
    due_date: z.string().optional().nullable(),
    bank_name: z.string().optional(),
    cheque_number: z.string().optional(),
    cheque_date: z.string().optional(),
    reference: z
      .string()
      .max(100, 'Reference must be less than 100 characters')
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_status === 'paid' || data.payment_status === 'partial') {
      if (!data.payment_method) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Payment method is required',
          path: ['payment_method'],
        });
      }
    }
    if (data.payment_status === 'partial') {
      if (!data.paid_amount || data.paid_amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Paid amount is required for partial payment',
          path: ['paid_amount'],
        });
      }
    }
    if (
      data.payment_status === 'pending' ||
      data.payment_status === 'partial'
    ) {
      if (!data.due_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Due date is required for credit/partial payment',
          path: ['due_date'],
        });
      }
    }
    if (data.payment_method === 'Bank Transfer' && !data.bank_name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Bank name is required for bank payments',
        path: ['bank_name'],
      });
    }
    if (data.payment_method === 'Cheque') {
      if (!data.cheque_number) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cheque number is required',
          path: ['cheque_number'],
        });
      }
      if (!data.cheque_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cheque date is required',
          path: ['cheque_date'],
        });
      }
    }
  });

// Complete Sale Schema
export const completeSaleSchema = z
  .object({
    customer_id: z.string().optional(), // Optional for walk-in
    is_walk_in: z.boolean().default(false),
    items: z.array(saleItemSchema).optional(),
    direct_total: z.number().optional(),
    is_direct_total_mode: z.boolean().default(false),
    discount_amount: z.number().min(0).default(0),
    tax_amount: z.number().min(0).default(0),
    payment_status: z.enum(['paid', 'partial', 'pending']),
    payment_method: z
      .enum(['cash', 'bank', 'cheque', 'credit'])
      .optional()
      .nullable(),
    paid_amount: z.number().min(0).default(0),
    due_date: z.string().optional().nullable(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Either items or direct total required
    if (
      !data.is_direct_total_mode &&
      (!data.items || data.items.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one item is required',
        path: ['items'],
      });
    }
    if (
      data.is_direct_total_mode &&
      (!data.direct_total || data.direct_total <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total amount is required',
        path: ['direct_total'],
      });
    }
    // Walk-in must be cash
    if (data.is_walk_in && data.payment_status !== 'paid') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Walk-in sales must be paid in full',
        path: ['payment_status'],
      });
    }
  });

// Invoice Confirmation Schema
export const invoiceConfirmationSchema = z.object({
  customer_name: z.string().min(1),
  invoice_number: z.string().min(1),
  date: z.string().min(1),
  total_amount: z.number().min(0),
  payment_status: z.enum(['paid', 'partial', 'pending']),
  payment_method: z.string().optional(),
  due_date: z.string().optional(),
});

// Type exports
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type SaleItemFormValues = z.infer<typeof saleItemSchema>;
export type CartSummaryFormValues = z.infer<typeof cartSummarySchema>;
export type DirectTotalFormValues = z.infer<typeof directTotalSchema>;
export type QuantityPriceFormValues = z.infer<typeof quantityPriceSchema>;
export type CreditTermsFormValues = z.infer<typeof creditTermsSchema>;
export type PaymentDetailsFormValues = z.infer<typeof paymentDetailsSchema>;
export type CompleteSaleFormValues = z.infer<typeof completeSaleSchema>;
export type InvoiceConfirmationFormValues = z.infer<
  typeof invoiceConfirmationSchema
>;

import { z } from 'zod';

// Common validation patterns
const phonePattern = /^(\+92|0)?[0-9]{10}$/;

// Supplier Schema
export const supplierSchema = z.object({
  name: z
    .string()
    .min(1, 'Supplier name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || phonePattern.test(val), {
      message: 'Please enter a valid phone number',
    }),
  email: z
    .string()
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: 'Please enter a valid email address',
    }),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  city: z.string().max(50, 'City must be less than 50 characters').optional(),
  opening_balance: z.number().min(0, 'Opening balance cannot be negative').optional(),
});

// Product Schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  sku: z.string().max(50, 'SKU must be less than 50 characters').optional(),
  barcode: z.string().max(50, 'Barcode must be less than 50 characters').optional(),
  category_id: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  purchase_price: z.number().min(0, 'Purchase price cannot be negative'),
  sale_price: z.number().min(0, 'Sale price cannot be negative'),
  opening_stock: z.number().min(0, 'Opening stock cannot be negative').optional(),
  min_stock_level: z.number().min(0, 'Minimum stock level cannot be negative').optional(),
});

// Purchase Item Schema
export const purchaseItemSchema = z.object({
  product_id: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price cannot be negative'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0),
  tax: z.number().min(0, 'Tax cannot be negative').default(0),
});

// Bill Summary Schema
export const billSummarySchema = z.object({
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required'),
  discount_percent: z.number().min(0).max(100, 'Discount cannot exceed 100%').optional(),
  discount_amount: z.number().min(0, 'Discount cannot be negative').optional(),
  tax_percent: z.number().min(0).max(100, 'Tax cannot exceed 100%').optional(),
  tax_amount: z.number().min(0, 'Tax cannot be negative').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Direct Total Schema
export const directTotalSchema = z.object({
  total: z.number().min(1, 'Total amount must be greater than 0'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Payment Terms Schema
export const paymentTermsSchema = z.object({
  payment_status: z.enum(['paid', 'partial', 'pending'], {
    required_error: 'Payment status is required',
  }),
  payment_method: z
    .enum(['cash', 'bank', 'cheque', 'credit'])
    .optional()
    .nullable(),
  paid_amount: z.number().min(0, 'Paid amount cannot be negative').optional(),
  due_date: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.payment_status === 'paid' || data.payment_status === 'partial') {
    if (!data.payment_method) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Payment method is required for paid/partial status',
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
  if (data.payment_status === 'pending' || data.payment_status === 'partial') {
    if (!data.due_date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Due date is required for pending/partial payment',
        path: ['due_date'],
      });
    }
  }
});

// Full Payment Schema
export const fullPaymentSchema = z.object({
  payment_method: z.enum(['cash', 'bank', 'cheque'], {
    required_error: 'Payment method is required',
  }),
  bank_name: z.string().optional(),
  cheque_number: z.string().optional(),
  cheque_date: z.string().optional(),
  reference: z.string().max(100, 'Reference must be less than 100 characters').optional(),
}).superRefine((data, ctx) => {
  if (data.payment_method === 'bank' && !data.bank_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Bank name is required for bank payments',
      path: ['bank_name'],
    });
  }
  if (data.payment_method === 'cheque') {
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

// Partial Payment Schema
export const partialPaymentSchema = z.object({
  paid_amount: z.number().min(1, 'Paid amount must be greater than 0'),
  payment_method: z.enum(['cash', 'bank', 'cheque'], {
    required_error: 'Payment method is required',
  }),
  due_date: z.string().min(1, 'Due date is required'),
  bank_name: z.string().optional(),
  cheque_number: z.string().optional(),
  cheque_date: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.payment_method === 'bank' && !data.bank_name) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Bank name is required for bank payments',
      path: ['bank_name'],
    });
  }
  if (data.payment_method === 'cheque') {
    if (!data.cheque_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cheque number is required',
        path: ['cheque_number'],
      });
    }
  }
});

// Credit Terms Schema
export const creditTermsSchema = z.object({
  due_date: z.string().min(1, 'Due date is required'),
  credit_limit: z.number().min(0, 'Credit limit cannot be negative').optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

// Complete Purchase Schema
export const completePurchaseSchema = z.object({
  supplier_id: z.string().min(1, 'Supplier is required'),
  items: z.array(purchaseItemSchema).optional(),
  direct_total: z.number().optional(),
  is_direct_total_mode: z.boolean().default(false),
  discount_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  payment_status: z.enum(['paid', 'partial', 'pending']),
  payment_method: z.enum(['cash', 'bank', 'cheque', 'credit']).optional().nullable(),
  paid_amount: z.number().min(0).default(0),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.is_direct_total_mode && (!data.items || data.items.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one item is required',
      path: ['items'],
    });
  }
  if (data.is_direct_total_mode && (!data.direct_total || data.direct_total <= 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Total amount is required',
      path: ['direct_total'],
    });
  }
});

// Type exports
export type SupplierFormValues = z.infer<typeof supplierSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
export type PurchaseItemFormValues = z.infer<typeof purchaseItemSchema>;
export type BillSummaryFormValues = z.infer<typeof billSummarySchema>;
export type DirectTotalFormValues = z.infer<typeof directTotalSchema>;
export type PaymentTermsFormValues = z.infer<typeof paymentTermsSchema>;
export type FullPaymentFormValues = z.infer<typeof fullPaymentSchema>;
export type PartialPaymentFormValues = z.infer<typeof partialPaymentSchema>;
export type CreditTermsFormValues = z.infer<typeof creditTermsSchema>;
export type CompletePurchaseFormValues = z.infer<typeof completePurchaseSchema>;

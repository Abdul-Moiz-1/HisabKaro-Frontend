import { z } from 'zod';

// Payment method enum
export const PaymentMethodEnum = z.enum(['cash', 'bank', 'jazzcash', 'easypaisa']);
export type PaymentMethodType = z.infer<typeof PaymentMethodEnum>;

// Payment type enum
export const PaymentTypeEnum = z.enum(['receive', 'pay']);
export type PaymentTypeType = z.infer<typeof PaymentTypeEnum>;

// Invoice allocation schema
export const invoiceAllocationSchema = z.object({
  invoice_id: z.string().min(1, 'Invoice ID is required'),
  invoice_number: z.string().optional(),
  invoice_amount: z.number().optional(),
  allocated_amount: z.number().min(0, 'Allocation must be positive'),
  is_full_settlement: z.boolean().optional(),
});

export type InvoiceAllocation = z.infer<typeof invoiceAllocationSchema>;

// Main payment form schema
export const paymentSchema = z.object({
  party_id: z.string().min(1, 'Please select a customer or supplier'),
  party_name: z.string().optional(),
  party_type: z.enum(['customer', 'supplier']),
  amount: z
    .number({ required_error: 'Amount is required' })
    .min(1, 'Amount must be greater than 0'),
  method: PaymentMethodEnum,
  bank_account_id: z.string().optional(),
  cheque_number: z.string().optional(),
  cheque_date: z.string().optional(),
  allocations: z.array(invoiceAllocationSchema).optional(),
  auto_allocate: z.boolean().default(true),
  notes: z.string().optional(),
  date: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

// Customer selection schema
export const customerSelectionSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  customer_name: z.string(),
  outstanding_balance: z.number(),
});

export type CustomerSelection = z.infer<typeof customerSelectionSchema>;

// Supplier selection schema
export const supplierSelectionSchema = z.object({
  supplier_id: z.string().min(1, 'Please select a supplier'),
  supplier_name: z.string(),
  payable_balance: z.number(),
});

export type SupplierSelection = z.infer<typeof supplierSelectionSchema>;

// Quick amount options
export const QUICK_AMOUNTS = [
  { label: 'Full Balance', value: 'full' },
  { label: 'Rs. 5,000', value: 5000 },
  { label: 'Rs. 10,000', value: 10000 },
] as const;

// Payment method options with icons
export const PAYMENT_METHODS = [
  { id: 'bank', label: 'Bank', icon: 'bank' as const },
  { id: 'cash', label: 'Cash', icon: 'money' as const },
  { id: 'jazzcash', label: 'JazzCash', icon: 'wallet' as const },
  { id: 'easypaisa', label: 'EasyPaisa', icon: 'wallet' as const },
] as const;

import { z } from 'zod';

// Account type for selection
export const accountSchema = z.object({
  id: z.number(),
  accountCode: z.string(),
  accountName: z.string(),
  accountType: z
    .enum([
      'Cash',
      'Bank',
      'Receivable',
      'Payable',
      'Fixed Asset',
      'Revenue',
      'Expense',
      'Equity',
    ])
    .optional(),
  rootType: z.enum(['Asset', 'Liability', 'Equity', 'Income', 'Expense']),
  currentBalance: z.number().optional(),
  // Bank-specific fields
  bankId: z.number().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  bankLogoUrl: z.string().optional(),
});

export type AccountType = z.infer<typeof accountSchema>;

// Journal entry line item schema
export const journalEntryLineItemSchema = z
  .object({
    accountId: z.number().min(1, 'Please select an account'),
    account: accountSchema.optional(),
    debit: z.number().min(0, 'Debit cannot be negative').default(0),
    credit: z.number().min(0, 'Credit cannot be negative').default(0),
    partyType: z.enum(['Customer', 'Supplier']).optional(),
    partyId: z.number().optional(),
    remarks: z.string().optional(),
  })
  .refine(data => data.debit > 0 || data.credit > 0, {
    message: 'Either debit or credit must be greater than 0',
    path: ['debit'],
  })
  .refine(data => !(data.debit > 0 && data.credit > 0), {
    message: 'Cannot have both debit and credit in same line',
    path: ['credit'],
  });

// Recurring entry frequency type
export const frequencyTypeSchema = z.enum([
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
]);

// Recurring options schema (matches API payload)
export const recurringOptionsSchema = z.object({
  entryName: z.string().min(1, 'Entry name is required'),
  description: z.string().optional(),
  frequencyType: frequencyTypeSchema,
  frequencyInterval: z.number().min(1).default(1),
  dayOfMonth: z.number().min(0).max(31).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  autoGenerate: z.boolean().default(false),
  autoPost: z.boolean().default(false),
  generateDaysBefore: z.number().min(0).default(0),
});

// Main journal entry form schema
export const journalEntrySchema = z
  .object({
    postingDate: z.string().min(1, 'Date is required'),
    lineItems: z
      .array(journalEntryLineItemSchema)
      .min(2, 'At least 2 line items required'),
    referenceNumber: z.string().optional(),
    narration: z.string().optional(),
    makeRecurring: z.boolean().default(false),
    recurringOptions: recurringOptionsSchema.optional(),
  })
  .refine(
    data => {
      const totalDebit = data.lineItems.reduce(
        (sum, item) => sum + (item.debit || 0),
        0,
      );
      const totalCredit = data.lineItems.reduce(
        (sum, item) => sum + (item.credit || 0),
        0,
      );
      return totalDebit === totalCredit;
    },
    { message: 'Total debit must equal total credit', path: ['lineItems'] },
  );

// Types
export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;
export type JournalEntryLineFormValues = z.infer<
  typeof journalEntryLineItemSchema
>;
export type RecurringOptionsFormValues = z.infer<typeof recurringOptionsSchema>;
export type FrequencyType = z.infer<typeof frequencyTypeSchema>;

// Default values for new line item
export const defaultLineItem: Partial<JournalEntryLineFormValues> = {
  accountId: 0,
  debit: 0,
  credit: 0,
  remarks: '',
};

// Default recurring options
export const defaultRecurringOptions: RecurringOptionsFormValues = {
  entryName: '',
  description: '',
  frequencyType: 'monthly',
  frequencyInterval: 1,
  dayOfMonth: 1,
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  autoGenerate: false,
  autoPost: false,
  generateDaysBefore: 0,
};

// Default form values
export const defaultFormValues: Partial<JournalEntryFormValues> = {
  postingDate: new Date().toISOString().split('T')[0],
  lineItems: [
    { accountId: 0, debit: 0, credit: 0 },
    { accountId: 0, debit: 0, credit: 0 },
  ],
  referenceNumber: '',
  narration: '',
  makeRecurring: false,
  recurringOptions: undefined,
};

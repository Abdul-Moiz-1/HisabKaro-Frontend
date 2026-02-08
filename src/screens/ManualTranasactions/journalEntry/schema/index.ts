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

// Recurring entry frequency
export const recurringFrequencySchema = z.enum([
  'weekly',
  'monthly',
  'quarterly',
]);

// Recurring entry execution mode
export const executionModeSchema = z.enum(['remind', 'auto']);

// Recurring entry settings schema
export const recurringEntrySchema = z.object({
  isRecurring: z.boolean().default(false),
  frequency: recurringFrequencySchema.optional(),
  endDate: z.string().optional(),
  occurrences: z.number().min(1).max(365).optional(),
  executionMode: executionModeSchema.optional(),
});

// Main journal entry form schema
export const journalEntrySchema = z
  .object({
    postingDate: z.string().min(1, 'Date is required'),
    lineItems: z
      .array(journalEntryLineItemSchema)
      .min(2, 'At least 2 line items required'),
    narration: z.string().optional(),
    recurring: recurringEntrySchema.optional(),
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
export type RecurringEntryFormValues = z.infer<typeof recurringEntrySchema>;
export type RecurringFrequency = z.infer<typeof recurringFrequencySchema>;
export type ExecutionMode = z.infer<typeof executionModeSchema>;

// Default values for new line item
export const defaultLineItem: Partial<JournalEntryLineFormValues> = {
  accountId: 0,
  debit: 0,
  credit: 0,
  remarks: '',
};

// Default form values
export const defaultFormValues: Partial<JournalEntryFormValues> = {
  postingDate: new Date().toISOString().split('T')[0],
  lineItems: [
    { accountId: 0, debit: 0, credit: 0 },
    { accountId: 0, debit: 0, credit: 0 },
  ],
  narration: '',
  recurring: {
    isRecurring: false,
  },
};

import { z } from 'zod';

export const journalEntryLineItemSchema = z.object({
  accountId: z.number().min(1, 'Quantity must be at least 1'),
  debit: z.number().min(0, 'Unit price cannot be negative').optional(),
  credit: z.number().min(0, 'Discount cannot be negative').optional(),
  remarks: z.string().optional(),
});

export const journalEntrySchema = z.object({
  postingDate: z.string(),
  lineItems: z.array(journalEntryLineItemSchema),
  remarks: z.string().optional(),
});

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>;
export type JournalEntryLineFormValues = z.infer<
  typeof journalEntryLineItemSchema
>;

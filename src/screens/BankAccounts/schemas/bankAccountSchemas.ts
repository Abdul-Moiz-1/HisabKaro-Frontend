import { z } from 'zod';

// Bank/Wallet type options
export const BANK_OPTIONS = [
  { value: 'HBL', label: 'HBL', icon: '🏦' },
  { value: 'Meezan Bank', label: 'Meezan Bank', icon: '🏦' },
  { value: 'UBL', label: 'UBL', icon: '🏦' },
  { value: 'Allied Bank', label: 'Allied Bank', icon: '🏦' },
  { value: 'MCB', label: 'MCB', icon: '🏦' },
  { value: 'Bank Alfalah', label: 'Bank Alfalah', icon: '🏦' },
  { value: 'Faysal Bank', label: 'Faysal Bank', icon: '🏦' },
  { value: 'Askari Bank', label: 'Askari Bank', icon: '🏦' },
  { value: 'Standard Chartered', label: 'Standard Chartered', icon: '🏦' },
  { value: 'Habib Metro', label: 'Habib Metro', icon: '🏦' },
] as const;

export const WALLET_OPTIONS = [
  { value: 'JazzCash', label: 'JazzCash', icon: '📱' },
  { value: 'Easypaisa', label: 'Easypaisa', icon: '📱' },
  { value: 'SadaPay', label: 'SadaPay', icon: '📱' },
  { value: 'NayaPay', label: 'NayaPay', icon: '📱' },
] as const;

export const ACCOUNT_TYPE_OPTIONS = [
  { value: 'savings', label: 'Savings Account' },
  { value: 'current', label: 'Current Account' },
  { value: 'business', label: 'Business Account' },
  { value: 'other', label: 'Mobile Wallet / Other' },
] as const;

// Base schema fields
const baseBankAccountSchema = {
  bankId: z.number().min(1, 'Bank/Wallet is required'),
  accountTitle: z
    .string()
    .min(1, 'Account title is required')
    .min(2, 'Account title must be at least 2 characters')
    .max(100, 'Account title must be less than 100 characters'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .min(5, 'Account number must be at least 5 characters')
    .max(30, 'Account number must be less than 30 characters'),
  accountType: z
    .enum(['savings', 'current', 'business', 'other'])
    .default('savings'),
};

// Add Bank Account Schema
export const addBankAccountSchema = z.object({
  bankId: z.number().min(1, 'Bank/Wallet is required'),
  accountTitle: z
    .string()
    .min(1, 'Account title is required')
    .min(2, 'Account title must be at least 2 characters')
    .max(100, 'Account title must be less than 100 characters'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .min(5, 'Account number must be at least 5 characters')
    .max(30, 'Account number must be less than 30 characters'),
  openingBalance: z
    .string()
    .optional()
    .refine(
      val => !val || !isNaN(parseFloat(val)),
      'Opening balance must be a valid number',
    )
    .refine(
      val => !val || parseFloat(val) >= 0,
      'Opening balance cannot be negative',
    ),
});

// Edit Bank Account Schema (cannot edit account number)
export const editBankAccountSchema = z.object({
  accountTitle: baseBankAccountSchema.accountTitle,
});

// Type exports
export type AddBankAccountFormData = z.infer<typeof addBankAccountSchema>;
export type EditBankAccountFormData = z.infer<typeof editBankAccountSchema>;

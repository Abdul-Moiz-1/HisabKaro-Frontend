// flows/shared/types/flow.types.ts
export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  outstanding: number;
  dueDate: string;
  creditLimit?: number;
  creditPeriod?: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  balance: number;
  accountType: string;
}

export interface FlowData {
  customer?: Customer;
  amount?: number;
  remaining?: number;
  paymentMethod?: string;
  bankAccount?: BankAccount;
  walletType?: string;
  walletAccount?: string;
  transferDate?: string;
  chequeDetails?: any;
  [key: string]: any;
}

// ReceiptFlowContext.tsx - Centralized state management for Receipt Flow (Customer Paid Me)
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Customer } from '../../../../types/flow';

interface BankAccount {
  id: string;
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  accountType: string;
  balance: number;
}

interface ChequeDetails {
  chequeNumber: string;
  chequeDate: string;
  chequeBankName: string;
  chequeStatus: string;
  chequePhoto: any;
}

interface WalletDetails {
  walletType: string;
  walletAccount: string;
  walletDate: string;
}

interface ReceiptFlowData {
  customer: Customer | null;
  amount: number;
  remaining: number;
  paymentMethod: 'cash' | 'bank' | 'wallet' | 'cheque' | 'card' | null;
  bankAccount: BankAccount | null;
  transferDate: string | null;
  walletDetails: WalletDetails | null;
  chequeDetails: ChequeDetails | null;
}

interface ReceiptFlowContextType {
  data: ReceiptFlowData;
  setCustomer: (customer: Customer) => void;
  setAmountInfo: (amount: number, remaining: number) => void;
  setPaymentMethod: (method: 'cash' | 'bank' | 'wallet' | 'cheque' | 'card') => void;
  setBankTransfer: (bankAccount: BankAccount, transferDate: string) => void;
  setWalletPayment: (walletDetails: WalletDetails) => void;
  setChequePayment: (chequeDetails: ChequeDetails) => void;
  getReceiptData: () => {
    customer: Customer | null;
    amount: number;
    remaining: number;
    paymentMethod: string | null;
    paymentDetails: {
      bankAccount?: BankAccount | null;
      transferDate?: string | null;
      walletDetails?: WalletDetails | null;
      chequeDetails?: ChequeDetails | null;
    };
  };
  resetFlow: () => void;
}

const initialData: ReceiptFlowData = {
  customer: null,
  amount: 0,
  remaining: 0,
  paymentMethod: null,
  bankAccount: null,
  transferDate: null,
  walletDetails: null,
  chequeDetails: null,
};

const ReceiptFlowContext = createContext<ReceiptFlowContextType | undefined>(undefined);

export const ReceiptFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ReceiptFlowData>(initialData);

  const setCustomer = useCallback((customer: Customer) => {
    setData(prev => ({ ...prev, customer }));
  }, []);

  const setAmountInfo = useCallback((amount: number, remaining: number) => {
    setData(prev => ({ ...prev, amount, remaining }));
  }, []);

  const setPaymentMethod = useCallback((method: 'cash' | 'bank' | 'wallet' | 'cheque' | 'card') => {
    setData(prev => ({ ...prev, paymentMethod: method }));
  }, []);

  const setBankTransfer = useCallback((bankAccount: BankAccount, transferDate: string) => {
    setData(prev => ({
      ...prev,
      bankAccount,
      transferDate,
    }));
  }, []);

  const setWalletPayment = useCallback((walletDetails: WalletDetails) => {
    setData(prev => ({
      ...prev,
      walletDetails,
    }));
  }, []);

  const setChequePayment = useCallback((chequeDetails: ChequeDetails) => {
    setData(prev => ({
      ...prev,
      chequeDetails,
    }));
  }, []);

  const getReceiptData = useCallback(() => {
    return {
      customer: data.customer,
      amount: data.amount,
      remaining: data.remaining,
      paymentMethod: data.paymentMethod,
      paymentDetails: {
        bankAccount: data.bankAccount,
        transferDate: data.transferDate,
        walletDetails: data.walletDetails,
        chequeDetails: data.chequeDetails,
      },
    };
  }, [data]);

  const resetFlow = useCallback(() => {
    setData(initialData);
  }, []);

  return (
    <ReceiptFlowContext.Provider
      value={{
        data,
        setCustomer,
        setAmountInfo,
        setPaymentMethod,
        setBankTransfer,
        setWalletPayment,
        setChequePayment,
        getReceiptData,
        resetFlow,
      }}
    >
      {children}
    </ReceiptFlowContext.Provider>
  );
};

export const useReceiptFlow = (): ReceiptFlowContextType => {
  const context = useContext(ReceiptFlowContext);
  if (!context) {
    throw new Error('useReceiptFlow must be used within a ReceiptFlowProvider');
  }
  return context;
};

// Optional hook that returns null if context is not available
// Use this for screens that can be shared across different flows
export const useOptionalReceiptFlow = (): ReceiptFlowContextType | null => {
  const context = useContext(ReceiptFlowContext);
  return context || null;
};

export default ReceiptFlowContext;


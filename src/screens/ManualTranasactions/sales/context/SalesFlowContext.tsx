// SalesFlowContext.tsx - Centralized state management for Sales Flow
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Customer } from '../../../../types/flow';

interface Product {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  unit: string;
  salePrice: number;
}

interface CartItem extends Product {
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

interface SalesFlowData {
  customer: Customer | null;
  cart: CartItem[];
  currentProduct: Product | null;
  directTotal: number | null;
  cartTotal: number;
  paymentType: 'cash' | 'credit' | null;
  dueDate: string | null;
  notes: string;
  status: 'paid' | 'pending' | null;
  isReadyForConfirmation: boolean;
  isDirectTotalSet: boolean;
}

interface SalesFlowContextType {
  data: SalesFlowData;
  setCustomer: (customer: Customer) => void;
  setCurrentProduct: (product: Product) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCart: (cart: CartItem[]) => void;
  setDirectTotal: (amount: number) => void;
  setPaymentDetails: (details: {
    paymentType: 'cash' | 'credit';
    dueDate?: string;
    notes?: string;
  }) => void;
  getSaleData: () => {
    saleData: {
      cart: CartItem[];
      directTotal: number | null;
      totalAmount: number;
      paymentType: 'cash' | 'credit' | null;
      dueDate: string | null;
      notes: string;
      status: 'paid' | 'pending' | null;
    };
    customer: Customer | null;
  };
  resetFlow: () => void;
  clearNavigationFlags: () => void;
}

const initialData: SalesFlowData = {
  customer: null,
  cart: [],
  currentProduct: null,
  directTotal: null,
  cartTotal: 0,
  paymentType: null,
  dueDate: null,
  notes: '',
  status: null,
  isReadyForConfirmation: false,
  isDirectTotalSet: false,
};

const SalesFlowContext = createContext<SalesFlowContextType | undefined>(undefined);

export const SalesFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SalesFlowData>(initialData);

  const setCustomer = useCallback((customer: Customer) => {
    setData(prev => ({ ...prev, customer }));
  }, []);

  const setCurrentProduct = useCallback((product: Product) => {
    setData(prev => ({ ...prev, currentProduct: product }));
  }, []);

  const addToCart = useCallback((item: CartItem) => {
    setData(prev => {
      const newCart = [...prev.cart, item];
      const cartTotal = newCart.reduce((sum, cartItem) => sum + cartItem.total, 0);
      return { ...prev, cart: newCart, cartTotal };
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setData(prev => {
      const newCart = prev.cart.filter(item => item.id !== itemId);
      const cartTotal = newCart.reduce((sum, cartItem) => sum + cartItem.total, 0);
      return { ...prev, cart: newCart, cartTotal };
    });
  }, []);

  const updateCart = useCallback((cart: CartItem[]) => {
    setData(prev => {
      const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
      return { ...prev, cart, cartTotal };
    });
  }, []);

  const setDirectTotal = useCallback((amount: number) => {
    setData(prev => ({ ...prev, directTotal: amount, isDirectTotalSet: true }));
  }, []);

  const setPaymentDetails = useCallback((details: {
    paymentType: 'cash' | 'credit';
    dueDate?: string;
    notes?: string;
  }) => {
    setData(prev => ({
      ...prev,
      paymentType: details.paymentType,
      dueDate: details.dueDate || null,
      notes: details.notes || '',
      status: details.paymentType === 'cash' ? 'paid' : 'pending',
      isReadyForConfirmation: true,
    }));
  }, []);

  const clearNavigationFlags = useCallback(() => {
    setData(prev => ({
      ...prev,
      isReadyForConfirmation: false,
      isDirectTotalSet: false,
    }));
  }, []);

  const getSaleData = useCallback(() => {
    const totalAmount = data.cartTotal || data.directTotal || 0;
    return {
      saleData: {
        cart: data.cart,
        directTotal: data.directTotal,
        totalAmount,
        paymentType: data.paymentType,
        dueDate: data.dueDate,
        notes: data.notes,
        status: data.status,
      },
      customer: data.customer,
    };
  }, [data]);

  const resetFlow = useCallback(() => {
    setData(initialData);
  }, []);

  return (
    <SalesFlowContext.Provider
      value={{
        data,
        setCustomer,
        setCurrentProduct,
        addToCart,
        removeFromCart,
        updateCart,
        setDirectTotal,
        setPaymentDetails,
        getSaleData,
        resetFlow,
        clearNavigationFlags,
      }}
    >
      {children}
    </SalesFlowContext.Provider>
  );
};

export const useSalesFlow = (): SalesFlowContextType => {
  const context = useContext(SalesFlowContext);
  if (!context) {
    throw new Error('useSalesFlow must be used within a SalesFlowProvider');
  }
  return context;
};

export default SalesFlowContext;


// shared/hooks/useFlowAdapter.ts
// Centralized flow adapter hooks for reusable screens across Sales, Receipt, Purchase, Payment flows

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { Customer } from '../../../../services/api/customers';
import { Supplier } from '../../../../services/api/suppliers';
import { Product } from '../../../../services/api/products';

// Import Sales slice
import {
  fetchRecentCustomers,
  searchCustomers,
  setSelectedCustomer as setSalesCustomer,
  setWalkInSale,
  selectRecentCustomers,
  selectSalesError,
  selectSelectedCustomer as selectSalesCustomer,
  selectSaleTotals,
  selectSalePaymentDetails,
  setPaymentMethod as setSalesPaymentMethod,
  setSelectedBankAccount as setSalesBankAccount,
  clearError as clearSalesError,
  fetchSalesProducts,
  searchSalesProducts,
  selectSalesProducts,
  selectSaleItems,
  addItem as addSalesItem,
  removeItem as removeSalesItem,
  updateItemQuantity as updateSalesItemQuantity,
  setDirectTotalMode as setSalesDirectTotalMode,
  selectIsWalkInSale,
  setDirectTotal as setCustomerDirectTotal,
  setNotes as setSalesNotes,
  setPaidAmount as setSalesPaidAmount,
  setDueDate as setSalesDueDate,
  setPaymentStatus as setSalesPaymentStatus,
} from '../../../../store/slices/salesSlice';

// Import Receipts slice
import {
  fetchCustomersWithReceivables,
  searchReceiptCustomers,
  setSelectedCustomer as setReceiptCustomer,
  selectCustomersWithReceivables,
  selectReceiptsError,
  selectReceiptCustomer,
  selectReceiptAmount,
  selectRemainingAfterPayment,
  setPaymentMethod as setReceiptPaymentMethod,
  setSelectedBankAccount as setReceiptBankAccount,
  resetReceiptsFlow,
  selectCustomersLoading as selectReceiptCustomersLoading,
  clearError as clearReceiptError,
  setAmount as setRecipteAmount,
  setPaymentDate as setReceiptPaymentDate,
  selectReceiptPaymentDate,
  fetchCustomerPendingInvoices,
  setInvoiceAllocation as setReceiptInvoiceAllocation,
  autoAllocate as autoAllocateReceipts,
  clearAllocations as clearReceiptAllocations,
  selectPendingInvoices,
  selectAllocationSummary,
  selectInvoicesLoading as selectReceiptInvoicesLoading,
  PendingInvoice as PendingReceiptInvoice,
} from '../../../../store/slices/receiptsSlice';

// Import Supplier Payment slice
import {
  fetchSuppliersWithReceivables,
  searchPayableSuppliers,
  setSelectedSupplier as setPaymentSupplier,
  selectSuppliersWithPayables,
  selectPayablesError,
  selectPayableSupplier,
  selectPayableAmount,
  selectRemainingAfterPayment as selectPayableRemainingAfterPayment,
  setPaymentMethod as setPayablePaymentMethod,
  setSelectedBankAccount as setPayableBankAccount,
  resetPayablesFlow,
  selectPayableSuppliersLoading,
  clearError as clearPayableError,
  setAmount as setPayableAmount,
  setPaymentDate as setPayablePaymentDate,
  selectPayablePaymentDate,
  fetchSupplierPendingInvoices,
  setInvoiceAllocation as setPayableInvoiceAllocation,
  autoAllocate as autoAllocatePayables,
  clearAllocations as clearPayableAllocations,
  selectPendingPayableInvoices,
  selectPayableAllocationSummary,
  selectPayableInvoicesLoading,
  PendingInvoice as PendingPayableInvoice,
} from '../../../../store/slices/supplierPayment';

// Import Purchases slice
import {
  fetchRecentSuppliers,
  searchSuppliers,
  setSelectedSupplier,
  selectRecentSuppliers,
  selectPurchasesError,
  selectSelectedSupplier,
  selectPurchaseTotals,
  selectPaymentDetails as selectPurchasePaymentDetails,
  setPaymentMethod as setPurchasePaymentMethod,
  setSelectedBankAccount as setPurchaseBankAccount,
  clearError as clearPurchaseError,
  resetPurchaseFlow,
  fetchRecentProducts as fetchPurchaseProducts,
  searchProducts as searchPurchaseProducts,
  selectRecentProducts as selectPurchaseProducts,
  selectPurchaseItems,
  addItem as addPurchaseItem,
  removeItem as removePurchaseItem,
  updateItemQuantity as updatePurchaseItemQuantity,
  setDirectTotalMode as setPurchaseDirectTotalMode,
  selectIsWalkInPurchase,
  setNotes as setPurchaseNotes,
  setPaidAmount as setPurchasePaidAmount,
  setDueDate as setPuchaseDueDate,
  setPaymentStatus as setPurchasePaymentStatus,
} from '../../../../store/slices/purchasesSlice';

// Import Payment slice
import { FlowType } from '../../../../types/trasactions';

// ============================================
// Customer Selection Flow Adapter
// ============================================

export interface CustomerSelectionConfig {
  // Labels
  screenTitle: string;
  sectionTitle: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptySubtitle: string;
  // Features
  showWalkIn: boolean;
  showOutstandingBadge: boolean;
  showOverdueBadge: boolean;
  filterByReceivables: boolean;
  // Navigation
  nextScreen: string;
}

const customerSelectionConfigs: Record<FlowType, CustomerSelectionConfig> = {
  sales: {
    screenTitle: 'Sold something',
    sectionTitle: 'Recent Customers',
    searchPlaceholder: 'Search by name, phone, or city...',
    emptyTitle: 'No customers yet',
    emptySubtitle: 'Add your first customer to get started',
    showWalkIn: true,
    showOutstandingBadge: true,
    showOverdueBadge: false,
    filterByReceivables: false,
    nextScreen: 'ProductSelection',
  },
  receipt: {
    screenTitle: 'Customer paid me',
    sectionTitle: 'Customers with pending payments',
    searchPlaceholder: 'Search customer name or phone...',
    emptyTitle: 'No Customers Found',
    emptySubtitle: 'No customers with pending payments',
    showWalkIn: false,
    showOutstandingBadge: true,
    showOverdueBadge: true,
    filterByReceivables: true,
    nextScreen: 'AmountEntry',
  },
  purchase: {
    screenTitle: 'Purchased something',
    sectionTitle: 'Recent Suppliers',
    searchPlaceholder: 'Search supplier...',
    emptyTitle: 'No suppliers yet',
    emptySubtitle: 'Add your first supplier to get started',
    showWalkIn: false,
    showOutstandingBadge: true,
    showOverdueBadge: false,
    filterByReceivables: false,
    nextScreen: 'ProductSelection',
  },
  payment: {
    screenTitle: 'I paid supplier',
    sectionTitle: 'Suppliers with pending payments',
    searchPlaceholder: 'Search supplier...',
    emptyTitle: 'No Suppliers Found',
    emptySubtitle: 'No suppliers with pending payments',
    showWalkIn: false,
    showOutstandingBadge: true,
    showOverdueBadge: true,
    filterByReceivables: true,
    nextScreen: 'AmountEntry',
  },
  expense: {
    screenTitle: 'Record Expense',
    sectionTitle: 'Recent Vendors',
    searchPlaceholder: 'Search vendor...',
    emptyTitle: 'No vendors yet',
    emptySubtitle: 'Add your first vendor to get started',
    showWalkIn: false,
    showOutstandingBadge: false,
    showOverdueBadge: false,
    filterByReceivables: false,
    nextScreen: 'AmountEntry',
  },
  transfer: {
    screenTitle: 'Transfer Money',
    sectionTitle: 'Accounts',
    searchPlaceholder: 'Search account...',
    emptyTitle: 'No accounts',
    emptySubtitle: 'Add accounts to transfer between',
    showWalkIn: false,
    showOutstandingBadge: false,
    showOverdueBadge: false,
    filterByReceivables: false,
    nextScreen: 'AmountEntry',
  },
};

export const useCustomerSelectionFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = customerSelectionConfigs[flowType];

  // Select customers based on flow type
  const salesCustomers = useAppSelector(selectRecentCustomers);
  const receiptCustomers = useAppSelector(selectCustomersWithReceivables);
  const salesLoading = useAppSelector(state => state.sales.customersLoading);
  const receiptLoading = useAppSelector(selectReceiptCustomersLoading);
  const salesError = useAppSelector(selectSalesError);
  const receiptError = useAppSelector(selectReceiptsError);

  const customers = useMemo(() => {
    switch (flowType) {
      case 'receipt':
        return receiptCustomers;
      case 'sales':
      default:
        return salesCustomers;
    }
  }, [flowType, salesCustomers, receiptCustomers]);

  const isLoading = useMemo(() => {
    switch (flowType) {
      case 'receipt':
        return receiptLoading;
      case 'sales':
      default:
        return salesLoading;
    }
  }, [flowType, salesLoading, receiptLoading]);

  const error = useMemo(() => {
    switch (flowType) {
      case 'receipt':
        return receiptError;
      case 'sales':
      default:
        return salesError;
    }
  }, [flowType, salesError, receiptError]);

  const fetchCustomers = useCallback(() => {
    switch (flowType) {
      case 'receipt':
        return dispatch(fetchCustomersWithReceivables());
      case 'sales':
      default:
        return dispatch(fetchRecentCustomers());
    }
  }, [flowType, dispatch]);

  const searchCustomersByQuery = useCallback(
    (query: string) => {
      switch (flowType) {
        case 'receipt':
          return dispatch(searchReceiptCustomers(query));
        case 'sales':
        default:
          return dispatch(searchCustomers(query));
      }
    },
    [flowType, dispatch],
  );

  const selectCustomer = useCallback(
    (customer: Customer) => {
      switch (flowType) {
        case 'receipt':
          return dispatch(setReceiptCustomer(customer));
        case 'sales':
        default:
          return dispatch(setSalesCustomer(customer));
      }
    },
    [flowType, dispatch],
  );

  const handleWalkIn = useCallback(() => {
    if (flowType === 'sales') {
      dispatch(setWalkInSale());
    }
  }, [flowType, dispatch]);

  const resetFlow = useCallback(() => {
    switch (flowType) {
      case 'receipt':
        return dispatch(resetReceiptsFlow());
      case 'sales':
      default:
        // Sales flow doesn't have a reset action in same way
        return;
    }
  }, [flowType, dispatch]);

  const clearError = useCallback(() => {
    switch (flowType) {
      case 'receipt':
        return dispatch(clearReceiptError());
      case 'sales':
      default:
        return dispatch(clearSalesError());
    }
  }, [flowType, dispatch]);

  return {
    config,
    customers,
    isLoading,
    error,
    fetchCustomers,
    searchCustomersByQuery,
    selectCustomer,
    handleWalkIn,
    resetFlow,
    clearError,
  };
};

// ============================================
// Supplier Selection Flow Adapter
// ============================================

export interface SupplierSelectionConfig {
  // Labels
  screenTitle: string;
  sectionTitle: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptySubtitle: string;
  addButtonText: string;
  // Features
  showPayableBadge: boolean;
  filterByPayables: boolean;
  // Navigation
  nextScreen: string;
  addSupplierScreen: string;
}

const supplierSelectionConfigs: Record<FlowType, SupplierSelectionConfig> = {
  purchase: {
    screenTitle: 'Bought something',
    sectionTitle: 'Recent Suppliers',
    searchPlaceholder: 'Search by name, phone, or city...',
    emptyTitle: 'No suppliers yet',
    emptySubtitle: 'Add your first supplier to get started',
    addButtonText: 'Add Supplier',
    showPayableBadge: true,
    filterByPayables: false,
    nextScreen: 'ProductSelection',
    addSupplierScreen: 'AddSupplier',
  },
  payment: {
    screenTitle: 'I paid supplier',
    sectionTitle: 'Suppliers with pending payments',
    searchPlaceholder: 'Search supplier...',
    emptyTitle: 'No Suppliers Found',
    emptySubtitle: 'No suppliers with pending payments',
    addButtonText: 'Add Supplier',
    showPayableBadge: true,
    filterByPayables: true,
    nextScreen: 'AmountEntry',
    addSupplierScreen: 'AddSupplier',
  },
  // Other flows don't use supplier selection - provide defaults
  sales: {
    screenTitle: '',
    sectionTitle: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    showPayableBadge: false,
    filterByPayables: false,
    nextScreen: '',
    addSupplierScreen: '',
  },
  receipt: {
    screenTitle: '',
    sectionTitle: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    showPayableBadge: false,
    filterByPayables: false,
    nextScreen: '',
    addSupplierScreen: '',
  },
  expense: {
    screenTitle: '',
    sectionTitle: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    showPayableBadge: false,
    filterByPayables: false,
    nextScreen: '',
    addSupplierScreen: '',
  },
  transfer: {
    screenTitle: '',
    sectionTitle: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    showPayableBadge: false,
    filterByPayables: false,
    nextScreen: '',
    addSupplierScreen: '',
  },
};

export const useSupplierSelectionFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = supplierSelectionConfigs[flowType];

  // Selectors
  const suppliers = useAppSelector(selectRecentSuppliers);
  const suppliersLoading = useAppSelector(
    state => state.purchases.suppliersLoading,
  );
  const error = useAppSelector(selectPurchasesError);

  const fetchSuppliers = useCallback(() => {
    if (flowType == 'payment') {
      return dispatch(fetchRecentSuppliers({ hasPayableDue: true }));
    }
    return dispatch(fetchRecentSuppliers({}));
  }, [dispatch]);

  const searchSuppliersByQuery = useCallback(
    (query: string) => {
      return dispatch(searchSuppliers(query));
    },
    [dispatch],
  );

  const selectSupplier = useCallback(
    (supplier: Supplier) => {
      if (flowType == 'purchase') {
        return dispatch(setSelectedSupplier(supplier));
      }
      return dispatch(setPaymentSupplier(supplier));
    },
    [dispatch],
  );

  const resetFlow = useCallback(() => {
    return dispatch(resetPurchaseFlow());
  }, [dispatch]);

  const clearError = useCallback(() => {
    return dispatch(clearPurchaseError());
  }, [dispatch]);

  return {
    config,
    suppliers,
    isLoading: suppliersLoading,
    error,
    fetchSuppliers,
    searchSuppliersByQuery,
    selectSupplier,
    resetFlow,
    clearError,
  };
};

// ============================================
// Product Selection Flow Adapter
// ============================================

export interface ProductSelectionConfig {
  // Labels
  screenTitle: string;
  partyLabel: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptySubtitle: string;
  addButtonText: string;
  skipButtonText: string;
  // Features
  showQuickAdd: boolean;
  showCart: boolean;
  allowDirectTotal: boolean;
  // Price field to use
  priceField: 'defaultSellingPrice' | 'defaultPurchasingPrice';
  // Navigation
  nextScreen: string;
  cartScreen: string;
  directTotalScreen: string;
  addProductScreen: string;
}

const productSelectionConfigs: Record<FlowType, ProductSelectionConfig> = {
  sales: {
    screenTitle: 'What did you sell?',
    partyLabel: 'Selling to',
    searchPlaceholder: 'Search by name, SKU, or barcode...',
    emptyTitle: 'No products yet',
    emptySubtitle: 'Add your first product to get started',
    addButtonText: 'Add Product',
    skipButtonText: 'Skip products - Enter total directly',
    showQuickAdd: true,
    showCart: true,
    allowDirectTotal: true,
    priceField: 'defaultSellingPrice',
    nextScreen: 'ProductQuantityPrice',
    cartScreen: 'ShoppingCart',
    directTotalScreen: 'DirectTotal',
    addProductScreen: 'AddProduct',
  },
  purchase: {
    screenTitle: 'What did you buy?',
    partyLabel: 'Buying from',
    searchPlaceholder: 'Search by name, SKU, or barcode...',
    emptyTitle: 'No products yet',
    emptySubtitle: 'Add your first product to get started',
    addButtonText: 'Add Product',
    skipButtonText: 'Skip products - Enter total directly',
    showQuickAdd: true,
    showCart: true,
    allowDirectTotal: true,
    priceField: 'defaultPurchasingPrice',
    nextScreen: 'PurchaseQuantityPrice',
    cartScreen: 'PurchaseBillSummary',
    directTotalScreen: 'DirectTotal',
    addProductScreen: 'AddProduct',
  },
  // Other flows don't use product selection
  receipt: {
    screenTitle: '',
    partyLabel: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    skipButtonText: '',
    showQuickAdd: false,
    showCart: false,
    allowDirectTotal: false,
    priceField: 'defaultSellingPrice',
    nextScreen: '',
    cartScreen: '',
    directTotalScreen: '',
    addProductScreen: '',
  },
  payment: {
    screenTitle: '',
    partyLabel: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    skipButtonText: '',
    showQuickAdd: false,
    showCart: false,
    allowDirectTotal: false,
    priceField: 'defaultSellingPrice',
    nextScreen: '',
    cartScreen: '',
    directTotalScreen: '',
    addProductScreen: '',
  },
  expense: {
    screenTitle: '',
    partyLabel: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    skipButtonText: '',
    showQuickAdd: false,
    showCart: false,
    allowDirectTotal: false,
    priceField: 'defaultSellingPrice',
    nextScreen: '',
    cartScreen: '',
    directTotalScreen: '',
    addProductScreen: '',
  },
  transfer: {
    screenTitle: '',
    partyLabel: '',
    searchPlaceholder: '',
    emptyTitle: '',
    emptySubtitle: '',
    addButtonText: '',
    skipButtonText: '',
    showQuickAdd: false,
    showCart: false,
    allowDirectTotal: false,
    priceField: 'defaultSellingPrice',
    nextScreen: '',
    cartScreen: '',
    directTotalScreen: '',
    addProductScreen: '',
  },
};

export const useProductSelectionFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = productSelectionConfigs[flowType];

  // Sales selectors
  const salesCustomer = useAppSelector(selectSalesCustomer);
  const isWalkIn = useAppSelector(selectIsWalkInSale);
  const salesProducts = useAppSelector(selectSalesProducts);
  const salesCartItems = useAppSelector(selectSaleItems);
  const salesProductsLoading = useAppSelector(
    state => state.sales.productsLoading,
  );
  const salesError = useAppSelector(selectSalesError);

  // Purchase selectors
  const purchaseSupplier = useAppSelector(selectSelectedSupplier);
  const purchaseProducts = useAppSelector(selectPurchaseProducts);
  const purchaseCartItems = useAppSelector(selectPurchaseItems);
  const purchaseProductsLoading = useAppSelector(
    state => state.purchases.productsLoading,
  );
  const purchaseError = useAppSelector(selectPurchasesError);

  const { party, partyName, products, cartItems, isLoading, error } =
    useMemo(() => {
      switch (flowType) {
        case 'purchase':
          return {
            party: purchaseSupplier,
            partyName: purchaseSupplier?.name || 'N/A',
            products: purchaseProducts,
            cartItems: purchaseCartItems,
            isLoading: purchaseProductsLoading,
            error: purchaseError,
          };
        case 'sales':
        default:
          return {
            party: salesCustomer,
            partyName: isWalkIn
              ? 'Walk-in Customer'
              : salesCustomer?.name || 'N/A',
            products: salesProducts,
            cartItems: salesCartItems,
            isLoading: salesProductsLoading,
            error: salesError,
          };
      }
    }, [
      flowType,
      salesCustomer,
      isWalkIn,
      salesProducts,
      salesCartItems,
      salesProductsLoading,
      salesError,
      purchaseSupplier,
      purchaseProducts,
      purchaseCartItems,
      purchaseProductsLoading,
      purchaseError,
    ]);

  const fetchProducts = useCallback(() => {
    switch (flowType) {
      case 'purchase':
        return dispatch(fetchPurchaseProducts());
      case 'sales':
      default:
        return dispatch(fetchSalesProducts());
    }
  }, [flowType, dispatch]);

  const searchProductsByQuery = useCallback(
    (query: string) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(searchPurchaseProducts(query));
        case 'sales':
        default:
          return dispatch(searchSalesProducts(query));
      }
    },
    [flowType, dispatch],
  );

  const addItemToCart = useCallback(
    (product: Product, quantity: number = 1, unit_price?: number) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(addPurchaseItem({ product, quantity, unit_price }));
        case 'sales':
        default:
          return dispatch(addSalesItem({ product, quantity, unit_price }));
      }
    },
    [flowType, dispatch],
  );

  const setDirectTotalMode = useCallback(
    (enabled: boolean) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(setPurchaseDirectTotalMode(enabled));
        case 'sales':
        default:
          return dispatch(setSalesDirectTotalMode(enabled));
      }
    },
    [flowType, dispatch],
  );

  const clearFlowError = useCallback(() => {
    switch (flowType) {
      case 'purchase':
        return dispatch(clearPurchaseError());
      case 'sales':
      default:
        return dispatch(clearSalesError());
    }
  }, [flowType, dispatch]);

  return {
    config,
    party,
    partyName,
    products,
    cartItems,
    isLoading,
    error,
    fetchProducts,
    searchProductsByQuery,
    addItemToCart,
    setDirectTotalMode,
    clearError: clearFlowError,
  };
};

// ============================================
// Payment Method Flow Adapter
// ============================================

export interface PaymentMethodConfig {
  // Labels
  questionText: string;
  amountLabel: string;
  partyPrefix: string;
  // Navigation
  cashNextScreen: string;
  bankNextScreen: string;
}

const paymentMethodConfigs: Record<FlowType, PaymentMethodConfig> = {
  sales: {
    questionText: 'How did you receive the payment?',
    amountLabel: 'Total Amount',
    partyPrefix: 'From',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
  receipt: {
    questionText: 'How did the customer pay?',
    amountLabel: 'Amount Received',
    partyPrefix: 'From',
    cashNextScreen: 'InvoiceAllocation',
    bankNextScreen: 'BankSelection',
  },
  purchase: {
    questionText: 'How will you pay?',
    amountLabel: 'Amount to Pay',
    partyPrefix: 'To',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
  payment: {
    questionText: 'How did you pay?',
    amountLabel: 'Amount Paid',
    partyPrefix: 'To',
    cashNextScreen: 'InvoiceAllocation',
    bankNextScreen: 'BankSelection',
  },
  expense: {
    questionText: 'How did you pay?',
    amountLabel: 'Amount Paid',
    partyPrefix: 'To',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
  transfer: {
    questionText: 'Transfer method',
    amountLabel: 'Transfer Amount',
    partyPrefix: 'To',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
};

export const usePaymentMethodFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = paymentMethodConfigs[flowType];

  // Sales selectors
  const salesCustomer = useAppSelector(selectSalesCustomer);
  const salesTotals = useAppSelector(selectSaleTotals);
  const salesPaymentDetails = useAppSelector(selectSalePaymentDetails);

  // Receipt selectors
  const receiptCustomer = useAppSelector(selectReceiptCustomer);
  const receiptAmount = useAppSelector(selectReceiptAmount);
  const remainingAfterPayment = useAppSelector(selectRemainingAfterPayment);

  // Purchase selectors
  const purchaseSupplier = useAppSelector(selectSelectedSupplier);
  const purchaseTotals = useAppSelector(selectPurchaseTotals);
  const purchasePaymentDetails = useAppSelector(selectPurchasePaymentDetails);

  const paymentSupplier = useAppSelector(selectPayableSupplier);
  const paymentTotals = useAppSelector(selectPayableAmount);
  const payableRemainingAfterPayment = useAppSelector(
    selectPayableRemainingAfterPayment,
  );

  const { party, amount, paymentStatus, remainingAmount } = useMemo(() => {
    switch (flowType) {
      case 'receipt':
        return {
          party: receiptCustomer,
          amount: receiptAmount,
          paymentStatus:
            remainingAfterPayment === 0
              ? 'full'
              : remainingAfterPayment < 0
              ? 'advance'
              : 'partial',
          remainingAmount: Math.abs(remainingAfterPayment),
        };
      case 'purchase':
        return {
          party: purchaseSupplier,
          amount: purchaseTotals.grandTotal,
          paymentStatus: purchasePaymentDetails.status,
          remainingAmount: purchasePaymentDetails.remainingAmount,
        };
      case 'payment':
        return {
          party: paymentSupplier,
          amount: paymentTotals,
          paymentStatus:
            payableRemainingAfterPayment === 0
              ? 'full'
              : payableRemainingAfterPayment < 0
              ? 'partial'
              : 'advance',
          remainingAmount: Math.abs(payableRemainingAfterPayment),
        };
      case 'sales':
      default:
        return {
          party: salesCustomer,
          amount:
            salesPaymentDetails.status === 'paid'
              ? salesTotals.grandTotal
              : salesPaymentDetails.paidAmount,
          paymentStatus: salesPaymentDetails.status,
          remainingAmount: salesPaymentDetails.remainingAmount,
        };
    }
  }, [
    flowType,
    salesCustomer,
    salesTotals,
    salesPaymentDetails,
    receiptCustomer,
    receiptAmount,
    remainingAfterPayment,
    purchaseSupplier,
    purchaseTotals,
    purchasePaymentDetails,
  ]);

  const setPaymentMethod = useCallback(
    (method: string) => {
      switch (flowType) {
        case 'receipt':
          return dispatch(setReceiptPaymentMethod(method as any));
        case 'purchase':
          return dispatch(setPurchasePaymentMethod(method as any));
        case 'payment':
          return dispatch(setPayablePaymentMethod(method as any));
        case 'sales':
        default:
          return dispatch(setSalesPaymentMethod(method as any));
      }
    },
    [flowType, dispatch],
  );

  return {
    config,
    party,
    amount,
    paymentStatus,
    remainingAmount,
    setPaymentMethod,
  };
};

// ============================================
// Bank Selection Flow Adapter
// ============================================

export interface BankSelectionConfig {
  title: string;
  subtitle: string;
  amountLabel: string;
  partyPrefix: string;
  nextScreen: string;
}

const bankSelectionConfigs: Record<FlowType, BankSelectionConfig> = {
  sales: {
    title: 'Select Bank Account',
    subtitle: 'Where did you receive the payment?',
    amountLabel: 'Amount to Receive',
    partyPrefix: 'From',
    nextScreen: 'Confirmation',
  },
  receipt: {
    title: 'Select Bank Account',
    subtitle: 'Where did you receive the payment?',
    amountLabel: 'Amount to Receive',
    partyPrefix: 'From',
    nextScreen: 'InvoiceAllocation',
  },
  purchase: {
    title: 'Select Bank Account',
    subtitle: 'Which account to pay from?',
    amountLabel: 'Amount to Pay',
    partyPrefix: 'To',
    nextScreen: 'Confirmation',
  },
  payment: {
    title: 'Select Bank Account',
    subtitle: 'Which account to pay from?',
    amountLabel: 'Amount to Pay',
    partyPrefix: 'To',
    nextScreen: 'InvoiceAllocation',
  },
  expense: {
    title: 'Select Bank Account',
    subtitle: 'Which account to pay from?',
    amountLabel: 'Amount to Pay',
    partyPrefix: 'To',
    nextScreen: 'Confirmation',
  },
  transfer: {
    title: 'Select Source Account',
    subtitle: 'Select account to transfer from',
    amountLabel: 'Transfer Amount',
    partyPrefix: 'To',
    nextScreen: 'DestinationAccount',
  },
};

export const useBankSelectionFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = bankSelectionConfigs[flowType];

  // Sales selectors
  const salesCustomer = useAppSelector(selectSalesCustomer);
  const salesTotals = useAppSelector(selectSaleTotals);
  const salesPaymentDetails = useAppSelector(selectSalePaymentDetails);

  // Receipt selectors
  const receiptCustomer = useAppSelector(selectReceiptCustomer);
  const receiptAmount = useAppSelector(selectReceiptAmount);

  // Purchase selectors
  const purchaseSupplier = useAppSelector(selectSelectedSupplier);
  const purchaseTotals = useAppSelector(selectPurchaseTotals);
  const purchasePaymentDetails = useAppSelector(selectPurchasePaymentDetails);

  const { party, amount } = useMemo(() => {
    switch (flowType) {
      case 'receipt':
        return {
          party: receiptCustomer,
          amount: receiptAmount,
        };
      case 'purchase':
      case 'payment':
        return {
          party: purchaseSupplier,
          amount: purchaseTotals.grandTotal,
        };
      case 'sales':
      default:
        return {
          party: salesCustomer,
          amount:
            salesPaymentDetails.status === 'paid'
              ? salesTotals.grandTotal
              : salesPaymentDetails.paidAmount,
        };
    }
  }, [
    flowType,
    salesCustomer,
    salesTotals,
    salesPaymentDetails,
    receiptCustomer,
    receiptAmount,
    purchaseSupplier,
    purchaseTotals,
    purchasePaymentDetails,
  ]);

  const setBankAccount = useCallback(
    (bankId: number) => {
      switch (flowType) {
        case 'receipt':
          return dispatch(setReceiptBankAccount(bankId));
        case 'purchase':
        case 'payment':
          return dispatch(setPurchaseBankAccount(bankId));
        case 'sales':
        default:
          return dispatch(setSalesBankAccount(bankId));
      }
    },
    [flowType, dispatch],
  );

  return {
    config,
    party,
    amount,
    setBankAccount,
  };
};

// ============================================
// Payment Terms Flow Adapter
// ============================================

export interface PaymentTermsConfig {
  // Labels
  questionText: string;
  amountLabel: string;
  partyPrefix: string;
  // Navigation
  cashNextScreen: string;
  bankNextScreen: string;
}

const paymentTermsConfigs: Record<FlowType, PaymentTermsConfig> = {
  sales: {
    questionText: 'How did you receive the payment?',
    amountLabel: 'Total Amount',
    partyPrefix: 'From',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
  receipt: {
    questionText: 'How did the customer pay?',
    amountLabel: 'Amount Received',
    partyPrefix: 'From',
    cashNextScreen: 'InvoiceAllocation',
    bankNextScreen: 'BankSelection',
  },
  purchase: {
    questionText: 'How will you pay?',
    amountLabel: 'Amount to Pay',
    partyPrefix: 'To',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
  payment: {
    questionText: 'How did you pay?',
    amountLabel: 'Amount Paid',
    partyPrefix: 'To',
    cashNextScreen: 'InvoiceAllocation',
    bankNextScreen: 'BankSelection',
  },
  expense: {
    questionText: 'How did you pay?',
    amountLabel: 'Amount Paid',
    partyPrefix: 'To',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
  transfer: {
    questionText: 'Transfer method',
    amountLabel: 'Transfer Amount',
    partyPrefix: 'To',
    cashNextScreen: 'Confirmation',
    bankNextScreen: 'BankSelection',
  },
};

export const usePaymentTermsFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = paymentTermsConfigs[flowType];

  // Sales selectors
  const salesCustomer = useAppSelector(selectSalesCustomer);
  const salesTotals = useAppSelector(selectSaleTotals);
  const salesPaymentDetails = useAppSelector(selectSalePaymentDetails);
  const salesIsWalkIn = useAppSelector(selectIsWalkInSale);

  // Receipt selectors
  const receiptCustomer = useAppSelector(selectReceiptCustomer);

  // Purchase selectors
  const purchaseSupplier = useAppSelector(selectSelectedSupplier);
  const purchaseTotals = useAppSelector(selectPurchaseTotals);
  const purchasePaymentDetails = useAppSelector(selectPurchasePaymentDetails);
  const purchaseIsWalkIn = useAppSelector(selectIsWalkInPurchase);

  const { party, totals, paymentDetails, isWalkIn } = useMemo(() => {
    switch (flowType) {
      case 'receipt':
        return {
          party: receiptCustomer,
          totals: null,
          paymentDetails: null,
          isWalkIn: false,
        };
      case 'purchase':
      case 'payment':
        return {
          party: purchaseSupplier,
          totals: purchaseTotals,
          paymentDetails: purchasePaymentDetails,
          isWalkIn: purchaseIsWalkIn,
        };
      case 'sales':
      default:
        return {
          party: salesCustomer,
          totals: salesTotals,
          paymentDetails: salesPaymentDetails,

          isWalkIn: salesIsWalkIn,
        };
    }
  }, [
    flowType,
    salesCustomer,
    salesTotals,
    salesPaymentDetails,
    receiptCustomer,
    purchaseSupplier,
    purchaseTotals,
    purchasePaymentDetails,
  ]);

  const setPaymentMethod = useCallback(
    (method: string) => {
      switch (flowType) {
        case 'receipt':
          return dispatch(setReceiptPaymentMethod(method as any));
        case 'purchase':
        case 'payment':
          return dispatch(setPurchasePaymentMethod(method as any));
        case 'sales':
        default:
          return dispatch(setSalesPaymentMethod(method as any));
      }
    },
    [flowType, dispatch],
  );

  const setNotes = useCallback(
    (method: string) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(setPurchaseNotes(method as any));
        case 'sales':
        default:
          return dispatch(setSalesNotes(method as any));
      }
    },
    [flowType, dispatch],
  );

  const setDueDate = useCallback(
    (method: string) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(setPuchaseDueDate(method as any));
        case 'sales':
        default:
          return dispatch(setSalesDueDate(method as any));
      }
    },
    [flowType, dispatch],
  );

  const setPaymentStatus = useCallback(
    (method: string) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(setPurchasePaymentStatus(method as any));
        case 'sales':
        default:
          return dispatch(setSalesPaymentStatus(method as any));
      }
    },
    [flowType, dispatch],
  );
  const setPaidAmount = useCallback(
    (method: number) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(setPurchasePaidAmount(method as any));
        case 'sales':
        default:
          return dispatch(setSalesPaidAmount(method as any));
      }
    },
    [flowType, dispatch],
  );

  return {
    config,
    party,
    totals,
    paymentDetails,
    isWalkIn,
    setNotes,
    setDueDate,
    setPaymentStatus,
    setPaidAmount,
    setPaymentMethod,
  };
};

// ============================================
// Invoice Allocation Flow Adapter (Reconciliation)
// ============================================

export interface InvoiceAllocationConfig {
  // Labels
  title: string;
  partyLabel: string; // "Customer" or "Supplier"
  amountLabel: string; // "Amount Received" or "Amount Paid"
  allocatedLabel: string; // "Allocated" or "Applied"
  unallocatedLabel: string; // "Unallocated" or "Remaining"
  unallocatedWarning: string; // Warning message for unallocated amount
  autoAllocateButtonText: string;
  skipButtonText: string;
  continueButtonText: string;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
  // Navigation
  nextScreen: string;
}

// Union type for pending invoices (both receipt and payment)
export type PendingInvoiceType = PendingReceiptInvoice | PendingPayableInvoice;

type InvoiceAllocationFlowType = Extract<FlowType, 'receipt' | 'payment'>;

const invoiceAllocationConfigs: Record<
  InvoiceAllocationFlowType,
  InvoiceAllocationConfig
> = {
  receipt: {
    title: 'Allocate Payment',
    partyLabel: 'Customer',
    amountLabel: 'Amount Received',
    allocatedLabel: 'Allocated',
    unallocatedLabel: 'Unallocated',
    unallocatedWarning: 'will be recorded as advance payment',
    autoAllocateButtonText: 'Auto-Allocate',
    skipButtonText: 'Skip Allocation',
    continueButtonText: 'Continue',
    emptyStateTitle: 'No Pending Invoices',
    emptyStateSubtitle: 'This customer has no outstanding invoices',
    nextScreen: 'Review',
  },
  payment: {
    title: 'Allocate Payment',
    partyLabel: 'Supplier',
    amountLabel: 'Amount Paid',
    allocatedLabel: 'Applied',
    unallocatedLabel: 'Remaining',
    unallocatedWarning: 'will be recorded as advance payment',
    autoAllocateButtonText: 'Auto-Allocate',
    skipButtonText: 'Skip Allocation',
    continueButtonText: 'Continue',
    emptyStateTitle: 'No Pending Invoices',
    emptyStateSubtitle: 'This supplier has no outstanding invoices',
    nextScreen: 'Review',
  },
};

export const useInvoiceAllocationFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();

  // Get config for current flow
  const config = useMemo(() => {
    if (flowType === 'receipt' || flowType === 'payment') {
      return invoiceAllocationConfigs[flowType];
    }
    // Default to receipt config for unsupported flows
    return invoiceAllocationConfigs['receipt'];
  }, [flowType]);

  // Select data based on flow type
  const receiptCustomer = useAppSelector(selectReceiptCustomer);
  const receiptAmount = useAppSelector(selectReceiptAmount);
  const receiptPendingInvoices = useAppSelector(selectPendingInvoices);
  const receiptAllocationSummary = useAppSelector(selectAllocationSummary);
  const receiptInvoicesLoading = useAppSelector(selectReceiptInvoicesLoading);

  const paymentSupplier = useAppSelector(selectPayableSupplier);
  const paymentAmount = useAppSelector(selectPayableAmount);
  const paymentPendingInvoices = useAppSelector(selectPendingPayableInvoices);
  const paymentAllocationSummary = useAppSelector(
    selectPayableAllocationSummary,
  );
  const paymentInvoicesLoading = useAppSelector(selectPayableInvoicesLoading);

  // Memoize return values based on flow type
  const party = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return paymentSupplier;
      case 'receipt':
      default:
        return receiptCustomer;
    }
  }, [flowType, receiptCustomer, paymentSupplier]);

  const amount = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return paymentAmount;
      case 'receipt':
      default:
        return receiptAmount;
    }
  }, [flowType, receiptAmount, paymentAmount]);

  const pendingInvoices = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return paymentPendingInvoices;
      case 'receipt':
      default:
        return receiptPendingInvoices;
    }
  }, [flowType, receiptPendingInvoices, paymentPendingInvoices]);

  const allocationSummary = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return paymentAllocationSummary;
      case 'receipt':
      default:
        return receiptAllocationSummary;
    }
  }, [flowType, receiptAllocationSummary, paymentAllocationSummary]);

  const isLoading = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return paymentInvoicesLoading;
      case 'receipt':
      default:
        return receiptInvoicesLoading;
    }
  }, [flowType, receiptInvoicesLoading, paymentInvoicesLoading]);

  // Fetch pending invoices
  const fetchPendingInvoices = useCallback(
    (partyId: string) => {
      switch (flowType) {
        case 'payment':
          return dispatch(fetchSupplierPendingInvoices(partyId));
        case 'receipt':
        default:
          return dispatch(fetchCustomerPendingInvoices(partyId));
      }
    },
    [flowType, dispatch],
  );

  // Set invoice allocation
  const setInvoiceAllocation = useCallback(
    (payload: { invoiceId: number; amount: number }) => {
      switch (flowType) {
        case 'payment':
          return dispatch(setPayableInvoiceAllocation(payload));
        case 'receipt':
        default:
          return dispatch(setReceiptInvoiceAllocation(payload));
      }
    },
    [flowType, dispatch],
  );

  // Auto-allocate
  const autoAllocate = useCallback(() => {
    switch (flowType) {
      case 'payment':
        return dispatch(autoAllocatePayables());
      case 'receipt':
      default:
        return dispatch(autoAllocateReceipts());
    }
  }, [flowType, dispatch]);

  // Clear allocations
  const clearAllocations = useCallback(() => {
    switch (flowType) {
      case 'payment':
        return dispatch(clearPayableAllocations());
      case 'receipt':
      default:
        return dispatch(clearReceiptAllocations());
    }
  }, [flowType, dispatch]);

  return {
    config,
    party,
    amount,
    pendingInvoices,
    allocationSummary,
    isLoading,
    fetchPendingInvoices,
    setInvoiceAllocation,
    autoAllocate,
    clearAllocations,
  };
};

// ============================================
// Shopping Cart Flow Adapter
// ============================================

export interface ShoppingCartConfig {
  // Labels
  screenTitle: string;
  emptyCartTitle: string;
  emptyCartSubtitle: string;
  emptyCartButtonText: string;
  partyLabel: string;
  itemsLabel: string;
  totalLabel: string;
  continueButtonText: string;
  // Navigation
  nextScreen: string;
  addMoreScreen: string;
}

const shoppingCartConfigs: Record<string, ShoppingCartConfig> = {
  sales: {
    screenTitle: 'Shopping Cart',
    emptyCartTitle: 'Your cart is empty',
    emptyCartSubtitle: 'Add products to create a sale',
    emptyCartButtonText: 'Add Products',
    partyLabel: 'Customer',
    itemsLabel: 'Items',
    totalLabel: 'Total',
    continueButtonText: 'Continue to Payment',
    nextScreen: 'PaymentMethod',
    addMoreScreen: 'ProductSelection',
  },
  purchase: {
    screenTitle: 'Purchase Cart',
    emptyCartTitle: 'Your cart is empty',
    emptyCartSubtitle: 'Add products to create a purchase',
    emptyCartButtonText: 'Add Products',
    partyLabel: 'Supplier',
    itemsLabel: 'Items',
    totalLabel: 'Total',
    continueButtonText: 'Continue to Payment',
    nextScreen: 'PaymentMethod',
    addMoreScreen: 'ProductSelection',
  },
};

export const useShoppingCartFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();

  // Configuration
  const config = useMemo(() => {
    return shoppingCartConfigs[flowType] || shoppingCartConfigs.sales;
  }, [flowType]);

  // Party (Customer or Supplier)
  const salesCustomer = useAppSelector(selectSalesCustomer);
  const purchaseSupplier = useAppSelector(selectSelectedSupplier);
  const salesIsWalkIn = useAppSelector(selectIsWalkInSale);
  const purchaseIsWalkIn = useAppSelector(selectIsWalkInPurchase);

  const party = useMemo(() => {
    switch (flowType) {
      case 'purchase':
        return purchaseSupplier;
      case 'sales':
      default:
        return salesCustomer;
    }
  }, [flowType, salesCustomer, purchaseSupplier]);

  const isWalkIn = useMemo(() => {
    switch (flowType) {
      case 'purchase':
        return purchaseIsWalkIn;
      case 'sales':
      default:
        return salesIsWalkIn;
    }
  }, [flowType, salesIsWalkIn, purchaseIsWalkIn]);

  // Cart items
  const salesItems = useAppSelector(selectSaleItems);
  const purchaseItems = useAppSelector(selectPurchaseItems);

  const cartItems = useMemo(() => {
    switch (flowType) {
      case 'purchase':
        return purchaseItems;
      case 'sales':
      default:
        return salesItems;
    }
  }, [flowType, salesItems, purchaseItems]);

  // Totals
  const salesTotals = useAppSelector(selectSaleTotals);
  const purchaseTotals = useAppSelector(selectPurchaseTotals);

  const totals = useMemo(() => {
    switch (flowType) {
      case 'purchase':
        return purchaseTotals;
      case 'sales':
      default:
        return salesTotals;
    }
  }, [flowType, salesTotals, purchaseTotals]);

  // Remove item action
  const removeItem = useCallback(
    (productId: number) => {
      switch (flowType) {
        case 'purchase':
          dispatch(removePurchaseItem(productId));
          break;
        case 'sales':
        default:
          dispatch(removeSalesItem(productId));
          break;
      }
    },
    [flowType, dispatch],
  );

  // Update item quantity action
  const updateItemQuantity = useCallback(
    (payload: { productId: number; quantity: number }) => {
      switch (flowType) {
        case 'purchase':
          dispatch(updatePurchaseItemQuantity(payload));
          break;
        case 'sales':
        default:
          dispatch(updateSalesItemQuantity(payload));
          break;
      }
    },
    [flowType, dispatch],
  );

  return {
    config,
    party,
    isWalkIn,
    cartItems,
    totals,
    removeItem,
    updateItemQuantity,
  };
};

// ============================================
// Amount Entry Flow Adapter
// ============================================

export interface AmountEntryConfig {
  // Labels
  screenTitle: string;
  infoLabel: string; // "{name} owes you:" or "You owe {name}:"
  questionLabel: string; // "How much did {name} pay?" or "How much are you paying?"
  amountLabel: string;
  remainingLabel: string;
  advanceLabel: string;
  advanceWarning: string;
  fullPaymentMessage: string;
  continueButtonText: string;
  // Navigation
  nextScreen: string;
}

const amountEntryConfigs: Record<string, AmountEntryConfig> = {
  receipt: {
    screenTitle: 'Receive Payment',
    infoLabel: 'owes you:',
    questionLabel: 'How much did {name} pay?',
    amountLabel: 'Amount Received',
    remainingLabel: 'Remaining after payment:',
    advanceLabel: 'Advance amount:',
    advanceWarning:
      'Amount exceeds outstanding balance. PKR {amount} will be recorded as advance payment.',
    fullPaymentMessage: 'Full payment - Account will be cleared',
    continueButtonText: 'Continue',
    nextScreen: 'PaymentMethod',
  },
  payment: {
    screenTitle: 'Make Payment',
    infoLabel: 'You owe:',
    questionLabel: 'How much are you paying {name}?',
    amountLabel: 'Amount Paid',
    remainingLabel: 'Remaining after payment:',
    advanceLabel: 'Advance amount:',
    advanceWarning:
      'Amount exceeds payable balance. PKR {amount} will be recorded as advance payment.',
    fullPaymentMessage: 'Full payment - Account will be cleared',
    continueButtonText: 'Continue',
    nextScreen: 'PaymentMethod',
  },
};

export const useAmountEntryFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();

  // Configuration
  const config = useMemo(() => {
    return amountEntryConfigs[flowType] || amountEntryConfigs.receipt;
  }, [flowType]);

  // Party (Customer or Supplier)
  const receiptCustomer = useAppSelector(selectReceiptCustomer);
  const payableSupplier = useAppSelector(selectPayableSupplier);

  console.log(payableSupplier);
  console.log(receiptCustomer);

  const party = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return payableSupplier;
      case 'receipt':
      default:
        return receiptCustomer;
    }
  }, [flowType, receiptCustomer, payableSupplier]);

  // Get party name
  const partyName = useMemo(() => {
    return party?.name || 'Unknown';
  }, [party]);

  // Balance (Outstanding for receipt, Payable for payment)
  const balance = useMemo(() => {
    if (!party) return 0;

    switch (flowType) {
      case 'payment':
        // Supplier has payable_balance or totalPayable
        // @ts-ignore
        return party.totalPayable || party.payable_balance || 0;
      case 'receipt':
      default:
        // Customer has outstanding_balance or totalOutstanding
        // @ts-ignore
        return party.totalOutstanding || party.outstanding_balance || 0;
    }
  }, [flowType, party]);

  // Payment date
  const receiptPaymentDate = useAppSelector(selectReceiptPaymentDate);
  const payablePaymentDate = useAppSelector(selectPayablePaymentDate);

  const paymentDate = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return payablePaymentDate;
      case 'receipt':
      default:
        return receiptPaymentDate;
    }
  }, [flowType, receiptPaymentDate, payablePaymentDate]);

  // Stored amount
  const receiptAmount = useAppSelector(selectReceiptAmount);
  const payableAmount = useAppSelector(selectPayableAmount);

  const storedAmount = useMemo(() => {
    switch (flowType) {
      case 'payment':
        return payableAmount;
      case 'receipt':
      default:
        return receiptAmount;
    }
  }, [flowType, receiptAmount, payableAmount]);

  // Set amount action
  const setAmount = useCallback(
    (amount: number) => {
      switch (flowType) {
        case 'payment':
          dispatch(setPayableAmount(amount));
          break;
        case 'receipt':
        default:
          dispatch(setRecipteAmount(amount));
          break;
      }
    },
    [flowType, dispatch],
  );

  // Set payment date action
  const setPaymentDate = useCallback(
    (date: string) => {
      switch (flowType) {
        case 'payment':
          dispatch(setPayablePaymentDate(date));
          break;
        case 'receipt':
        default:
          dispatch(setReceiptPaymentDate(date));
          break;
      }
    },
    [flowType, dispatch],
  );

  // Format labels with party name
  const getInfoLabel = useCallback(() => {
    return `${partyName} ${config.infoLabel}`;
  }, [partyName, config.infoLabel]);

  const getQuestionLabel = useCallback(() => {
    return config.questionLabel.replace('{name}', partyName);
  }, [partyName, config.questionLabel]);

  const getAdvanceWarning = useCallback(
    (advanceAmount: number) => {
      return config.advanceWarning.replace(
        '{amount}',
        advanceAmount.toLocaleString(),
      );
    },
    [config.advanceWarning],
  );

  return {
    config,
    party,
    partyName,
    balance,
    storedAmount,
    paymentDate,
    setAmount,
    setPaymentDate,
    getInfoLabel,
    getQuestionLabel,
    getAdvanceWarning,
  };
};

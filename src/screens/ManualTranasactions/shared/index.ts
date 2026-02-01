// shared/index.ts
// Export all reusable shared screens and hooks for Sales, Receipt, Purchase, Payment flows

export {
  useDirectTotalSelectionFlow,
  type DirectTotalConfig,
} from './hooks/useDirectTotalFlow';

// Reusable screens
export { default as AmountEntryScreen } from './AmountEntryScreen';
export { default as CustomerSelectionScreen } from './CustomerSelectionScreen';
export { default as ProductSelectionScreen } from './ProductSelectionScreen';
export { default as PaymentMethodScreen } from './PaymentMethodScreen';
export { default as BankSelectionScreen } from './BankSelectionScreen';
export { default as ChequeDetailsScreen } from './ChequeDetailsScreen';
// export { default as WalletSelectionScreen } from './WalletSelectionScreen';
export { default as AddBankAccountScreen } from './AddBankAccountScreen';
export { default as DirectTotalScreen } from './DirectTotalScreen';
export { default as PaymentTermScreen } from './PaymentTermScreen';
export { default as ProductQuantityPriceScreen } from './ProductQuantityPriceScreen';
export { default as SupplierSelectionScreen } from './SupplierSelectionScreen';
export { default as InvoiceAllocationScreen } from './InvoiceAllocationScreen';
export { default as ShoppingCartScreen } from './ShoppingCartScreen';

// Flow adapter hooks
export {
  // Customer/Supplier selection hooks
  useCustomerSelectionFlow,
  useSupplierSelectionFlow,
  // Product selection hook
  useProductSelectionFlow,
  // Payment hooks
  usePaymentMethodFlow,
  useBankSelectionFlow,
  usePaymentTermsFlow,
  // Invoice allocation hook (reconciliation)
  useInvoiceAllocationFlow,
  // Shopping cart hook
  useShoppingCartFlow,
  // Amount entry hook
  useAmountEntryFlow,
  // Types
  type CustomerSelectionConfig,
  type SupplierSelectionConfig,
  type ProductSelectionConfig,
  type PaymentMethodConfig,
  type BankSelectionConfig,
  type PaymentTermsConfig,
  type InvoiceAllocationConfig,
  type PendingInvoiceType,
  type ShoppingCartConfig,
  type AmountEntryConfig,
} from './hooks/useFlowAdapter';

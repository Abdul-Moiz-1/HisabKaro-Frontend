import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { suppliersApi, Supplier } from '../../services/api/suppliers';
import {
  paymentsApi,
  PayPaymentPayload,
  PaymentResponse,
  InvoiceAllocation,
  PaymentMode,
} from '../../services/api/payments';
import { purchaseInvoicesApi } from '../../services/api/invoices';
import type { RootState } from '../index';

// Types
export interface PendingInvoice {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  isOverdue: boolean;
  allocatedAmount: number; // Amount allocated in this receipt
}

interface SupplierPaymentFlowState {
  // Selected supplier
  selectedSupplier: Supplier | null;

  // Amount details
  amount: number;
  remainingAfterPayment: number;

  // Payment method
  paymentMethod: PaymentMode | null;
  selectedBankAccountId: number | null;

  // Invoice allocations
  pendingInvoices: PendingInvoice[];
  invoiceAllocations: InvoiceAllocation[];
  totalAllocated: number;
  unallocatedAmount: number;
  isAutoAllocated: boolean;

  // Notes
  notes: string;

  // Result
  paymentResponse: PaymentResponse | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // supplier list
  suppliersWithReceivables: Supplier[];
  suppliersLoading: boolean;

  // Invoices loading
  invoicesLoading: boolean;
}

const initialState: SupplierPaymentFlowState = {
  selectedSupplier: null,
  amount: 0,
  remainingAfterPayment: 0,
  paymentMethod: null,
  selectedBankAccountId: null,
  pendingInvoices: [],
  invoiceAllocations: [],
  totalAllocated: 0,
  unallocatedAmount: 0,
  isAutoAllocated: false,
  notes: '',
  paymentResponse: null,
  isLoading: false,
  isSaving: false,
  error: null,
  suppliersWithReceivables: [],
  suppliersLoading: false,
  invoicesLoading: false,
};

// Helper function to calculate allocation totals
const calculateAllocationTotals = (state: SupplierPaymentFlowState) => {
  state.totalAllocated = state.invoiceAllocations.reduce(
    (sum, alloc) => sum + alloc.allocatedAmount,
    0,
  );
  state.unallocatedAmount = state.amount - state.totalAllocated;
};

// Auto-allocate function - FIFO (oldest invoices first)
const autoAllocateInvoices = (
  pendingInvoices: PendingInvoice[],
  amount: number,
): { allocations: InvoiceAllocation[]; updatedInvoices: PendingInvoice[] } => {
  const allocations: InvoiceAllocation[] = [];
  let remainingAmount = amount;

  // Sort by due date (oldest first), then by invoice date
  const sortedInvoices = [...pendingInvoices].sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate) : new Date(a.invoiceDate);
    const dateB = b.dueDate ? new Date(b.dueDate) : new Date(b.invoiceDate);
    return dateA.getTime() - dateB.getTime();
  });

  const updatedInvoices = sortedInvoices.map(invoice => {
    if (remainingAmount <= 0) {
      return { ...invoice, allocatedAmount: 0 };
    }

    const allocateAmount = Math.min(remainingAmount, invoice.outstandingAmount);
    remainingAmount -= allocateAmount;

    if (allocateAmount > 0) {
      allocations.push({
        invoiceId: invoice.id,
        allocatedAmount: allocateAmount,
      });
    }

    return { ...invoice, allocatedAmount: allocateAmount };
  });

  return { allocations, updatedInvoices };
};

// Async Thunks
export const fetchSuppliersWithReceivables = createAsyncThunk<
  Supplier[],
  void,
  { rejectValue: string }
>('receipts/fetchSuppliersWithReceivables', async (_, { rejectWithValue }) => {
  try {
    const suppliers = await suppliersApi.getWithPayables();
    // console.log(suppliers);
    return suppliers;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch suppliers');
  }
});

export const searchPayableSuppliers = createAsyncThunk<
  Supplier[],
  string,
  { rejectValue: string }
>('receipts/searchSuppliers', async (query, { rejectWithValue }) => {
  try {
    const suppliers = await suppliersApi.search(query, 20);
    // Filter to show only suppliers with outstanding balance
    return suppliers.filter(c => c.payable_balance > 0);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to search suppliers');
  }
});

export const fetchSupplierPendingInvoices = createAsyncThunk<
  PendingInvoice[],
  string,
  { rejectValue: string }
>(
  'supplierPayment/fetchPendingInvoices',
  async (supplierId, { rejectWithValue }) => {
    try {
      const response = await purchaseInvoicesApi.getAll({
        supplierId: Number(supplierId),
        isPendingOnly: true,
      });

      const today = new Date().toISOString().split('T')[0];

      return response.data.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        paidAmount: invoice.paidAmount,
        outstandingAmount: invoice.outstandingAmount,
        isOverdue: invoice.dueDate ? invoice.dueDate < today : false,
        allocatedAmount: 0,
      }));
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to fetch pending invoices',
      );
    }
  },
);

export const submitPayablePayment = createAsyncThunk<
  PaymentResponse,
  void,
  { rejectValue: string; state: RootState }
>('supplierPayment/submitPayment', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().supplierPayment;

    if (!state.selectedSupplier) {
      throw new Error('Please select a supplier');
    }

    if (state.amount <= 0) {
      throw new Error('Please enter a valid amount');
    }

    if (!state.paymentMethod) {
      throw new Error('Please select a payment method');
    }

    const payload: PayPaymentPayload = {
      supplierId: Number(state.selectedSupplier.id),
      paidAmount: state.amount,
      paymentMode: state.paymentMethod,
      bankAccountId: state.selectedBankAccountId || undefined,
      paymentDate: new Date().toISOString().split('T')[0],
      invoiceAllocations:
        state.invoiceAllocations.length > 0
          ? state.invoiceAllocations.map(inv => ({
              invoiceId: inv.invoiceId,
              allocatedAmount: inv.allocatedAmount,
            }))
          : undefined,
      notes: state.notes || undefined,
    };

    const result = await paymentsApi.pay(payload);
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to submit payment');
  }
});

// Slice
const supplierPaymentSlice = createSlice({
  name: 'supplierPayment',
  initialState,
  reducers: {
    // Supplier selection
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload;
      // Reset payment details when supplier changes
      state.pendingInvoices = [];
      state.invoiceAllocations = [];
      state.totalAllocated = 0;
      state.isAutoAllocated = false;
    },

    // Amount
    setAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
      state.remainingAfterPayment =
        (state.selectedSupplier?.payable_balance || 0) - action.payload;

      // Recalculate allocations if auto-allocated
      if (state.isAutoAllocated && state.pendingInvoices.length > 0) {
        const { allocations, updatedInvoices } = autoAllocateInvoices(
          state.pendingInvoices.map(inv => ({ ...inv, allocatedAmount: 0 })),
          action.payload,
        );
        state.invoiceAllocations = allocations;
        state.pendingInvoices = updatedInvoices;
      }

      calculateAllocationTotals(state);
    },

    // Payment method
    setPaymentMethod: (state, action: PayloadAction<PaymentMode | null>) => {
      state.paymentMethod = action.payload;
      // Clear bank selection if not bank transfer
      if (action.payload !== 'Bank') {
        state.selectedBankAccountId = null;
      }
    },

    setSelectedBankAccount: (state, action: PayloadAction<number | null>) => {
      state.selectedBankAccountId = action.payload;
    },

    // Invoice allocations
    setInvoiceAllocation: (
      state,
      action: PayloadAction<{ invoiceId: number; amount: number }>,
    ) => {
      const { invoiceId, amount } = action.payload;

      // Update pending invoice allocated amount
      const invoiceIndex = state.pendingInvoices.findIndex(
        inv => inv.id === invoiceId,
      );
      if (invoiceIndex >= 0) {
        state.pendingInvoices[invoiceIndex].allocatedAmount = amount;
      }

      // Update or create allocation
      const existingIndex = state.invoiceAllocations.findIndex(
        alloc => alloc.invoiceId === invoiceId,
      );

      if (amount > 0) {
        const invoice = state.pendingInvoices.find(inv => inv.id === invoiceId);
        const allocation: InvoiceAllocation = {
          invoiceId,
          allocatedAmount: amount,
        };

        if (existingIndex >= 0) {
          state.invoiceAllocations[existingIndex] = allocation;
        } else {
          state.invoiceAllocations.push(allocation);
        }
      } else if (existingIndex >= 0) {
        state.invoiceAllocations.splice(existingIndex, 1);
      }

      state.isAutoAllocated = false;
      calculateAllocationTotals(state);
    },

    // Auto-allocate
    autoAllocate: state => {
      if (state.pendingInvoices.length === 0 || state.amount <= 0) {
        return;
      }

      const { allocations, updatedInvoices } = autoAllocateInvoices(
        state.pendingInvoices.map(inv => ({ ...inv, allocatedAmount: 0 })),
        state.amount,
      );

      state.invoiceAllocations = allocations;
      state.pendingInvoices = updatedInvoices;
      state.isAutoAllocated = true;
      calculateAllocationTotals(state);
    },

    // Clear allocations
    clearAllocations: state => {
      state.invoiceAllocations = [];
      state.pendingInvoices = state.pendingInvoices.map(inv => ({
        ...inv,
        allocatedAmount: 0,
      }));
      state.totalAllocated = 0;
      state.unallocatedAmount = state.amount;
      state.isAutoAllocated = false;
    },

    // Notes
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
    },

    // Clear error
    clearError: state => {
      state.error = null;
    },

    // Reset entire flow
    resetPayablesFlow: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch suppliers with receivables
      .addCase(fetchSuppliersWithReceivables.pending, state => {
        state.suppliersLoading = true;
        state.error = null;
      })
      .addCase(fetchSuppliersWithReceivables.fulfilled, (state, action) => {
        state.suppliersLoading = false;
        state.suppliersWithReceivables = action.payload;
      })
      .addCase(fetchSuppliersWithReceivables.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.error = action.payload || 'Failed to fetch suppliers';
      })

      // Search suppliers
      .addCase(searchPayableSuppliers.pending, state => {
        state.suppliersLoading = true;
      })
      .addCase(searchPayableSuppliers.fulfilled, (state, action) => {
        state.suppliersLoading = false;
        state.suppliersWithReceivables = action.payload;
      })
      .addCase(searchPayableSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.error = action.payload || 'Failed to search suppliers';
      })

      // Fetch pending invoices
      .addCase(fetchSupplierPendingInvoices.pending, state => {
        state.invoicesLoading = true;
        state.error = null;
      })
      .addCase(fetchSupplierPendingInvoices.fulfilled, (state, action) => {
        state.invoicesLoading = false;
        state.pendingInvoices = action.payload;
      })
      .addCase(fetchSupplierPendingInvoices.rejected, (state, action) => {
        state.invoicesLoading = false;
        state.error = action.payload || 'Failed to fetch invoices';
      })

      // Submit payment
      .addCase(submitPayablePayment.pending, state => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(submitPayablePayment.fulfilled, (state, action) => {
        state.isSaving = false;
        state.paymentResponse = action.payload;
      })
      .addCase(submitPayablePayment.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to submit payment';
      });
  },
});

export const {
  setSelectedSupplier,
  setAmount,
  setPaymentMethod,
  setSelectedBankAccount,
  setInvoiceAllocation,
  autoAllocate,
  clearAllocations,
  setNotes,
  clearError,
  resetPayablesFlow,
} = supplierPaymentSlice.actions;

// Selectors
export const selectPayableSupplier = (state: RootState) =>
  state.supplierPayment.selectedSupplier;
export const selectPayableAmount = (state: RootState) =>
  state.supplierPayment.amount;
export const selectRemainingAfterPayment = (state: RootState) =>
  state.supplierPayment.remainingAfterPayment;
export const selectPayablePaymentMethod = (state: RootState) =>
  state.supplierPayment.paymentMethod;
export const selectPayableBankAccountId = (state: RootState) =>
  state.supplierPayment.selectedBankAccountId;
export const selectPendingPayableInvoices = (state: RootState) =>
  state.supplierPayment.pendingInvoices;
export const selectPayableInvoiceAllocations = (state: RootState) =>
  state.supplierPayment.invoiceAllocations;
export const selectPayableAllocationSummary = (state: RootState) => ({
  totalAllocated: state.supplierPayment.totalAllocated,
  unallocatedAmount: state.supplierPayment.unallocatedAmount,
  isAutoAllocated: state.supplierPayment.isAutoAllocated,
});
export const selectSuppliersWithPayables = (state: RootState) =>
  state.supplierPayment.suppliersWithReceivables;
export const selectPayablesLoading = (state: RootState) =>
  state.supplierPayment.isLoading || state.supplierPayment.isSaving;
export const selectPayablesError = (state: RootState) =>
  state.supplierPayment.error;
export const selectPayablePaymentResponse = (state: RootState) =>
  state.supplierPayment.paymentResponse;
export const selectPayableSuppliersLoading = (state: RootState) =>
  state.supplierPayment.suppliersLoading;
export const selectPayableInvoicesLoading = (state: RootState) =>
  state.supplierPayment.invoicesLoading;

export default supplierPaymentSlice.reducer;

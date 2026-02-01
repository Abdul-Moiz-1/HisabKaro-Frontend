import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { customersApi, Customer } from '../../services/api/customers';
import {
  paymentsApi,
  ReceivePaymentPayload,
  PaymentResponse,
  InvoiceAllocation,
  PaymentMode,
} from '../../services/api/payments';
import { salesInvoicesApi, Invoice } from '../../services/api/invoices';
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

interface ReceiptsFlowState {
  // Selected customer
  selectedCustomer: Customer | null;

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

  // Customer list
  customersWithReceivables: Customer[];
  customersLoading: boolean;

  // Invoices loading
  invoicesLoading: boolean;
}

const initialState: ReceiptsFlowState = {
  selectedCustomer: null,
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
  customersWithReceivables: [],
  customersLoading: false,
  invoicesLoading: false,
};

// Helper function to calculate allocation totals
const calculateAllocationTotals = (state: ReceiptsFlowState) => {
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
        invoiceNumber: invoice.invoiceNumber,
        allocatedAmount: allocateAmount,
        previousOutstanding: invoice.outstandingAmount,
        newOutstanding: invoice.outstandingAmount - allocateAmount,
      });
    }

    return { ...invoice, allocatedAmount: allocateAmount };
  });

  return { allocations, updatedInvoices };
};

// Async Thunks
export const fetchCustomersWithReceivables = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>('receipts/fetchCustomersWithReceivables', async (_, { rejectWithValue }) => {
  try {
    const customers = await customersApi.getWithReceivables();
    // console.log(customers);
    return customers;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch customers');
  }
});

export const searchReceiptCustomers = createAsyncThunk<
  Customer[],
  string,
  { rejectValue: string }
>('receipts/searchCustomers', async (query, { rejectWithValue }) => {
  try {
    const customers = await customersApi.search(query, 20);
    // Filter to show only customers with outstanding balance
    return customers.filter(c => c.outstanding_balance > 0);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to search customers');
  }
});

export const fetchCustomerPendingInvoices = createAsyncThunk<
  PendingInvoice[],
  string,
  { rejectValue: string }
>('receipts/fetchPendingInvoices', async (customerId, { rejectWithValue }) => {
  try {
    const response = await salesInvoicesApi.getAll({
      customerId: Number(customerId),
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
    return rejectWithValue(error.message || 'Failed to fetch pending invoices');
  }
});

export const submitReceiptPayment = createAsyncThunk<
  PaymentResponse,
  void,
  { rejectValue: string; state: RootState }
>('receipts/submitPayment', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().receipts;

    if (!state.selectedCustomer) {
      throw new Error('Please select a customer');
    }

    if (state.amount <= 0) {
      throw new Error('Please enter a valid amount');
    }

    if (!state.paymentMethod) {
      throw new Error('Please select a payment method');
    }

    const payload: ReceivePaymentPayload = {
      customerId: Number(state.selectedCustomer.id),
      paidAmount: state.amount,
      paymentMode: state.paymentMethod,
      bankAccountId: state.selectedBankAccountId || undefined,
      paymentDate: new Date().toISOString().split('T')[0],
      invoiceAllocations:
        state.invoiceAllocations.length > 0
          ? state.invoiceAllocations.map(invoice => {
              return {
                invoiceId: invoice.invoiceId,
                allocatedAmount: invoice.allocatedAmount,
              };
            })
          : undefined,
      notes: state.notes || undefined,
    };

    const result = await paymentsApi.receive(payload);
    return result.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to submit payment');
  }
});

// Slice
const receiptsSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    // Customer selection
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
      // Reset payment details when customer changes
      state.pendingInvoices = [];
      state.invoiceAllocations = [];
      state.totalAllocated = 0;
      state.isAutoAllocated = false;
    },

    // Amount
    setAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
      state.remainingAfterPayment =
        (state.selectedCustomer?.totalOutstanding || 0) - action.payload;

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
          invoiceNumber: invoice?.invoiceNumber,
          allocatedAmount: amount,
          previousOutstanding: invoice?.outstandingAmount || 0,
          newOutstanding: (invoice?.outstandingAmount || 0) - amount,
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
    resetReceiptsFlow: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch customers with receivables
      .addCase(fetchCustomersWithReceivables.pending, state => {
        state.customersLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomersWithReceivables.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customersWithReceivables = action.payload;
      })
      .addCase(fetchCustomersWithReceivables.rejected, (state, action) => {
        state.customersLoading = false;
        state.error = action.payload || 'Failed to fetch customers';
      })

      // Search customers
      .addCase(searchReceiptCustomers.pending, state => {
        state.customersLoading = true;
      })
      .addCase(searchReceiptCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.customersWithReceivables = action.payload;
      })
      .addCase(searchReceiptCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.error = action.payload || 'Failed to search customers';
      })

      // Fetch pending invoices
      .addCase(fetchCustomerPendingInvoices.pending, state => {
        state.invoicesLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerPendingInvoices.fulfilled, (state, action) => {
        state.invoicesLoading = false;
        state.pendingInvoices = action.payload;
      })
      .addCase(fetchCustomerPendingInvoices.rejected, (state, action) => {
        state.invoicesLoading = false;
        state.error = action.payload || 'Failed to fetch invoices';
      })

      // Submit payment
      .addCase(submitReceiptPayment.pending, state => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(submitReceiptPayment.fulfilled, (state, action) => {
        state.isSaving = false;
        state.paymentResponse = action.payload;
      })
      .addCase(submitReceiptPayment.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to submit payment';
      });
  },
});

export const {
  setSelectedCustomer,
  setAmount,
  setPaymentMethod,
  setSelectedBankAccount,
  setInvoiceAllocation,
  autoAllocate,
  clearAllocations,
  setNotes,
  clearError,
  resetReceiptsFlow,
} = receiptsSlice.actions;

// Selectors
export const selectReceiptCustomer = (state: RootState) =>
  state.receipts.selectedCustomer;
export const selectReceiptAmount = (state: RootState) => state.receipts.amount;
export const selectRemainingAfterPayment = (state: RootState) =>
  state.receipts.remainingAfterPayment;
export const selectReceiptPaymentMethod = (state: RootState) =>
  state.receipts.paymentMethod;
export const selectReceiptBankAccountId = (state: RootState) =>
  state.receipts.selectedBankAccountId;
export const selectPendingInvoices = (state: RootState) =>
  state.receipts.pendingInvoices;
export const selectInvoiceAllocations = (state: RootState) =>
  state.receipts.invoiceAllocations;
export const selectAllocationSummary = (state: RootState) => ({
  totalAllocated: state.receipts.totalAllocated,
  unallocatedAmount: state.receipts.unallocatedAmount,
  isAutoAllocated: state.receipts.isAutoAllocated,
});
export const selectCustomersWithReceivables = (state: RootState) =>
  state.receipts.customersWithReceivables;
export const selectReceiptsLoading = (state: RootState) =>
  state.receipts.isLoading || state.receipts.isSaving;
export const selectReceiptsError = (state: RootState) => state.receipts.error;
export const selectPaymentResponse = (state: RootState) =>
  state.receipts.paymentResponse;
export const selectCustomersLoading = (state: RootState) =>
  state.receipts.customersLoading;
export const selectInvoicesLoading = (state: RootState) =>
  state.receipts.invoicesLoading;

export default receiptsSlice.reducer;

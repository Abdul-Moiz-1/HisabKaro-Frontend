import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  customersApi,
  Customer,
  WALK_IN_CUSTOMER,
} from '../../services/api/customers';
import { productsApi, Product } from '../../services/api/products';
import {
  salesInvoicesApi,
  Invoice,
  CreateSalesInvoicePayload,
  InvoiceItem,
  PaymentStatus,
  PaymentMethod,
} from '../../services/api/invoices';

// Types
export interface SaleItem {
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
}

interface SalesFlowState {
  // Selected customer
  selectedCustomer: Customer | null;
  isWalkInSale: boolean;

  // Products in cart
  items: SaleItem[];

  // Bill details
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  taxPercent: number;
  grandTotal: number;

  // Direct total entry mode
  isDirectTotalMode: boolean;
  directTotal: number;

  // Payment details
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  selectedBankAccountId: number | null;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;

  // Notes
  notes: string;

  // Invoice reference
  invoiceNumber: string | null;
  createdInvoice: Invoice | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Customer & Product lists
  recentCustomers: Customer[];
  customersLoading: boolean;
  recentProducts: Product[];
  productsLoading: boolean;
}

const initialState: SalesFlowState = {
  selectedCustomer: null,
  isWalkInSale: false,
  items: [],
  subtotal: 0,
  discountAmount: 0,
  discountPercent: 0,
  taxAmount: 0,
  taxPercent: 0,
  grandTotal: 0,
  isDirectTotalMode: false,
  directTotal: 0,
  paymentStatus: 'paid', // Default to cash sale
  paymentMethod: 'Cash',
  selectedBankAccountId: null,
  paidAmount: 0,
  remainingAmount: 0,
  dueDate: null,
  notes: '',
  invoiceNumber: null,
  createdInvoice: null,
  isLoading: false,
  isSaving: false,
  error: null,
  recentCustomers: [],
  customersLoading: false,
  recentProducts: [],
  productsLoading: false,
};

// Helper function to calculate totals
const calculateTotals = (state: SalesFlowState) => {
  if (state.isDirectTotalMode) {
    state.grandTotal = state.directTotal;
    state.subtotal = state.directTotal;
    state.remainingAmount = state.grandTotal - state.paidAmount;
    return;
  }

  state.subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
  state.discountAmount =
    state.discountPercent > 0
      ? (state.subtotal * state.discountPercent) / 100
      : state.discountAmount;
  const afterDiscount = state.subtotal - state.discountAmount;
  state.taxAmount =
    state.taxPercent > 0
      ? (afterDiscount * state.taxPercent) / 100
      : state.taxAmount;
  state.grandTotal = afterDiscount + state.taxAmount;
  state.remainingAmount = state.grandTotal - state.paidAmount;

  // Update paid amount for cash sales
  if (state.paymentStatus === 'paid') {
    state.paidAmount = state.grandTotal;
    state.remainingAmount = 0;
  }
};

// Async Thunks
export const fetchRecentCustomers = createAsyncThunk<
  Customer[],
  void,
  { rejectValue: string }
>('sales/fetchRecentCustomers', async (_, { rejectWithValue }) => {
  try {
    const customers = await customersApi.getRecent(10);
    return customers;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch customers');
  }
});

export const searchCustomers = createAsyncThunk<
  Customer[],
  string,
  { rejectValue: string }
>('sales/searchCustomers', async (query, { rejectWithValue }) => {
  try {
    const customers = await customersApi.search(query, 20);
    return customers;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to search customers');
  }
});

export const createCustomer = createAsyncThunk<
  Customer,
  Parameters<typeof customersApi.create>[0],
  { rejectValue: string }
>('sales/createCustomer', async (payload, { rejectWithValue }) => {
  try {
    const customer = await customersApi.create(payload);
    return customer;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create customer');
  }
});

export const fetchSalesProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('sales/fetchProducts', async (_, { rejectWithValue }) => {
  try {
    const { data: response } = await productsApi.getAll({
      includeInactive: false,
      limit: 20,
    });
    console.log(response);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch products');
  }
});

export const searchSalesProducts = createAsyncThunk<
  Product[],
  string,
  { rejectValue: string }
>('sales/searchProducts', async (query, { rejectWithValue }) => {
  try {
    const products = await productsApi.search(query, 20);
    return products;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to search products');
  }
});

export const scanProductBarcode = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('sales/scanBarcode', async (barcode, { rejectWithValue }) => {
  try {
    const product = await productsApi.getByBarcode(barcode);
    return product;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Product not found');
  }
});

export const createSalesInvoice = createAsyncThunk<
  Invoice,
  void,
  { rejectValue: string; state: { sales: SalesFlowState } }
>('sales/createInvoice', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().sales;

    if (!state.selectedCustomer && !state.isWalkInSale) {
      throw new Error('Please select a customer');
    }

    if (!state.isDirectTotalMode && state.items.length === 0) {
      throw new Error('Please add at least one item');
    }

    // Prepare items matching the API structure
    const invoiceItems: Omit<
      InvoiceItem,
      'id' | 'amount' | 'netAmount' | 'itemName'
    >[] = state.isDirectTotalMode
      ? null!
      : state.items.map(item => ({
          productId: Number(item.product_id),
          quantity: item.quantity,
          rate: item.unit_price,
          discountAmount: item.discount,
        }));

    const directAmount = state.isDirectTotalMode ? state.directTotal : null;
    const amountReceived =
      state.paymentStatus == 'partial' ? state.paidAmount : null;
    const customerId = state.isWalkInSale
      ? undefined
      : state.selectedCustomer?.id;

    if (!customerId && !state.isWalkInSale) {
      throw new Error('Customer ID is required for non walk-in sales');
    }
    const creditDays = state.dueDate
      ? Math.floor(
          (new Date(state.dueDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24),
        )
      : null;
    const payload: CreateSalesInvoicePayload = {
      customerId: customerId ? Number(customerId) : 0,
      isWalkIn: state.isWalkInSale, // Use 0 for walk-in
      items: invoiceItems,
      discountAmount: state.discountAmount,
      directAmount,

      paymentMethod: state.paymentMethod,
      bankAccountId: state.selectedBankAccountId,
      amountReceived: amountReceived,
      creditDays: creditDays,
      remarks: state.notes || undefined,
    };
    console.log(payload);

    const result = await salesInvoicesApi.create(payload);
    const invoice = result.data;
    // const invoice = payload;

    // Update stock for each item (reduce stock for sales)
    // if (!state.isDirectTotalMode) {
    //   for (const item of state.items) {
    //     try {
    //       await productsApi.adjustStock(
    //         item.product_id,
    //         'out',
    //         item.quantity,
    //         `Sale ${invoice.invoiceNumber}`,
    //       );
    //     } catch (stockError) {
    //       console.warn(
    //         `Failed to adjust stock for product ${item.product_id}:`,
    //         stockError,
    //       );
    //       // Continue even if stock adjustment fails
    //     }
    //   }
    // }

    return invoice;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create sales invoice');
  }
});

// Slice
const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    // Customer selection
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload;
      state.isWalkInSale = action.payload?.is_walk_in || false;
    },

    setWalkInSale: state => {
      state.selectedCustomer = WALK_IN_CUSTOMER;
      state.isWalkInSale = true;
      // Walk-in sales are always cash
      state.paymentStatus = 'paid';
      state.paymentMethod = 'Cash';
    },

    // Product management
    addItem: (
      state,
      action: PayloadAction<{
        product: Product;
        quantity: number;
        unit_price?: number;
      }>,
    ) => {
      const { product, quantity, unit_price } = action.payload;
      const price = unit_price ?? Number(product.defaultSellingPrice);

      const existingIndex = state.items.findIndex(
        item => item.product_id === product.id,
      );

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
        state.items[existingIndex].total =
          state.items[existingIndex].quantity *
          state.items[existingIndex].unit_price;
      } else {
        state.items.push({
          product_id: product.id,
          product,
          quantity,
          unit_price: price,
          discount: 0,
          tax: 0,
          total: quantity * price,
        });
      }

      calculateTotals(state);
    },

    updateItemQuantity: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find(i => i.product_id === productId);
      if (item) {
        item.quantity = quantity;
        item.total = quantity * item.unit_price - item.discount + item.tax;
        calculateTotals(state);
      }
    },

    updateItemPrice: (
      state,
      action: PayloadAction<{ productId: string; price: number }>,
    ) => {
      const { productId, price } = action.payload;
      const item = state.items.find(i => i.product_id === productId);
      if (item) {
        item.unit_price = price;
        item.total = item.quantity * price - item.discount + item.tax;
        calculateTotals(state);
      }
    },

    updateItemDiscount: (
      state,
      action: PayloadAction<{ productId: string; discount: number }>,
    ) => {
      const { productId, discount } = action.payload;
      const item = state.items.find(i => i.product_id === productId);
      if (item) {
        item.discount = discount;
        item.total = item.quantity * item.unit_price - discount + item.tax;
        calculateTotals(state);
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        item => item.product_id !== action.payload,
      );
      calculateTotals(state);
    },

    clearItems: state => {
      state.items = [];
      calculateTotals(state);
    },

    // Direct total mode
    setDirectTotalMode: (state, action: PayloadAction<boolean>) => {
      state.isDirectTotalMode = action.payload;
      if (action.payload) {
        state.items = [];
      }
      calculateTotals(state);
    },

    setDirectTotal: (state, action: PayloadAction<number>) => {
      state.directTotal = action.payload;
      calculateTotals(state);
    },

    // Discount & Tax
    setDiscountPercent: (state, action: PayloadAction<number>) => {
      state.discountPercent = action.payload;
      state.discountAmount = 0;
      calculateTotals(state);
    },

    setDiscountAmount: (state, action: PayloadAction<number>) => {
      state.discountAmount = action.payload;
      state.discountPercent = 0;
      calculateTotals(state);
    },

    setTaxPercent: (state, action: PayloadAction<number>) => {
      state.taxPercent = action.payload;
      state.taxAmount = 0;
      calculateTotals(state);
    },

    setTaxAmount: (state, action: PayloadAction<number>) => {
      state.taxAmount = action.payload;
      state.taxPercent = 0;
      calculateTotals(state);
    },

    // Payment
    setPaymentStatus: (state, action: PayloadAction<PaymentStatus>) => {
      state.paymentStatus = action.payload;
      if (action.payload === 'paid') {
        state.paidAmount = state.grandTotal;
        state.remainingAmount = 0;
        state.paymentMethod = state.paymentMethod || 'Cash';
      } else if (action.payload === 'pending') {
        state.paidAmount = 0;
        state.remainingAmount = state.grandTotal;
      }
    },

    setPaymentMethod: (state, action: PayloadAction<PaymentMethod | null>) => {
      state.paymentMethod = action.payload;
      // if (action.payload === 'Cash') {
      //   state.paymentStatus = 'pending';
      //   state.paidAmount = 0;
      //   state.remainingAmount = state.grandTotal;
      // }
      // Clear bank selection if not bank transfer
      if (action.payload !== 'Bank') {
        state.selectedBankAccountId = null;
      }
    },

    setSelectedBankAccount: (state, action: PayloadAction<number | null>) => {
      state.selectedBankAccountId = action.payload;
    },

    setPaidAmount: (state, action: PayloadAction<number>) => {
      state.paidAmount = action.payload;
      state.remainingAmount = state.grandTotal - action.payload;

      if (action.payload === 0) {
        state.paymentStatus = 'pending';
      } else if (action.payload >= state.grandTotal) {
        state.paymentStatus = 'paid';
        state.paidAmount = state.grandTotal;
        state.remainingAmount = 0;
      } else {
        state.paymentStatus = 'partial';
      }
    },

    setDueDate: (state, action: PayloadAction<string | null>) => {
      state.dueDate = action.payload;
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
    resetSalesFlow: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch recent customers
      .addCase(fetchRecentCustomers.pending, state => {
        state.customersLoading = true;
      })
      .addCase(fetchRecentCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.recentCustomers = action.payload;
      })
      .addCase(fetchRecentCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.error = action.payload || 'Failed to fetch customers';
      })

      // Search customers
      .addCase(searchCustomers.pending, state => {
        state.customersLoading = true;
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.customersLoading = false;
        state.recentCustomers = action.payload;
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.customersLoading = false;
        state.error = action.payload || 'Failed to search customers';
      })

      // Create customer
      .addCase(createCustomer.pending, state => {
        state.isSaving = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isSaving = false;
        state.selectedCustomer = action.payload;
        state.recentCustomers.unshift(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to create customer';
      })

      // Fetch products
      .addCase(fetchSalesProducts.pending, state => {
        state.productsLoading = true;
      })
      .addCase(fetchSalesProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.recentProducts = action.payload;
      })
      .addCase(fetchSalesProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || 'Failed to fetch products';
      })

      // Search products
      .addCase(searchSalesProducts.pending, state => {
        state.productsLoading = true;
      })
      .addCase(searchSalesProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.recentProducts = action.payload;
      })
      .addCase(searchSalesProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || 'Failed to search products';
      })

      // Scan barcode
      .addCase(scanProductBarcode.fulfilled, (state, action) => {
        const product = action.payload;
        const existingIndex = state.items.findIndex(
          item => item.product_id === product.id,
        );

        if (existingIndex >= 0) {
          state.items[existingIndex].quantity += 1;
          state.items[existingIndex].total =
            state.items[existingIndex].quantity *
            state.items[existingIndex].unit_price;
        } else {
          state.items.push({
            product_id: product.id,
            product,
            quantity: 1,
            unit_price: product.sale_price,
            discount: 0,
            tax: 0,
            total: product.sale_price,
          });
        }

        calculateTotals(state);
      })
      .addCase(scanProductBarcode.rejected, (state, action) => {
        state.error = action.payload || 'Product not found';
      })

      // Create invoice
      .addCase(createSalesInvoice.pending, state => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createSalesInvoice.fulfilled, (state, action) => {
        state.isSaving = false;
        state.createdInvoice = action.payload;
        state.invoiceNumber = action.payload.invoiceNumber;
      })
      .addCase(createSalesInvoice.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to create invoice';
      });
  },
});

export const {
  setSelectedCustomer,
  setWalkInSale,
  addItem,
  updateItemQuantity,
  updateItemPrice,
  updateItemDiscount,
  removeItem,
  clearItems,
  setDirectTotalMode,
  setDirectTotal,
  setDiscountPercent,
  setDiscountAmount,
  setTaxPercent,
  setTaxAmount,
  setPaymentStatus,
  setPaymentMethod,
  setSelectedBankAccount,
  setPaidAmount,
  setDueDate,
  setNotes,
  clearError,
  resetSalesFlow,
} = salesSlice.actions;

// Selectors
export const selectSelectedCustomer = (state: { sales: SalesFlowState }) =>
  state.sales.selectedCustomer;
export const selectIsWalkInSale = (state: { sales: SalesFlowState }) =>
  state.sales.isWalkInSale;
export const selectSaleItems = (state: { sales: SalesFlowState }) =>
  state.sales.items;
export const selectSaleTotals = (state: { sales: SalesFlowState }) => ({
  subtotal: state.sales.subtotal,
  discount: state.sales.discountAmount,
  tax: state.sales.taxAmount,
  grandTotal: state.sales.grandTotal,
});
export const selectSalePaymentDetails = (state: { sales: SalesFlowState }) => ({
  status: state.sales.paymentStatus,
  method: state.sales.paymentMethod,
  selectedBankAccountId: state.sales.selectedBankAccountId,
  paidAmount: state.sales.paidAmount,
  remainingAmount: state.sales.remainingAmount,
  dueDate: state.sales.dueDate,
});
export const selectSelectedBankAccountId = (state: { sales: SalesFlowState }) =>
  state.sales.selectedBankAccountId;
export const selectRecentCustomers = (state: { sales: SalesFlowState }) =>
  state.sales.recentCustomers;
export const selectSalesProducts = (state: { sales: SalesFlowState }) =>
  state.sales.recentProducts;
export const selectSalesLoading = (state: { sales: SalesFlowState }) =>
  state.sales.isLoading || state.sales.isSaving;
export const selectSalesError = (state: { sales: SalesFlowState }) =>
  state.sales.error;
export const selectCreatedSalesInvoice = (state: { sales: SalesFlowState }) =>
  state.sales.createdInvoice;

export default salesSlice.reducer;

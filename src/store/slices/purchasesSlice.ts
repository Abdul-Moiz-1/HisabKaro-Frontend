import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { suppliersApi, Supplier } from '../../services/api/suppliers';
import { productsApi, Product } from '../../services/api/products';
import {
  invoicesApi,
  Invoice,
  InvoiceItem,
  CreateSalesInvoicePayload,
  CreatePurchaseInvoicePayload,
} from '../../services/api/invoices';

// Types
export interface PurchaseItem {
  product_id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  total: number;
}

export type PaymentStatus = 'paid' | 'partial' | 'pending';
export type PaymentMethod = 'Cash' | 'Bank' | 'Credit';

interface PurchaseFlowState {
  // Selected supplier
  selectedSupplier: Supplier | null;

  isWalkIn: boolean;

  // Products in cart
  items: PurchaseItem[];

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
  paidAmount: number;
  remainingAmount: number;
  dueDate: string | null;
  selectedBankAccountId: number | null;

  // Notes
  notes: string;

  // Invoice reference
  invoiceNumber: string | null;
  createdInvoice: Invoice | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Supplier & Product lists
  recentSuppliers: Supplier[];
  suppliersLoading: boolean;
  recentProducts: Product[];
  productsLoading: boolean;
}

const initialState: PurchaseFlowState = {
  isWalkIn: false,
  selectedSupplier: null,
  items: [],
  subtotal: 0,
  discountAmount: 0,
  discountPercent: 0,
  taxAmount: 0,
  taxPercent: 0,
  grandTotal: 0,
  isDirectTotalMode: false,
  directTotal: 0,
  paymentStatus: 'pending',
  paymentMethod: null,
  paidAmount: 0,
  remainingAmount: 0,
  dueDate: null,
  selectedBankAccountId: null,
  notes: '',
  invoiceNumber: null,
  createdInvoice: null,
  isLoading: false,
  isSaving: false,
  error: null,
  recentSuppliers: [],
  suppliersLoading: false,
  recentProducts: [],
  productsLoading: false,
};

// Helper function to calculate totals
const calculateTotals = (state: PurchaseFlowState) => {
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
};

// Async Thunks
export const fetchRecentSuppliers = createAsyncThunk<
  Supplier[],
  { hasPayableDue?: boolean },
  { rejectValue: string }
>(
  'purchases/fetchRecentSuppliers',
  async ({ hasPayableDue }, { rejectWithValue }) => {
    try {
      const suppliers = await suppliersApi.getRecent(10, hasPayableDue);
      return suppliers;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch suppliers');
    }
  },
);

export const searchSuppliers = createAsyncThunk<
  Supplier[],
  string,
  { rejectValue: string }
>('purchases/searchSuppliers', async (query, { rejectWithValue }) => {
  try {
    const suppliers = await suppliersApi.search(query, 20);
    return suppliers;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to search suppliers');
  }
});

export const createSupplier = createAsyncThunk<
  Supplier,
  Parameters<typeof suppliersApi.create>[0],
  { rejectValue: string }
>('purchases/createSupplier', async (payload, { rejectWithValue }) => {
  try {
    const response = await suppliersApi.create(payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create supplier');
  }
});

export const fetchRecentProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('purchases/fetchRecentProducts', async (_, { rejectWithValue }) => {
  try {
    const { data: products } = await productsApi.getAll({
      includeInactive: false,
      limit: 20,
    });
    console.log(products);
    return products.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch products');
  }
});

export const searchProducts = createAsyncThunk<
  Product[],
  string,
  { rejectValue: string }
>('purchases/searchProducts', async (query, { rejectWithValue }) => {
  try {
    const products = await productsApi.search(query, 20);
    return products;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to search products');
  }
});

export const scanBarcode = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>('purchases/scanBarcode', async (barcode, { rejectWithValue }) => {
  try {
    const product = await productsApi.getByBarcode(barcode);
    return product;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Product not found');
  }
});

export const createPurchaseInvoice = createAsyncThunk<
  Invoice,
  void,
  { rejectValue: string; state: { purchases: PurchaseFlowState } }
>('purchases/createInvoice', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState().purchases;

    if (!state.selectedSupplier) {
      throw new Error('Please select a supplier');
    }

    if (!state.isDirectTotalMode && state.items.length === 0) {
      throw new Error('Please add at least one item');
    }
    const directAmount = state.isDirectTotalMode ? state.directTotal : null;
    const amountReceived =
      state.paymentStatus == 'partial' ? state.paidAmount : null;
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

    const payload: CreatePurchaseInvoicePayload = {
      supplierId: state.selectedSupplier.id
        ? Number(state.selectedSupplier.id)
        : 0,
      billNumber: state.invoiceNumber || undefined,
      // billDate: state.
      isWalkIn: state.isWalkIn, // Use 0 for walk-in
      dueDate: state.dueDate || undefined,
      items: invoiceItems,
      discountAmount: state.discountAmount,
      directAmount,
      paymentMethod: state.paymentMethod,
      bankAccountId: state.selectedBankAccountId
        ? Number(state.selectedBankAccountId)
        : null,
      amountReceived: amountReceived,
      remarks: state.notes || undefined,
    };
    console.log(payload);
    const invoice = await invoicesApi.createPurchaseInvoice(payload);
    console.log(invoice);
    // Update stock for each item
    // for (const item of state.items) {
    //   await productsApi.adjustStock(
    //     item.product_id,
    //     'in',
    //     item.quantity,
    //     `Purchase ${invoice.invoiceNumber}`,
    //   );
    // }

    return invoice;
  } catch (error: any) {
    return rejectWithValue(
      error.message || 'Failed to create purchase invoice',
    );
  }
});

// Slice
const purchasesSlice = createSlice({
  name: 'purchases',
  initialState,
  reducers: {
    // Supplier selection
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload;
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
      const price = unit_price ?? product.purchase_price;

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
      } else if (action.payload === 'pending') {
        state.paidAmount = 0;
        state.remainingAmount = state.grandTotal;
      }
    },

    setPaymentMethod: (state, action: PayloadAction<PaymentMethod | null>) => {
      state.paymentMethod = action.payload;
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

    setSelectedBankAccount: (state, action: PayloadAction<number | null>) => {
      state.selectedBankAccountId = action.payload;
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
    resetPurchaseFlow: () => initialState,
  },
  extraReducers: builder => {
    builder
      // Fetch recent suppliers
      .addCase(fetchRecentSuppliers.pending, state => {
        state.suppliersLoading = true;
      })
      .addCase(fetchRecentSuppliers.fulfilled, (state, action) => {
        state.suppliersLoading = false;
        state.recentSuppliers = action.payload;
      })
      .addCase(fetchRecentSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.error = action.payload || 'Failed to fetch suppliers';
      })

      // Search suppliers
      .addCase(searchSuppliers.pending, state => {
        state.suppliersLoading = true;
      })
      .addCase(searchSuppliers.fulfilled, (state, action) => {
        state.suppliersLoading = false;
        state.recentSuppliers = action.payload;
      })
      .addCase(searchSuppliers.rejected, (state, action) => {
        state.suppliersLoading = false;
        state.error = action.payload || 'Failed to search suppliers';
      })

      // Create supplier
      .addCase(createSupplier.pending, state => {
        state.isSaving = true;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.isSaving = false;
        state.selectedSupplier = action.payload;
        state.recentSuppliers.unshift(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to create supplier';
      })

      // Fetch recent products
      .addCase(fetchRecentProducts.pending, state => {
        state.productsLoading = true;
      })
      .addCase(fetchRecentProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.recentProducts = action.payload;
      })
      .addCase(fetchRecentProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || 'Failed to fetch products';
      })

      // Search products
      .addCase(searchProducts.pending, state => {
        state.productsLoading = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.recentProducts = action.payload;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload || 'Failed to search products';
      })

      // Scan barcode
      .addCase(scanBarcode.fulfilled, (state, action) => {
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
            unit_price: product.purchase_price,
            discount: 0,
            tax: 0,
            total: product.purchase_price,
          });
        }

        calculateTotals(state);
      })
      .addCase(scanBarcode.rejected, (state, action) => {
        state.error = action.payload || 'Product not found';
      })

      // Create invoice
      .addCase(createPurchaseInvoice.pending, state => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createPurchaseInvoice.fulfilled, (state, action) => {
        state.isSaving = false;
        state.createdInvoice = action.payload;
        state.invoiceNumber = action.payload.invoiceNumber;
      })
      .addCase(createPurchaseInvoice.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to create invoice';
      });
  },
});

export const {
  setSelectedSupplier,
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
  setPaidAmount,
  setDueDate,
  setSelectedBankAccount,
  setNotes,
  clearError,
  resetPurchaseFlow,
} = purchasesSlice.actions;

// Selectors
export const selectIsWalkInPurchase = (state: {
  purchases: PurchaseFlowState;
}) => state.purchases.isWalkIn;
export const selectSelectedSupplier = (state: {
  purchases: PurchaseFlowState;
}) => state.purchases.selectedSupplier;
export const selectPurchaseItems = (state: { purchases: PurchaseFlowState }) =>
  state.purchases.items;
export const selectPurchaseTotals = (state: {
  purchases: PurchaseFlowState;
}) => ({
  subtotal: state.purchases.subtotal,
  discount: state.purchases.discountAmount,
  tax: state.purchases.taxAmount,
  grandTotal: state.purchases.grandTotal,
});
export const selectPaymentDetails = (state: {
  purchases: PurchaseFlowState;
}) => ({
  status: state.purchases.paymentStatus,
  method: state.purchases.paymentMethod,
  paidAmount: state.purchases.paidAmount,
  remainingAmount: state.purchases.remainingAmount,
  dueDate: state.purchases.dueDate,
});
export const selectRecentSuppliers = (state: {
  purchases: PurchaseFlowState;
}) => state.purchases.recentSuppliers;
export const selectRecentProducts = (state: { purchases: PurchaseFlowState }) =>
  state.purchases.recentProducts;
export const selectPurchasesLoading = (state: {
  purchases: PurchaseFlowState;
}) => state.purchases.isLoading || state.purchases.isSaving;
export const selectPurchasesError = (state: { purchases: PurchaseFlowState }) =>
  state.purchases.error;
export const selectCreatedInvoice = (state: { purchases: PurchaseFlowState }) =>
  state.purchases.createdInvoice;

export default purchasesSlice.reducer;

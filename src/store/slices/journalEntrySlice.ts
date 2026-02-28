import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  accountingApi,
  Account,
  JournalEntry,
  CreateJournalEntryPayload,
  RecurringOptions,
} from '../../services/api/accounting';
import { RootState } from '../index';

// Types
interface JournalEntryState {
  // Accounts
  accounts: Account[];
  flatAccounts: Account[];
  accountsLoading: boolean;
  accountsError: string | null;

  // Journal Entries
  entries: JournalEntry[];
  entriesLoading: boolean;
  entriesError: string | null;

  // Current Entry (draft)
  currentEntry: {
    postingDate: string;
    lineItems: {
      accountId: number;
      account?: Account;
      debit: number;
      credit: number;
      partyType?: 'Customer' | 'Supplier';
      partyId?: number;
      remarks?: string;
    }[];
    referenceNumber?: string;
    narration?: string;
    makeRecurring: boolean;
    recurringOptions?: RecurringOptions;
  };

  // Submission state
  isSubmitting: boolean;
  submitError: string | null;
  lastSubmittedEntry: JournalEntry | null;

  // Totals (computed)
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

const initialState: JournalEntryState = {
  accounts: [],
  flatAccounts: [],
  accountsLoading: false,
  accountsError: null,

  entries: [],
  entriesLoading: false,
  entriesError: null,

  currentEntry: {
    postingDate: new Date().toISOString().split('T')[0],
    lineItems: [
      { accountId: 0, debit: 0, credit: 0 },
      { accountId: 0, debit: 0, credit: 0 },
    ],
    referenceNumber: '',
    narration: '',
    makeRecurring: false,
    recurringOptions: undefined,
  },

  isSubmitting: false,
  submitError: null,
  lastSubmittedEntry: null,

  totalDebit: 0,
  totalCredit: 0,
  isBalanced: true,
};

// Async Thunks
export const fetchAccounts = createAsyncThunk(
  'journalEntry/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const accounts = await accountingApi.getAccounts();
      return accounts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch accounts');
    }
  },
);

export const fetchFlatAccounts = createAsyncThunk(
  'journalEntry/fetchFlatAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const accounts = await accountingApi.getAccounts({ flat: true });
      return accounts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch accounts');
    }
  },
);

export const fetchJournalEntries = createAsyncThunk(
  'journalEntry/fetchEntries',
  async (
    filters:
      | { fromDate?: string; toDate?: string; page?: number; limit?: number }
      | undefined,
    { rejectWithValue },
  ) => {
    try {
      const response = await accountingApi.getJournalEntries(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch entries');
    }
  },
);

export const submitJournalEntry = createAsyncThunk(
  'journalEntry/submit',
  async (payload: CreateJournalEntryPayload, { getState, rejectWithValue }) => {
    try {
      // Build payload
      // const payload: CreateJournalEntryPayload = {
      //   postingDate: currentEntry.postingDate,
      //   remarks: currentEntry.narration,
      //   entries: currentEntry.lineItems
      //     .filter(
      //       item => item.accountId > 0 && (item.debit > 0 || item.credit > 0),
      //     )
      //     .map(item => ({
      //       accountId: item.accountId,
      //       debit: item.debit || 0,
      //       credit: item.credit || 0,
      //       remarks: item.remarks,
      //     })),
      // };

      const response = await accountingApi.createJournalEntry(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to submit entry');
    }
  },
);

// Helper to flatten accounts
const flattenAccounts = (accounts: Account[]): Account[] => {
  const result: Account[] = [];
  const flatten = (accs: Account[]) => {
    for (const acc of accs) {
      if (!acc.isGroup) {
        result.push(acc);
      }
      if (acc.children) {
        flatten(acc.children);
      }
    }
  };
  flatten(accounts);
  return result;
};

// Slice
const journalEntrySlice = createSlice({
  name: 'journalEntry',
  initialState,
  reducers: {
    // Set posting date
    setPostingDate: (state, action: PayloadAction<string>) => {
      state.currentEntry.postingDate = action.payload;
    },

    // Add line item
    addLineItem: state => {
      state.currentEntry.lineItems.push({
        accountId: 0,
        debit: 0,
        credit: 0,
      });
    },

    // Remove line item
    removeLineItem: (state, action: PayloadAction<number>) => {
      if (state.currentEntry.lineItems.length > 2) {
        state.currentEntry.lineItems.splice(action.payload, 1);
      }
    },

    // Update line item
    updateLineItem: (
      state,
      action: PayloadAction<{
        index: number;
        field: 'accountId' | 'debit' | 'credit' | 'remarks';
        value: number | string;
      }>,
    ) => {
      const { index, field, value } = action.payload;
      if (state.currentEntry.lineItems[index]) {
        (state.currentEntry.lineItems[index] as any)[field] = value;

        // Recalculate totals
        state.totalDebit = state.currentEntry.lineItems.reduce(
          (sum, item) => sum + (item.debit || 0),
          0,
        );
        state.totalCredit = state.currentEntry.lineItems.reduce(
          (sum, item) => sum + (item.credit || 0),
          0,
        );
        state.isBalanced = state.totalDebit === state.totalCredit;
      }
    },

    // Set account for line item
    setLineItemAccount: (
      state,
      action: PayloadAction<{ index: number; account: Account }>,
    ) => {
      const { index, account } = action.payload;
      if (state.currentEntry.lineItems[index]) {
        state.currentEntry.lineItems[index].accountId = account.id;
        state.currentEntry.lineItems[index].account = account;
      }
    },

    // Set narration
    setNarration: (state, action: PayloadAction<string>) => {
      state.currentEntry.narration = action.payload;
    },

    // Set reference number
    setReferenceNumber: (state, action: PayloadAction<string>) => {
      state.currentEntry.referenceNumber = action.payload;
    },

    // Set make recurring flag
    setMakeRecurring: (state, action: PayloadAction<boolean>) => {
      state.currentEntry.makeRecurring = action.payload;
      if (!action.payload) {
        state.currentEntry.recurringOptions = undefined;
      }
    },

    // Set recurring options
    setRecurringOptions: (
      state,
      action: PayloadAction<RecurringOptions | undefined>,
    ) => {
      state.currentEntry.recurringOptions = action.payload;
      if (action.payload) {
        state.currentEntry.makeRecurring = true;
      }
    },

    // Update full current entry (for syncing from form)
    updateCurrentEntry: (
      state,
      action: PayloadAction<Partial<JournalEntryState['currentEntry']>>,
    ) => {
      state.currentEntry = { ...state.currentEntry, ...action.payload };
      state.totalDebit = state.currentEntry.lineItems.reduce(
        (sum, item) => sum + (item.debit || 0),
        0,
      );
      state.totalCredit = state.currentEntry.lineItems.reduce(
        (sum, item) => sum + (item.credit || 0),
        0,
      );
      state.isBalanced = state.totalDebit === state.totalCredit;
    },

    // Reset current entry
    resetCurrentEntry: state => {
      state.currentEntry = {
        postingDate: new Date().toISOString().split('T')[0],
        lineItems: [
          { accountId: 0, debit: 0, credit: 0 },
          { accountId: 0, debit: 0, credit: 0 },
        ],
        referenceNumber: '',
        narration: '',
        makeRecurring: false,
        recurringOptions: undefined,
      };
      state.totalDebit = 0;
      state.totalCredit = 0;
      state.isBalanced = true;
      state.submitError = null;
      state.lastSubmittedEntry = null;
    },

    // Clear error
    clearError: state => {
      state.accountsError = null;
      state.entriesError = null;
      state.submitError = null;
    },

    // Recalculate totals
    recalculateTotals: state => {
      state.totalDebit = state.currentEntry.lineItems.reduce(
        (sum, item) => sum + (item.debit || 0),
        0,
      );
      state.totalCredit = state.currentEntry.lineItems.reduce(
        (sum, item) => sum + (item.credit || 0),
        0,
      );
      state.isBalanced = state.totalDebit === state.totalCredit;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch accounts
      .addCase(fetchAccounts.pending, state => {
        state.accountsLoading = true;
        state.accountsError = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accountsLoading = false;
        state.accounts = action.payload.data;
        state.flatAccounts = flattenAccounts(action.payload.data);
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.accountsLoading = false;
        state.accountsError = action.payload as string;
      })

      // Fetch flat accounts
      .addCase(fetchFlatAccounts.fulfilled, (state, action) => {
        state.flatAccounts = action.payload.data;
      })

      // Fetch entries
      .addCase(fetchJournalEntries.pending, state => {
        state.entriesLoading = true;
        state.entriesError = null;
      })
      .addCase(fetchJournalEntries.fulfilled, (state, action) => {
        state.entriesLoading = false;
        state.entries = action.payload.data;
      })
      .addCase(fetchJournalEntries.rejected, (state, action) => {
        state.entriesLoading = false;
        state.entriesError = action.payload as string;
      })

      // Submit entry
      .addCase(submitJournalEntry.pending, state => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitJournalEntry.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.lastSubmittedEntry = action.payload;
        state.entries.unshift(action.payload);
        // Reset current entry after successful submission
        state.currentEntry = initialState.currentEntry;
        state.totalDebit = 0;
        state.totalCredit = 0;
        state.isBalanced = true;
      })
      .addCase(submitJournalEntry.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload as string;
      });
  },
});

// Actions
export const {
  setPostingDate,
  addLineItem,
  removeLineItem,
  updateLineItem,
  setLineItemAccount,
  setNarration,
  setReferenceNumber,
  setMakeRecurring,
  setRecurringOptions,
  updateCurrentEntry,
  resetCurrentEntry,
  clearError,
  recalculateTotals,
} = journalEntrySlice.actions;

// Selectors
export const selectAccounts = (state: RootState) => state.journalEntry.accounts;
export const selectFlatAccounts = (state: RootState) =>
  state.journalEntry.flatAccounts;
export const selectAccountsLoading = (state: RootState) =>
  state.journalEntry.accountsLoading;
export const selectAccountsError = (state: RootState) =>
  state.journalEntry.accountsError;

export const selectCurrentEntry = (state: RootState) =>
  state.journalEntry.currentEntry;
export const selectTotalDebit = (state: RootState) =>
  state.journalEntry.totalDebit;
export const selectTotalCredit = (state: RootState) =>
  state.journalEntry.totalCredit;
export const selectIsBalanced = (state: RootState) =>
  state.journalEntry.isBalanced;

export const selectIsSubmitting = (state: RootState) =>
  state.journalEntry.isSubmitting;
export const selectSubmitError = (state: RootState) =>
  state.journalEntry.submitError;
export const selectLastSubmittedEntry = (state: RootState) =>
  state.journalEntry.lastSubmittedEntry;
export const selectMakeRecurring = (state: RootState) =>
  state.journalEntry.currentEntry.makeRecurring;
export const selectRecurringOptions = (state: RootState) =>
  state.journalEntry.currentEntry.recurringOptions;
export const selectReferenceNumber = (state: RootState) =>
  state.journalEntry.currentEntry.referenceNumber;

export default journalEntrySlice.reducer;

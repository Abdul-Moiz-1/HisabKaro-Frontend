# Purchase Flow - Reusable Shared Screens Integration Plan

## Overview

This plan outlines the changes needed to make the Purchase Flow use shared, reusable screens consistently with Sales and Receipt flows. The goal is to follow the same adapter pattern established in the previous refactoring.

---

## Current State Analysis

### What's Already Working
- `purchasesSlice` is well-structured with suppliers, products, items, and payment state
- `PurchaseFlowNavigator` imports some shared screens (DirectTotalScreen, PaymentTermScreen, ProductQuantityPriceScreen, ProductSelectionScreen, SupplierSelectionScreen)
- `useFlowAdapter.ts` has configuration for 'purchase' flow type but NOT fully integrated

### What Needs to Change

| Screen | Current State | Required Changes |
|--------|---------------|------------------|
| **SupplierSelectionScreen** | Hardcoded for purchases only | Make reusable via adapter (like CustomerSelectionScreen) |
| **ProductSelectionScreen** | Hardcoded to salesSlice | Make flow-aware via adapter |
| **ProductQuantityPriceScreen** | Needs review | Make flow-aware via adapter |
| **PaymentMethodScreen** | Uses adapter but missing purchase integration | Add purchase flow support |
| **BankSelectionScreen** | Uses adapter but missing purchase integration | Add purchase flow support |
| **useFlowAdapter.ts** | Has purchase configs but no purchase slice integration | Add purchasesSlice integration |

---

## Phase 1: Extend Flow Adapter Hooks

### 1.1 Update `useFlowAdapter.ts`

**File**: `src/screens/ManualTranasactions/shared/hooks/useFlowAdapter.ts`

**Changes Required**:

1. **Import purchasesSlice** actions and selectors:
```typescript
import {
  fetchRecentSuppliers,
  searchSuppliers,
  setSelectedSupplier,
  selectRecentSuppliers,
  selectSelectedSupplier,
  selectPurchaseTotals,
  selectPaymentDetails as selectPurchasePaymentDetails,
  setPaymentMethod as setPurchasePaymentMethod,
  setSelectedBankAccount as setPurchaseBankAccount, // Need to add this action
  selectPurchasesError,
  clearError as clearPurchaseError,
  resetPurchaseFlow,
} from '../../../../store/slices/purchasesSlice';
```

2. **Add Supplier type import**:
```typescript
import { Supplier } from '../../../../services/api/suppliers';
```

3. **Create new `useSupplierSelectionFlow` hook**:
```typescript
export interface SupplierSelectionConfig {
  screenTitle: string;
  sectionTitle: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptySubtitle: string;
  showOutstandingBadge: boolean;
  filterByPayables: boolean;
  nextScreen: string;
}

const supplierSelectionConfigs: Record<FlowType, SupplierSelectionConfig> = {
  purchase: {
    screenTitle: 'Bought something',
    sectionTitle: 'Recent Suppliers',
    searchPlaceholder: 'Search by name, phone, or city...',
    emptyTitle: 'No suppliers yet',
    emptySubtitle: 'Add your first supplier to get started',
    showOutstandingBadge: true,
    filterByPayables: false,
    nextScreen: 'ProductSelection',
  },
  payment: {
    screenTitle: 'I paid supplier',
    sectionTitle: 'Suppliers with pending payments',
    searchPlaceholder: 'Search supplier...',
    emptyTitle: 'No Suppliers Found',
    emptySubtitle: 'No suppliers with pending payments',
    showOutstandingBadge: true,
    filterByPayables: true,
    nextScreen: 'AmountEntry',
  },
  // ... other flows return null/empty config
};

export const useSupplierSelectionFlow = (flowType: FlowType) => {
  // Similar pattern to useCustomerSelectionFlow
  // Returns: config, suppliers, isLoading, error, fetchSuppliers, searchSuppliersByQuery, selectSupplier, resetFlow, clearError
};
```

4. **Update `usePaymentMethodFlow`** to include purchase flow:
```typescript
// Add purchasesSlice selectors
const purchaseSupplier = useAppSelector(selectSelectedSupplier);
const purchaseTotals = useAppSelector(selectPurchaseTotals);
const purchasePaymentDetails = useAppSelector(selectPurchasePaymentDetails);

// Update useMemo to handle 'purchase' case
case 'purchase':
  return {
    customer: purchaseSupplier, // Note: using 'customer' key for consistency
    amount: purchaseTotals.grandTotal,
    paymentStatus: purchasePaymentDetails.status,
    remainingAmount: purchasePaymentDetails.remainingAmount,
  };

// Update setPaymentMethod to handle 'purchase' case
case 'purchase':
  return dispatch(setPurchasePaymentMethod(method));
```

5. **Update `useBankSelectionFlow`** to include purchase flow:
```typescript
// Similar pattern - add purchase selectors and setBankAccount action
```

6. **Create new `useProductSelectionFlow` hook**:
```typescript
export interface ProductSelectionConfig {
  screenTitle: string;
  partyLabel: string;
  partyValue: string;
  showQuickAdd: boolean;
  showCart: boolean;
  allowDirectTotal: boolean;
  nextScreen: string;
  cartScreen: string;
  directTotalScreen: string;
  priceField: 'defaultSellingPrice' | 'purchase_price';
}

export const useProductSelectionFlow = (flowType: FlowType) => {
  // Returns: config, products, party (customer/supplier), cartItems, isLoading, error,
  //          fetchProducts, searchProducts, addItem, clearError
};
```

---

## Phase 2: Create Unified PartySelectionScreen

### 2.1 Refactor SupplierSelectionScreen to be flow-aware

**File**: `src/screens/ManualTranasactions/shared/SupplierSelectionScreen.tsx`

**Changes**:
1. Accept `flowType` from route params (default: 'purchase')
2. Use `useSupplierSelectionFlow(flowType)` hook
3. Use config for labels, badges, and navigation
4. Make it similar to how CustomerSelectionScreen works

**Code Pattern**:
```typescript
const SupplierSelectionScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'SupplierSelection'>>();
  const { flowType = 'purchase' } = route.params || {};

  const {
    config,
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    searchSuppliersByQuery,
    selectSupplier,
    clearError,
  } = useSupplierSelectionFlow(flowType);

  // ... rest uses config values
};
```

---

## Phase 3: Refactor ProductSelectionScreen

### 3.1 Make ProductSelectionScreen truly flow-aware

**File**: `src/screens/ManualTranasactions/shared/ProductSelectionScreen.tsx`

**Current Issues**:
1. Hardcoded to `salesSlice` only
2. Uses `selectSalesProducts`, `fetchSalesProducts`, `addItem` from salesSlice
3. Shows "Selling to:" banner hardcoded for sales

**Changes Required**:
1. Create `useProductSelectionFlow` hook
2. Use flow-specific slice actions:
   - Sales: `salesSlice.addItem`, `salesSlice.fetchSalesProducts`
   - Purchase: `purchasesSlice.addItem`, `purchasesSlice.fetchRecentProducts`
3. Update UI labels based on flow:
   - Sales: "Selling to: {customer}"
   - Purchase: "Buying from: {supplier}"
4. Use flow-specific price field:
   - Sales: `defaultSellingPrice`
   - Purchase: `purchase_price`

---

## Phase 4: Refactor ProductQuantityPriceScreen

### 4.1 Make ProductQuantityPriceScreen flow-aware

**File**: `src/screens/ManualTranasactions/shared/ProductQuantityPriceScreen.tsx`

**Changes Required**:
1. Accept `flowType` from route params
2. Use flow-specific actions for adding items
3. Use correct price field based on flow
4. Navigate to correct next screen based on flow

---

## Phase 5: Update purchasesSlice

### 5.1 Add missing actions

**File**: `src/store/slices/purchasesSlice.ts`

**Add**:
```typescript
setSelectedBankAccount: (state, action: PayloadAction<number | null>) => {
  state.selectedBankAccountId = action.payload;
},
```

**Add to state interface**:
```typescript
selectedBankAccountId: number | null;
```

---

## Phase 6: Update PurchaseFlowNavigator

### 6.1 Update navigator with wrapper components

**File**: `src/screens/ManualTranasactions/purchases/PurchaseFlowNavigator.tsx`

**Changes**:
1. Import shared screens: `PaymentMethodScreen`, `BankSelectionScreen`
2. Create wrapper components with `flowType: 'purchase'`
3. Add PaymentMethod and BankSelection screens to navigator

**New screens to add**:
```typescript
<Stack.Screen
  name="PaymentMethod"
  component={PurchasePaymentMethod}
  options={{ title: 'Payment Method' }}
  initialParams={{ flowType: 'purchase' }}
/>
<Stack.Screen
  name="BankSelection"
  component={PurchaseBankSelection}
  options={{ title: 'Select Bank Account' }}
  initialParams={{ flowType: 'purchase' }}
/>
```

---

## Phase 7: Update shared/index.ts exports

**File**: `src/screens/ManualTranasactions/shared/index.ts`

**Ensure exports include**:
```typescript
export {
  useCustomerSelectionFlow,
  useSupplierSelectionFlow,  // NEW
  usePaymentMethodFlow,
  useBankSelectionFlow,
  useProductSelectionFlow,   // NEW
  type FlowType,
  type CustomerSelectionConfig,
  type SupplierSelectionConfig,  // NEW
  type PaymentMethodConfig,
  type BankSelectionConfig,
  type ProductSelectionConfig,   // NEW
} from './hooks/useFlowAdapter';
```

---

## Implementation Order

1. **Phase 1**: Update `useFlowAdapter.ts`
   - Add purchasesSlice imports
   - Create `useSupplierSelectionFlow` hook
   - Update `usePaymentMethodFlow` for purchase
   - Update `useBankSelectionFlow` for purchase
   - Create `useProductSelectionFlow` hook

2. **Phase 5**: Update `purchasesSlice.ts`
   - Add `selectedBankAccountId` to state
   - Add `setSelectedBankAccount` action

3. **Phase 2**: Refactor `SupplierSelectionScreen.tsx`
   - Use adapter hook pattern

4. **Phase 3**: Refactor `ProductSelectionScreen.tsx`
   - Use adapter hook pattern

5. **Phase 4**: Refactor `ProductQuantityPriceScreen.tsx`
   - Use adapter hook pattern

6. **Phase 6**: Update `PurchaseFlowNavigator.tsx`
   - Add PaymentMethod and BankSelection screens
   - Use wrapper components with flowType

7. **Phase 7**: Update exports in `shared/index.ts`

---

## Files to Modify

| File | Action |
|------|--------|
| `shared/hooks/useFlowAdapter.ts` | Major update - add purchase integration + new hooks |
| `store/slices/purchasesSlice.ts` | Add selectedBankAccountId state and action |
| `shared/SupplierSelectionScreen.tsx` | Refactor to use adapter |
| `shared/ProductSelectionScreen.tsx` | Refactor to use adapter |
| `shared/ProductQuantityPriceScreen.tsx` | Refactor to use adapter |
| `purchases/PurchaseFlowNavigator.tsx` | Add PaymentMethod, BankSelection screens |
| `shared/index.ts` | Update exports |

---

## Testing Checklist

### Purchase Flow
- [ ] Supplier selection works with search
- [ ] Product selection shows purchase prices
- [ ] "Buying from: {supplier}" banner shows
- [ ] Quick add works (adds to purchases cart)
- [ ] Direct total option works
- [ ] Quantity/price entry works
- [ ] Payment method selection works
- [ ] Bank selection works for bank payments
- [ ] Invoice creation succeeds
- [ ] Stock is updated (increased)

### Cross-Flow Verification
- [ ] Sales flow still works correctly
- [ ] Receipt flow still works correctly
- [ ] No regressions in existing functionality

---

## Notes

1. **Party Abstraction**: The adapter uses "customer" key even for suppliers to maintain consistency. The actual type depends on the flow.

2. **Price Fields**:
   - Sales uses `defaultSellingPrice`
   - Purchase uses `purchase_price`

3. **Stock Direction**:
   - Sales: Stock OUT (decrease)
   - Purchase: Stock IN (increase)

4. **Outstanding vs Payable**:
   - Customers have `outstanding_balance` (they owe us)
   - Suppliers have `payable_balance` (we owe them)

5. **Navigation Consistency**: All flows should follow the pattern:
   - Party Selection → Product Selection → Quantity/Price → Bill Summary → Payment → Bank (if needed) → Confirmation

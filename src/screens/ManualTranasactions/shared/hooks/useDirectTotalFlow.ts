// ============================================
// Direct Total Screen Flow Adapter
// ============================================
import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';

// Import Sales slice
import {
  setSelectedCustomer as setSalesCustomer,
  selectSelectedCustomer as selectSalesCustomer,
  selectIsWalkInSale,
  setDirectTotal as setSalesDirectTotal,
  selectSaleTotals,
} from '../../../../store/slices/salesSlice';

// Import Purchases slice
import {
  selectSelectedSupplier,
  selectPurchaseTotals,
  selectIsWalkInPurchase,
  setDirectTotal as setPurchaseDirectTotal,
} from '../../../../store/slices/purchasesSlice';
import { selectReceiptCustomer } from '../../../../store/slices/receiptsSlice';
import { FlowType } from '../../../../types/trasactions';

export interface DirectTotalConfig {
  title: string;
  subtitle: string;
  amountLabel: string;
  partyPrefix: string;
  partyLabel: string;
  infoText: string;
  question: string;
  summaryLabel: string;
  nextScreen: string;
}
type DirectTotalFlowType = Extract<FlowType, 'sales' | 'purchase'>;

const directTotalConfigs: Partial<Record<FlowType, DirectTotalConfig>> = {
  sales: {
    title: 'Direct Total',
    subtitle: 'Enter total sale amount',
    amountLabel: 'Total Sale Amount',
    partyPrefix: 'From',
    partyLabel: 'Selling to:',
    infoText:
      "Enter the total sale amount directly. This is useful when you don't want to add individual products.",
    question: "What's the total sale amount?",
    summaryLabel: 'Total Sale Amount',
    nextScreen: 'PaymentTerm',
  },
  purchase: {
    title: 'Direct Total',
    subtitle: 'Enter total purchase amount',
    amountLabel: 'Total Purchase Amount',
    partyPrefix: 'To',
    partyLabel: 'Purchasing from:',
    infoText:
      "Enter the total purchase amount directly. This is useful when you don't want to add individual products.",
    question: "What's the total purchase amount?",
    summaryLabel: 'Total Purchase Amount',
    nextScreen: 'PaymentTerms',
  },
  // payment: {
  //   title: 'Select Bank Account',
  //   subtitle: 'Which account to pay from?',
  //   amountLabel: 'Amount to Pay',
  //   partyPrefix: 'To',
  //   nextScreen: 'InvoiceAllocation',
  // },
  // expense: {
  //   title: 'Select Bank Account',
  //   subtitle: 'Which account to pay from?',
  //   amountLabel: 'Amount to Pay',
  //   partyPrefix: 'To',
  //   nextScreen: 'Confirmation',
  // },
  // transfer: {
  //   title: 'Select Source Account',
  //   subtitle: 'Select account to transfer from',
  //   amountLabel: 'Transfer Amount',
  //   partyPrefix: 'To',
  //   nextScreen: 'DestinationAccount',
  // },
};

export const useDirectTotalSelectionFlow = (flowType: FlowType) => {
  const dispatch = useAppDispatch();
  const config = directTotalConfigs[flowType];
  // Sales selectors
  const salesCustomer = useAppSelector(selectSalesCustomer);
  const salesDirectTotals = useAppSelector(selectSaleTotals);
  const salesIsWalkIn = useAppSelector(selectIsWalkInSale);

  // Purchase selectors
  const purchaseCustomer = useAppSelector(selectSelectedSupplier);
  const purchaseDirectTotals = useAppSelector(selectPurchaseTotals);
  const purchaseIsWalkIn = useAppSelector(selectIsWalkInPurchase);

  const { party, amount, isWalkIn } = useMemo(() => {
    switch (flowType) {
      case 'purchase':
        return {
          party: purchaseCustomer,
          amount: purchaseDirectTotals.grandTotal,
          isWalkIn: purchaseIsWalkIn,
        };
      case 'sales':
      default:
        return {
          party: salesCustomer,
          amount: salesDirectTotals.grandTotal,
          isWalkIn: salesIsWalkIn,
        };
    }
  }, [
    flowType,
    salesCustomer,
    purchaseCustomer,
    purchaseIsWalkIn,
    purchaseDirectTotals,
    salesCustomer,
    salesIsWalkIn,
    salesDirectTotals,
  ]);

  const setDirectTotalAmount = useCallback(
    (amount: number) => {
      switch (flowType) {
        case 'purchase':
          return dispatch(setPurchaseDirectTotal(amount));
        case 'sales':
        default:
          return dispatch(setSalesDirectTotal(amount));
      }
    },
    [flowType, dispatch],
  );

  return {
    config,
    party,
    amount,
    isWalkIn,
    setDirectTotalAmount,
  };
};

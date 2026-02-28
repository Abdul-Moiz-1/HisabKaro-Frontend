// shared/PaymentMethodScreen.tsx
// Reusable payment method selection screen for Sales, Receipt, Purchase, Payment flows
import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MoneyIcon, BankIcon, CheckCircleIcon } from 'phosphor-react-native';

import { useTheme } from '../../../store/hooks';
import ActionButton from '../../../components/common/ActionButton';
import { usePaymentMethodFlow } from './hooks/useFlowAdapter';
import { FlowType } from '../../../types/trasactions';

type PaymentMethodType = 'Cash' | 'Bank Transfer';

type RouteParams = {
  PaymentMethod: {
    flowType?: FlowType;
    cashNextScreen?: string;
    bankNextScreen?: string;
  };
};

interface PaymentMethodOption {
  value: PaymentMethodType;
  label: string;
  icon: typeof MoneyIcon;
  iconColor: string;
  backgroundColor: string;
  description: string;
}

const PaymentMethodScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'PaymentMethod'>>();

  const {
    flowType = 'sales',
    cashNextScreen: customCashNextScreen,
    bankNextScreen: customBankNextScreen,
  } = route.params || {};

  // Use flow adapter hook
  const {
    config,
    party,
    amount,
    paymentStatus,
    remainingAmount,
    setPaymentMethod,
  } = usePaymentMethodFlow(flowType);

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Determine next screens - custom override or config default
  const cashNextScreen = customCashNextScreen || config.cashNextScreen;
  const bankNextScreen = customBankNextScreen || config.bankNextScreen;

  // Payment method options
  const paymentMethods: PaymentMethodOption[] = useMemo(
    () => [
      {
        value: 'Cash',
        label: 'Cash',
        icon: MoneyIcon,
        iconColor: '#22C55E',
        backgroundColor: '#22C55E15',
        description:
          flowType === 'sales' || flowType === 'receipt'
            ? 'Received in hand'
            : 'Paid in cash',
      },
      {
        value: 'Bank Transfer',
        label: 'Bank Transfer',
        icon: BankIcon,
        iconColor: '#8B5CF6',
        backgroundColor: '#8B5CF615',
        description:
          flowType === 'sales' || flowType === 'receipt'
            ? 'Direct to your account'
            : 'Transfer from account',
      },
    ],
    [flowType],
  );

  const handleMethodSelect = useCallback((method: PaymentMethodType) => {
    setSelectedMethod(method);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedMethod) return;

    // Update Redux state based on flow type
    setPaymentMethod(selectedMethod);

    // Navigate to appropriate next screen
    const nextScreen =
      selectedMethod === 'Cash' ? cashNextScreen : bankNextScreen;

    // @ts-ignore
    navigation.navigate(nextScreen, {
      flowType,
      amount,
      partyName: party?.name,
    });
  }, [
    selectedMethod,
    setPaymentMethod,
    navigation,
    cashNextScreen,
    bankNextScreen,
    flowType,
    amount,
    party,
  ]);

  // Determine payment status badge
  const renderPaymentStatusBadge = () => {
    if (paymentStatus === 'full' || paymentStatus === 'paid') {
      return (
        <View style={styles.fullPaymentBadge}>
          <Text style={styles.fullPaymentText}>Full Payment</Text>
        </View>
      );
    }

    if (paymentStatus === 'advance') {
      return (
        <View style={styles.advanceBadge}>
          <Text style={styles.advanceText}>
            Advance: PKR {remainingAmount.toLocaleString()}
          </Text>
        </View>
      );
    }

    if (paymentStatus === 'partial') {
      return (
        <View style={styles.remainingBadge}>
          <Text style={styles.remainingText}>
            Remaining: PKR {remainingAmount.toLocaleString()}
          </Text>
        </View>
      );
    }

    if (paymentStatus === 'pending') {
      return (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>Credit Sale - No payment now</Text>
        </View>
      );
    }

    return null;
  };

  // Get the label for amount based on flow
  const getAmountLabel = () => {
    switch (flowType) {
      case 'receipt':
        return 'Amount Received';
      case 'payment':
        return 'Amount Paid';
      case 'sales':
        return paymentStatus === 'paid' ? 'Total Amount' : 'Amount Paid Now';
      case 'purchase':
        return 'Amount to Pay';
      default:
        return config.amountLabel;
    }
  };

  // Get the party prefix based on flow
  const getPartyLabel = () => {
    if (!party?.name) return null;
    const prefix =
      flowType === 'sales' || flowType === 'receipt' ? 'From' : 'To';
    return `${prefix}: ${party.name}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{getAmountLabel()}</Text>
          <Text style={styles.summaryAmount}>
            PKR {amount.toLocaleString()}
          </Text>
          {party && <Text style={styles.customerName}>{getPartyLabel()}</Text>}
          {renderPaymentStatusBadge()}
        </View>

        {/* Question */}
        <Text style={styles.question}>{config.questionText}</Text>

        {/* Payment Method Cards */}
        {paymentMethods.map(method => {
          const isSelected = selectedMethod === method.value;
          const IconComponent = method.icon;

          return (
            <TouchableOpacity
              key={method.value}
              style={[
                styles.methodCard,
                isSelected && styles.methodCardSelected,
              ]}
              onPress={() => handleMethodSelect(method.value)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: method.backgroundColor },
                  isSelected && styles.iconContainerSelected,
                ]}
              >
                <IconComponent
                  size={28}
                  color={isSelected ? theme.colors.primary : method.iconColor}
                  weight={isSelected ? 'fill' : 'regular'}
                />
              </View>

              <View style={styles.methodContent}>
                <Text
                  style={[
                    styles.methodLabel,
                    isSelected && styles.methodLabelSelected,
                  ]}
                >
                  {method.label}
                </Text>
                <Text style={styles.methodDescription}>
                  {method.description}
                </Text>
              </View>

              {isSelected && (
                <CheckCircleIcon
                  size={24}
                  color={theme.colors.primary}
                  weight="fill"
                />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Info Text for specific payment statuses */}
        {paymentStatus === 'pending' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This is a credit sale. No payment received now.
            </Text>
          </View>
        )}
        {paymentStatus === 'partial' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Partial payment received. PKR {remainingAmount.toLocaleString()}{' '}
              will be due.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedMethod}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    summaryAmount: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    customerName: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    remainingBadge: {
      marginTop: theme.spacing.sm,
      backgroundColor: `${theme.colors.warning}15`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    remainingText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    fullPaymentBadge: {
      marginTop: theme.spacing.sm,
      backgroundColor: `${theme.colors.success}15`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    fullPaymentText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.success,
    },
    advanceBadge: {
      marginTop: theme.spacing.sm,
      backgroundColor: `${theme.colors.info}15`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    advanceText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.info,
    },
    pendingBadge: {
      marginTop: theme.spacing.sm,
      backgroundColor: `${theme.colors.text.disabled}15`,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    pendingText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    question: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    methodCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 2,
      borderColor: 'transparent',
      ...theme.shadows.sm,
    },
    methodCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}08`,
    },
    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    iconContainerSelected: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    methodContent: {
      flex: 1,
    },
    methodLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    methodLabelSelected: {
      color: theme.colors.primary,
    },
    methodDescription: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    infoBox: {
      marginTop: theme.spacing.lg,
      backgroundColor: `${theme.colors.info}10`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.info,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.info,
      lineHeight: 18,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
  });

export default PaymentMethodScreen;

// flows/receipt/screens/PaymentMethodScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { Theme } from '../../../../constants/theme';
import SelectionCard from '../../../../components/common/SelectionCard';
import ActionButton from '../../../../components/common/ActionButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReceiptFlow } from '../context/ReceiptFlowContext';

const paymentMethods = [
  {
    value: 'cash',
    label: 'Cash',
    icon: '💵',
    description: 'Received in hand',
    navigateTo: 'Confirmation',
  },
  {
    value: 'bank',
    label: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct to your account',
    navigateTo: 'BankSelection',
  },
  {
    value: 'wallet',
    label: 'Mobile Wallet',
    icon: '📱',
    description: 'JazzCash, Easypaisa, etc.',
    navigateTo: 'WalletSelection',
  },
  {
    value: 'cheque',
    label: 'Cheque',
    icon: '📝',
    description: 'Post-dated or cleared',
    navigateTo: 'ChequeDetails',
  },
  {
    value: 'card',
    label: 'Card/POS',
    icon: '💳',
    description: 'Credit/Debit card payment',
    navigateTo: 'Confirmation',
  },
];

const PaymentMethodScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();
  const { data, setPaymentMethod } = useReceiptFlow();

  const customer = data.customer;
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const handleContinue = () => {
    const method = paymentMethods.find(m => m.value === selectedMethod);
    if (method && selectedMethod) {
      setPaymentMethod(selectedMethod as 'cash' | 'bank' | 'wallet' | 'cheque' | 'card');
      // @ts-ignore
      navigation.navigate(method.navigateTo);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.question}>How did {customer?.name} pay?</Text>

        {paymentMethods.map(method => (
          <SelectionCard
            key={method.value}
            icon={method.icon}
            label={method.label}
            description={method.description}
            selected={selectedMethod === method.value}
            onPress={() => setSelectedMethod(method.value)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!selectedMethod}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default PaymentMethodScreen;

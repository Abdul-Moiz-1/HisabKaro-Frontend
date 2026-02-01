// flows/purchase/screens/FullPaymentScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectionCard from '../../../../components/common/SelectionCard';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const FullPaymentScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { totalAmount, supplier } = route.params?.flowData || {};

  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const handleContinue = () => {
    navigateToScreen('Confirmation', {
      paymentMethod: paymentMethod ?? undefined,
      paymentStatus: 'paid',
      supplier,
      totalAmount
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Paying in full:</Text>
          <Text style={styles.amountValue}>
            PKR {totalAmount?.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.question}>How did you pay?</Text>

        <SelectionCard
          icon="💵"
          label="Cash"
          description="Paid in cash"
          selected={paymentMethod === 'cash'}
          onPress={() => setPaymentMethod('cash')}
        />

        <SelectionCard
          icon="🏦"
          label="Bank Transfer"
          description="Transferred from bank account"
          selected={paymentMethod === 'bank'}
          onPress={() => setPaymentMethod('bank')}
        />

        <SelectionCard
          icon="💳"
          label="Card/POS"
          description="Paid by debit/credit card"
          selected={paymentMethod === 'card'}
          onPress={() => setPaymentMethod('card')}
        />

        <SelectionCard
          icon="📝"
          label="Cheque"
          description="Issued a cheque"
          selected={paymentMethod === 'cheque'}
          onPress={() => setPaymentMethod('cheque')}
        />
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Complete Purchase ✓"
          onPress={handleContinue}
          disabled={!paymentMethod}
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
  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
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

export default FullPaymentScreen;

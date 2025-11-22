// flows/bankTransfer/screens/TransferTypeSelectionScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SelectionCard from '../../../../components/common/SelectionCard';
import { Theme } from '../../../../constants/theme';

const TransferTypeSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();

  const handleDepositSelect = () => {
    navigateToScreen('Deposit');
  };

  const handleWithdrawalSelect = () => {
    navigateToScreen('Withdrawal');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Question */}
        <Text style={styles.question}>What do you want to do?</Text>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Move money between your cash in hand and bank accounts
          </Text>
        </View>

        {/* Deposit Option */}
        <SelectionCard
          icon="💰"
          label="Deposit Cash to Bank"
          description="Transfer cash from hand to bank account"
          onPress={handleDepositSelect}
        />

        {/* Withdrawal Option */}
        <SelectionCard
          icon="🏧"
          label="Withdraw Cash from Bank"
          description="Transfer money from bank to cash in hand"
          onPress={handleWithdrawalSelect}
        />
      </ScrollView>
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
  infoCard: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
});

export default TransferTypeSelectionScreen;

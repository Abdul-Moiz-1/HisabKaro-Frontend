// screens/AmountEntryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useDynamicForm } from '../../hooks/useDynamicForm';
import { getAmountEntryConfig } from '../../config/forms/amountEntry';
import DynamicFormField from '../../components/DynamicForm/DynamicFormField';
import { Theme, useThemedStyles } from '../../theme';

const AmountEntryScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useThemedStyles(createStyles);

  // @ts-ignore
  const { customer } = route.params;

  const config = getAmountEntryConfig(customer.name, customer.outstanding);

  const { formData, errors, touched, handleChange, handleBlur, validateForm } =
    useDynamicForm(config);

  const [quickAmounts] = useState([
    {
      label: `Full ${customer.outstanding.toLocaleString()}`,
      value: customer.outstanding,
    },
    {
      label: `Half ${(customer.outstanding / 2).toLocaleString()}`,
      value: customer.outstanding / 2,
    },
    ...(customer.outstanding >= 25000 ? [{ label: '25k', value: 25000 }] : []),
    ...(customer.outstanding >= 10000 ? [{ label: '10k', value: 10000 }] : []),
    ...(customer.outstanding >= 5000 ? [{ label: '5k', value: 5000 }] : []),
  ]);

  const handleQuickAmount = (value: number) => {
    handleChange('amount', value.toString());
  };

  const handleContinue = () => {
    if (validateForm()) {
      const amount = parseFloat(formData.amount || '0');
      const remaining = customer.outstanding - amount;

      // Show warning if overpayment
      if (amount > customer.outstanding * 1.1) {
        // Show confirmation modal
        // For now, just navigate
      }

      // @ts-ignore
      navigation.navigate('PaymentMethod', {
        customer,
        amount,
        remaining,
      });
    }
  };

  const calculateRemaining = () => {
    const amount = parseFloat(formData.amount || '0');
    return customer.outstanding - amount;
  };

  const getRemainingColor = () => {
    const remaining = calculateRemaining();
    if (remaining > 0) return '#34C759'; // Green
    if (remaining === 0) return '#007AFF'; // Blue
    return '#FF9500'; // Orange
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{customer.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>{customer.name} owes you:</Text>
          <Text style={styles.infoAmount}>
            PKR {customer.outstanding.toLocaleString()}
          </Text>
        </View>

        <Text style={styles.question}>{config.title}</Text>

        <DynamicFormField
          field={config.sections[0].fields[0]}
          value={formData.amount}
          error={errors.amount}
          touched={touched.amount}
          onChange={(value: number) => handleChange('amount', value)}
          onBlur={() => handleBlur('amount')}
        />

        <View style={styles.quickAmountsContainer}>
          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quick, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(quick.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickAmountText}>{quick.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.remainingCard}>
          <Text style={styles.remainingLabel}>Remaining:</Text>
          <Text
            style={[styles.remainingAmount, { color: getRemainingColor() }]}
          >
            PKR {calculateRemaining().toLocaleString()}
          </Text>
        </View>

        {calculateRemaining() < 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Amount exceeds outstanding. Excess will be recorded as advance
              payment.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!formData.amount || parseFloat(formData.amount) <= 0) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!formData.amount || parseFloat(formData.amount) <= 0}
          activeOpacity={0.7}
        >
          <Text style={styles.continueButtonText}>Continue ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  infoAmount: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  question: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  quickAmountsContainer: {
    marginTop: theme.spacing.lg,
  },
  quickAmountsLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600' as const,
  },
  quickAmounts: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  },
  quickAmountButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  quickAmountText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  remainingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  remainingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  remainingAmount: {
    ...theme.typography.h3,
    fontWeight: 'bold' as const,
  },
  warningCard: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.warning + '20',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center' as const,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  warningText: {
    flex: 1,
    ...theme.typography.caption,
    color: theme.colors.warning,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
});

export default AmountEntryScreen;

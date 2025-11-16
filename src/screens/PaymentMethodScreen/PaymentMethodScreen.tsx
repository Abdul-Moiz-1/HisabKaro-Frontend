// screens/PaymentMethodScreen.tsx
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import { useDynamicForm } from '../../hooks/useDynamicForm';
import { paymentMethodConfig } from '../../config/forms/paymentMethod';
import { Theme, useThemedStyles } from '../../theme';

const PaymentMethodScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useThemedStyles(createStyles);

  // @ts-ignore
  const { customer, amount, remaining } = route.params;

  const { formData, errors, touched, handleChange, handleBlur } =
    useDynamicForm(paymentMethodConfig);

  const handleMethodSelect = (method: string) => {
    handleChange('paymentMethod', method);
    handleBlur('paymentMethod');

    // Navigate based on payment method
    setTimeout(() => {
      switch (method) {
        case 'cash':
        case 'card':
          // @ts-ignore
          navigation.navigate('Confirmation', {
            customer,
            amount,
            remaining,
            paymentMethod: method,
          });
          break;
        case 'bank':
          // @ts-ignore
          navigation.navigate('BankSelection', {
            customer,
            amount,
            remaining,
          });
          break;
        case 'wallet':
          // @ts-ignore
          navigation.navigate('WalletSelection', {
            customer,
            amount,
            remaining,
          });
          break;
        case 'cheque':
          // @ts-ignore
          navigation.navigate('ChequeDetails', {
            customer,
            amount,
            remaining,
          });
          break;
      }
    }, 200);
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
        <Text style={styles.headerTitle}>
          {customer.name} paid PKR {amount.toLocaleString()}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>{paymentMethodConfig.title}</Text>

        <View style={styles.methodsContainer}>
          {paymentMethodConfig.sections[0].fields[0].options?.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.methodCard,
                formData.paymentMethod === option.value &&
                  styles.methodCardSelected,
              ]}
              onPress={() => handleMethodSelect(option.value as string)}
              activeOpacity={0.7}
            >
              <Text style={styles.methodIcon}>{option.icon}</Text>
              <View style={styles.methodContent}>
                <Text
                  style={[
                    styles.methodLabel,
                    formData.paymentMethod === option.value &&
                      styles.methodLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
                <Text style={styles.methodDescription}>
                  {getMethodDescription(option.value as string)}
                </Text>
              </View>
              <View
                style={[
                  styles.checkCircle,
                  formData.paymentMethod === option.value &&
                    styles.checkCircleSelected,
                ]}
              >
                {formData.paymentMethod === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const getMethodDescription = (method: string): string => {
  const descriptions: { [key: string]: string } = {
    cash: 'Received in hand',
    bank: 'Direct to your account',
    wallet: 'JazzCash, Easypaisa, etc.',
    cheque: 'Post-dated or cleared',
    card: 'Credit/Debit card payment',
  };
  return descriptions[method] || '';
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
    ...theme.typography.caption,
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
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  methodsContainer: {
    gap: theme.spacing.md,
  },
  methodCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  methodCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  methodIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  methodContent: {
    flex: 1,
  },
  methodLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  methodLabelSelected: {
    color: theme.colors.primary,
  },
  methodDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkCircleSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});

export default PaymentMethodScreen;

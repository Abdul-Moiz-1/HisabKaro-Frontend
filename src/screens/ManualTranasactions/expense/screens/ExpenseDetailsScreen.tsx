// flows/expense/screens/ExpenseDetailsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';


import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AmountInputField,
  DateField,
  TextAreaField,
  TextInputField,
} from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';

const ExpenseDetailsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { category, prefillAmount } = route.params?.flowData || {};

  const [amount, setAmount] = useState(prefillAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [showOptionalDetails, setShowOptionalDetails] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [billNumber, setBillNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [billPhoto, setBillPhoto] = useState<any>(null);

  // Mock data for variance
  const lastMonthAmount = 7800;
  const averageAmount = 8200;
  const variance =
    amount > 0 ? ((amount - averageAmount) / averageAmount) * 100 : 0;
  const showVariance = Math.abs(variance) > 20;

  const handlePaymentMethodSelect = (method: string) => {
    setPaymentMethod(method);
  };

  const handleAttachPhoto = () => {
    // Simulate photo selection
    Alert.alert('Attach Bill Photo', 'Choose option', [
      {
        text: 'Take Photo',
        onPress: () => {
          setBillPhoto({ uri: 'camera://photo', type: 'camera' });
        },
      },
      {
        text: 'Choose from Gallery',
        onPress: () => {
          setBillPhoto({ uri: 'gallery://photo', type: 'gallery' });
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemovePhoto = () => {
    setBillPhoto(null);
  };

  const handleRecordExpense = () => {
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    // Check if date is in future
    if (date > new Date()) {
      Alert.alert('Error', 'Date cannot be in the future');
      return;
    }

    // Warn if date is too old
    const daysDiff = Math.floor(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysDiff > 30) {
      Alert.alert(
        'Warning',
        'This expense is more than 30 days old. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => proceedToConfirmation(),
          },
        ],
      );
      return;
    }

    // Show variance warning
    if (showVariance && category?.id === 'electricity') {
      const varianceText =
        variance > 0
          ? `${variance.toFixed(0)}% higher than average`
          : `${Math.abs(variance).toFixed(0)}% lower than average`;

      Alert.alert(
        'Unusual Amount',
        `This amount is ${varianceText}. Is this correct?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Continue',
            onPress: () => proceedToConfirmation(),
          },
        ],
      );
      return;
    }

    proceedToConfirmation();
  };

  const proceedToConfirmation = () => {
    // If bank or wallet, navigate to selection
    if (paymentMethod === 'bank') {
      navigateToScreen('BankSelection', {
        category,
        amount,
        date: date.toISOString(),
        vendorName,
        billNumber,
        notes,
        billPhoto,
      });
    } else if (paymentMethod === 'wallet') {
      navigateToScreen('WalletSelection', {
        category,
        amount,
        date: date.toISOString(),
        vendorName,
        billNumber,
        notes,
        billPhoto,
      });
    } else {
      navigateToScreen('Confirmation', {
        category,
        amount,
        paymentMethod: paymentMethod ?? undefined,
        date: date.toISOString(),
        vendorName,
        billNumber,
        notes,
        billPhoto,
      });
    }
  };

  const quickAmounts =
    category?.id === 'electricity'
      ? [
        { label: 'Last: 7.8k', value: lastMonthAmount },
        { label: 'Avg: 8.2k', value: averageAmount },
      ]
      : [
        { label: '5,000', value: 5000 },
        { label: '10,000', value: 10000 },
      ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Header */}
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{category?.icon}</Text>
          <Text style={styles.categoryName}>{category?.name}</Text>
        </View>

        {/* Reference Info */}
        {category?.id === 'electricity' && (
          <View style={styles.referenceCard}>
            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Last month:</Text>
              <Text style={styles.referenceValue}>
                PKR {lastMonthAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Average:</Text>
              <Text style={styles.referenceValue}>
                PKR {averageAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Amount Section */}
        <Text style={styles.question}>How much did you pay?</Text>

        <AmountInputField
          field={{
            id: 'amount',
            name: 'amount',
            label: '',
            required: true,
            type: FieldType.AMOUNT,
          }}
          value={amount}
          onChange={setAmount}
          onBlur={() => { }}
          quickAmounts={quickAmounts}
        />

        {/* Variance Indicator */}
        {showVariance && amount > 0 && (
          <View
            style={[
              styles.varianceCard,
              {
                backgroundColor:
                  variance > 0 ? '#FF9500' + '15' : '#34C759' + '15',
              },
            ]}
          >
            <Icon
              name={variance > 0 ? 'arrow-up' : 'arrow-down'}
              size={20}
              color={variance > 0 ? '#FF9500' : '#34C759'}
            />
            <Text style={styles.varianceText}>
              {variance > 0 ? '+' : ''}
              {variance.toFixed(0)}% {variance > 0 ? 'higher' : 'lower'} than
              average
            </Text>
          </View>
        )}

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>How did you pay?</Text>
        <View style={styles.paymentMethods}>
          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              paymentMethod === 'cash' && styles.paymentMethodButtonSelected,
            ]}
            onPress={() => handlePaymentMethodSelect('cash')}
          >
            <Text style={styles.paymentMethodIcon}>💵</Text>
            <Text
              style={[
                styles.paymentMethodText,
                paymentMethod === 'cash' && styles.paymentMethodTextSelected,
              ]}
            >
              Cash
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              paymentMethod === 'bank' && styles.paymentMethodButtonSelected,
            ]}
            onPress={() => handlePaymentMethodSelect('bank')}
          >
            <Text style={styles.paymentMethodIcon}>🏦</Text>
            <Text
              style={[
                styles.paymentMethodText,
                paymentMethod === 'bank' && styles.paymentMethodTextSelected,
              ]}
            >
              Bank
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              paymentMethod === 'wallet' && styles.paymentMethodButtonSelected,
            ]}
            onPress={() => handlePaymentMethodSelect('wallet')}
          >
            <Text style={styles.paymentMethodIcon}>📱</Text>
            <Text
              style={[
                styles.paymentMethodText,
                paymentMethod === 'wallet' && styles.paymentMethodTextSelected,
              ]}
            >
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethodButton,
              paymentMethod === 'card' && styles.paymentMethodButtonSelected,
            ]}
            onPress={() => handlePaymentMethodSelect('card')}
          >
            <Text style={styles.paymentMethodIcon}>💳</Text>
            <Text
              style={[
                styles.paymentMethodText,
                paymentMethod === 'card' && styles.paymentMethodTextSelected,
              ]}
            >
              Card
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Section */}
        <Text style={styles.sectionTitle}>When?</Text>
        <View style={styles.quickDates}>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date())}
          >
            <Text style={styles.quickDateText}>📅 Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date(Date.now() - 24 * 60 * 60 * 1000))}
          >
            <Text style={styles.quickDateText}>Yesterday</Text>
          </TouchableOpacity>
        </View>

        <DateField
          field={{
            id: 'date',
            name: 'date',
            label: '',
            type: FieldType.DATE,
          }}
          value={date.toISOString()}
          onChange={(value: string) => setDate(new Date(value))}
          onBlur={() => { }}
        />

        {/* Optional Details */}
        <TouchableOpacity
          style={styles.optionalDetailsToggle}
          onPress={() => setShowOptionalDetails(!showOptionalDetails)}
        >
          <Text style={styles.optionalDetailsText}>Optional details</Text>
          <Icon
            name={showOptionalDetails ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#8E8E93"
          />
        </TouchableOpacity>

        {showOptionalDetails && (
          <View style={styles.optionalDetails}>
            <TextInputField
              field={{
                id: 'vendorName',
                name: 'vendorName',
                label: 'Vendor/Payee Name',
                placeholder: 'Enter vendor name',
                maxLength: 100,
                type: FieldType.TEXT,
              }}
              value={vendorName}
              onChange={setVendorName}
              onBlur={() => { }}
            />

            <TextInputField
              field={{
                id: 'billNumber',
                name: 'billNumber',
                label: 'Bill/Reference Number',
                type: FieldType.TEXT,
                placeholder: 'Enter bill number',
              }}
              value={billNumber}
              onChange={setBillNumber}
              onBlur={() => { }}
            />

            <TextAreaField
              field={{
                id: 'notes',
                name: 'notes',
                label: 'Description/Notes',
                placeholder: 'Add any notes...',
                type: FieldType.TEXTAREA,
                numberOfLines: 3,
                maxLength: 500,
              }}
              value={notes}
              onChange={setNotes}
              onBlur={() => { }}
            />
          </View>
        )}

        {/* Attach Photo */}
        <TouchableOpacity
          style={styles.attachPhotoButton}
          onPress={handleAttachPhoto}
        >
          <Icon name="camera-outline" size={20} color="#007AFF" />
          <Text style={styles.attachPhotoText}>
            📸 Attach bill photo (optional)
          </Text>
        </TouchableOpacity>

        {billPhoto && (
          <View style={styles.photoPreview}>
            <View style={styles.photoPlaceholder}>
              <Icon name="image" size={32} color="#8E8E93" />
              <Text style={styles.photoPlaceholderText}>
                Bill photo attached
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={handleRemovePhoto}
            >
              <Icon name="close-circle" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="✓ Record Expense"
          onPress={handleRecordExpense}
          disabled={!amount || !paymentMethod}
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
  categoryHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  referenceCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  referenceRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xs,
  },
  referenceLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  referenceValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  varianceCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  varianceText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  paymentMethods: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center' as const,
  },
  paymentMethodButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  paymentMethodText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  paymentMethodTextSelected: {
    color: theme.colors.primary,
  },
  quickDates: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  quickDateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  quickDateText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  optionalDetailsToggle: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  optionalDetailsText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  optionalDetails: {
    marginTop: theme.spacing.sm,
  },
  attachPhotoButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  attachPhotoText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  photoPreview: {
    position: 'relative' as const,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  photoPlaceholder: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.lg,
  },
  photoPlaceholderText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  removePhotoButton: {
    position: 'absolute' as const,
    top: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default ExpenseDetailsScreen;

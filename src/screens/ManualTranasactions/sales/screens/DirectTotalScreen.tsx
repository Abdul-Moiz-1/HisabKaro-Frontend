// flows/sales/screens/DirectTotalScreen.tsx
import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { setDirectTotal, selectSelectedCustomer, selectIsWalkInSale } from '../../../../store/slices/salesSlice';
import { directTotalSchema, DirectTotalFormValues } from '../schemas/salesSchemas';
import { AmountInputField, DateField } from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { FieldType } from '../../../../types/forms';

const DirectTotalScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const customer = useAppSelector(selectSelectedCustomer);
  const isWalkIn = useAppSelector(selectIsWalkInSale);

  const [date, setDate] = useState(new Date());

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup with Zod validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<DirectTotalFormValues>({
    resolver: zodResolver(directTotalSchema),
    mode: 'onChange',
    defaultValues: {
      total: 0,
      notes: '',
    },
  });

  const totalAmount = watch('total');

  const handleContinue = useCallback(
    (data: DirectTotalFormValues) => {
      // Set direct total in Redux
      dispatch(setDirectTotal(data.total));

      // Navigate to credit terms
      // @ts-ignore
      navigation.navigate('CreditTerms');
    },
    [dispatch, navigation]
  );

  const quickAmounts = [
    { label: '1,000', value: 1000 },
    { label: '5,000', value: 5000 },
    { label: '10,000', value: 10000 },
    { label: '25,000', value: 25000 },
    { label: '50,000', value: 50000 },
  ];

  const customerName = isWalkIn ? 'Walk-in Customer' : customer?.name || 'Customer';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <View style={styles.customerCard}>
          <Text style={styles.customerLabel}>Selling to:</Text>
          <Text style={styles.customerName}>{customerName}</Text>
        </View>

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Enter the total sale amount directly. This is useful when you don't want to add
            individual products.
          </Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>What's the total sale amount?</Text>

        {/* Amount Input with React Hook Form */}
        <Controller
          control={control}
          name="total"
          render={({ field: { onChange, value } }) => (
            <AmountInputField
              field={{
                id: 'amount',
                name: 'amount',
                label: '',
                required: true,
                type: FieldType.AMOUNT,
                placeholder: '0',
                suffix: 'PKR',
              }}
              value={value.toString()}
              onChange={(text) => onChange(parseFloat(text) || 0)}
              error={errors.total?.message}
              quickAmounts={quickAmounts}
              onBlur={() => {}}
            />
          )}
        />

        {/* Summary Card */}
        {totalAmount > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Sale Amount</Text>
              <Text style={styles.summaryValue}>PKR {totalAmount.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Date Section */}
        <Text style={styles.sectionTitle}>Sale Date</Text>
        <View style={styles.quickDates}>
          <TouchableOpacity
            style={styles.quickDateButton}
            onPress={() => setDate(new Date())}
          >
            <Text style={styles.quickDateText}>Today</Text>
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
            id: 'saleDate',
            name: 'saleDate',
            label: '',
            type: FieldType.DATE,
          }}
          value={date.toISOString()}
          onChange={(value: string) => setDate(new Date(value))}
          onBlur={() => {}}
        />
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid || totalAmount <= 0}
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
    customerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    customerLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    customerName: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    infoIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      flex: 1,
      lineHeight: 18,
    },
    question: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 22,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
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
      fontSize: 13,
      color: theme.colors.text.primary,
      fontWeight: '600' as const,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default DirectTotalScreen;

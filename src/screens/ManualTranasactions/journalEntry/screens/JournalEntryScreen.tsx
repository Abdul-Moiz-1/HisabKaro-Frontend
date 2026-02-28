import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  PlusCircleIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  CaretRightIcon,
  RepeatIcon,
} from 'phosphor-react-native';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import ActionButton from '../../../../components/common/ActionButton';
import { DateField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';

import {
  JournalEntryFormValues,
  journalEntrySchema,
  defaultFormValues,
} from '../schema';

import EntryRow from './components/EntryRow';
import RecurringEntryModal from './components/RecurringEntryModal';

import {
  fetchAccounts,
  selectAccounts,
  selectFlatAccounts,
  selectAccountsLoading,
  updateCurrentEntry,
  selectMakeRecurring,
  selectRecurringOptions,
} from '../../../../store/slices/journalEntrySlice';
import { RecurringOptionsFormValues } from '../schema';

const JournalEntryScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Local state
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [variant, setVariant] = useState(1);

  // Redux state
  const accounts = useAppSelector(selectAccounts);
  const flatAccounts = useAppSelector(selectFlatAccounts);
  const accountsLoading = useAppSelector(selectAccountsLoading);
  const makeRecurring = useAppSelector(selectMakeRecurring);
  const recurringOptions = useAppSelector(selectRecurringOptions);

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    mode: 'onChange',
    defaultValues: defaultFormValues as JournalEntryFormValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  // Watch line items for totals calculation
  const lineItems = useWatch({
    control,
    name: 'lineItems',
  });

  // Calculate totals
  const totals = useMemo(() => {
    const totalDebit =
      lineItems?.reduce((sum, item) => sum + (Number(item?.debit) || 0), 0) ||
      0;
    const totalCredit =
      lineItems?.reduce((sum, item) => sum + (Number(item?.credit) || 0), 0) ||
      0;
    const isBalanced = totalDebit === totalCredit && totalDebit > 0;

    return { totalDebit, totalCredit, isBalanced };
  }, [lineItems]);

  // Fetch accounts on mount
  useFocusEffect(
    useCallback(() => {
      if (accounts.length === 0) {
        dispatch(fetchAccounts());
      }
    }, [dispatch, accounts.length]),
  );

  // Handle remove line item
  const handleRemoveLineItem = useCallback(
    (index: number) => {
      if (fields.length > 2) {
        remove(index);
      } else {
        Alert.alert(
          'Cannot Remove',
          'At least 2 line items are required for a journal entry.',
        );
      }
    },
    [fields.length, remove],
  );

  // Handle add line item
  const handleAddLineItem = useCallback(() => {
    append({ accountId: 0, debit: 0, credit: 0 });
  }, [append]);

  // Handle recurring setup
  const handleRecurringSetup = useCallback(
    (settings: RecurringOptionsFormValues) => {
      setValue('makeRecurring', true);
      setValue('recurringOptions', settings);
      setShowRecurringModal(false);
    },
    [setValue],
  );

  // Handle continue to review
  const handleContinueToReview = useCallback(
    (data: JournalEntryFormValues) => {
      dispatch(
        updateCurrentEntry({
          postingDate: data.postingDate,
          lineItems: data.lineItems.map(item => ({
            accountId: item.accountId,
            account: item.account,
            debit: item.debit || 0,
            credit: item.credit || 0,
            partyType: item.partyType,
            partyId: item.partyId,
            remarks: item.remarks,
          })),
          referenceNumber: data.referenceNumber,
          narration: data.narration,
          makeRecurring: data.makeRecurring || false,
          recurringOptions: data.recurringOptions,
        })
      );
      // @ts-ignore
      navigation.navigate('Review');
    },
    [dispatch, navigation],
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date Field */}
          <Controller
            control={control}
            name="postingDate"
            render={({ field: { onChange, value } }) => (
              <DateField
                field={{
                  id: 'postingDate',
                  label: 'Date / Tareekh',
                  name: 'postingDate',
                  type: FieldType.DATE,
                }}
                value={value}
                onChange={onChange}
                error={errors.postingDate?.message}
                onBlur={() => {}}
              />
            )}
          />

          {/* Entry Rows Section */}
          <View style={styles.entriesSection}>
            <View style={styles.entriesSectionHeader}>
              <Text style={styles.entriesSectionTitle}>Entry Rows</Text>
              <TouchableOpacity
                style={styles.variantBadge}
                onPress={() => setVariant(v => (v === 1 ? 2 : 1))}
              >
                <Text style={styles.variantText}>VARIANT {variant}</Text>
              </TouchableOpacity>
            </View>

            {/* Entry Rows */}
            {fields.map((field, index) => (
              <EntryRow
                key={field.id}
                index={index}
                control={control}
                error={errors?.lineItems?.[index] as any}
                accounts={flatAccounts}
                accountsLoading={accountsLoading}
                onDelete={handleRemoveLineItem}
                canDelete={fields.length > 2}
              />
            ))}

            {/* Add More Rows Button */}
            <TouchableOpacity
              style={styles.addRowButton}
              onPress={handleAddLineItem}
            >
              <PlusCircleIcon size={20} color={theme.colors.primary} />
              <Text style={styles.addRowText}>
                Add More Rows / Aur rows shamil karein
              </Text>
            </TouchableOpacity>
          </View>

          {/* Narration Section */}
          <View style={styles.narrationSection}>
            <Text style={styles.narrationLabel}>NARRATION / WAZEHAT</Text>
            <Controller
              control={control}
              name="narration"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  style={styles.narrationInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Description of transaction (Optional)"
                  placeholderTextColor={theme.colors.text.secondary}
                  multiline
                  numberOfLines={2}
                />
              )}
            />
          </View>

          {/* Reference Number Section */}
          <View style={styles.narrationSection}>
            <Text style={styles.narrationLabel}>REFERENCE NUMBER / HAWALA NUMBER (Optional)</Text>
            <Controller
              control={control}
              name="referenceNumber"
              render={({ field: { onChange, value, onBlur } }) => (
                <TextInput
                  style={styles.referenceInput}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g., INV-001, CHQ-123"
                  placeholderTextColor={theme.colors.text.secondary}
                />
              )}
            />
          </View>

          {/* Recurring Entry Option */}
          <TouchableOpacity
            style={[
              styles.recurringButton,
              makeRecurring && styles.recurringButtonActive,
            ]}
            onPress={() => setShowRecurringModal(true)}
          >
            <View
              style={[
                styles.recurringIconContainer,
                makeRecurring && styles.recurringIconContainerActive,
              ]}
            >
              <RepeatIcon
                size={20}
                color={makeRecurring ? '#FFFFFF' : theme.colors.primary}
              />
            </View>
            <View style={styles.recurringTextContainer}>
              <Text style={styles.recurringTitle}>
                {makeRecurring
                  ? recurringOptions?.entryName || 'Recurring Entry Set'
                  : 'Make this a recurring entry'}
              </Text>
              <Text style={styles.recurringSubtitle}>
                {makeRecurring
                  ? `${recurringOptions?.frequencyType} - Tap to edit`
                  : 'Isko bar bar record karein'}
              </Text>
            </View>
            {makeRecurring ? (
              <CheckCircleIcon size={20} color={theme.colors.success} weight="fill" />
            ) : (
              <CaretRightIcon size={20} color={theme.colors.text.secondary} />
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Footer with Totals and Submit */}
        <View style={styles.footer}>
          {/* Totals Row */}
          <View style={styles.totalsRow}>
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>TOTAL DEBIT</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totals.totalDebit)}
              </Text>
            </View>
            <View style={styles.totalItem}>
              <Text style={styles.totalLabel}>TOTAL CREDIT</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(totals.totalCredit)}
              </Text>
            </View>
          </View>

          {/* Balance Status */}
          <View
            style={[
              styles.balanceStatus,
              totals.isBalanced
                ? styles.balanceStatusBalanced
                : styles.balanceStatusUnbalanced,
            ]}
          >
            {totals.isBalanced ? (
              <>
                <CheckCircleIcon
                  size={16}
                  color={theme.colors.success}
                  weight="fill"
                />
                <Text style={styles.balanceStatusTextBalanced}>
                  Accounts Balanced / Hisab barabar hai
                </Text>
              </>
            ) : (
              <>
                <WarningCircleIcon
                  size={16}
                  color={theme.colors.error}
                  weight="fill"
                />
                <Text style={styles.balanceStatusTextUnbalanced}>
                  Accounts Not Balanced / Hisab barabar nahi hai
                </Text>
              </>
            )}
          </View>

          {/* Continue Button */}
          <ActionButton
            title="Continue to Review / Aagay chalein"
            onPress={handleSubmit(handleContinueToReview)}
            variant="primary"
            disabled={!totals.isBalanced}
            icon={<CaretRightIcon size={20} color="#FFFFFF" weight="bold" />}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Recurring Entry Modal */}
      <RecurringEntryModal
        visible={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        onSave={handleRecurringSetup}
        entryTitle={watch('narration') || 'Journal Entry'}
        entryAmount={totals.totalDebit}
        initialSettings={recurringOptions}
      />
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    entriesSection: {
      marginTop: theme.spacing.lg,
    },
    entriesSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    entriesSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    variantBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    variantText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    addRowButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    addRowText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    narrationSection: {
      marginTop: theme.spacing.lg,
    },
    narrationLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    narrationInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 60,
      textAlignVertical: 'top',
    },
    referenceInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    recurringButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    recurringButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}08`,
    },
    recurringIconContainer: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    recurringIconContainerActive: {
      backgroundColor: theme.colors.primary,
    },
    recurringTextContainer: {
      flex: 1,
    },
    recurringTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    recurringSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    footer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    totalsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.md,
    },
    totalItem: {
      alignItems: 'center',
    },
    totalLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    totalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xs,
    },
    balanceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    balanceStatusBalanced: {
      // Green background
    },
    balanceStatusUnbalanced: {
      // Red background
    },
    balanceStatusTextBalanced: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.success,
    },
    balanceStatusTextUnbalanced: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.error,
    },
  });

export default JournalEntryScreen;

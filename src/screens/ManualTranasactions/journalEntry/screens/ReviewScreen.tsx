import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CalendarIcon,
  FileTextIcon,
  NoteIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  RepeatIcon,
  HashIcon,
  ListBulletsIcon,
} from 'phosphor-react-native';

import {
  useTheme,
  useAppDispatch,
  useAppSelector,
} from '../../../../store/hooks';
import {
  selectCurrentEntry,
  selectTotalDebit,
  selectTotalCredit,
  selectIsBalanced,
  selectIsSubmitting,
  selectSubmitError,
  submitJournalEntry,
  clearError,
} from '../../../../store/slices/journalEntrySlice';
import ActionButton from '../../../../components/common/ActionButton';
import { CreateJournalEntryPayload } from '../../../../services/api';

const ReviewScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const currentEntry = useAppSelector(selectCurrentEntry);
  const totalDebit = useAppSelector(selectTotalDebit);
  const totalCredit = useAppSelector(selectTotalCredit);
  const isBalanced = useAppSelector(selectIsBalanced);
  const isSubmitting = useAppSelector(selectIsSubmitting);
  const submitError = useAppSelector(selectSubmitError);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFrequencyLabel = (frequencyType: string) => {
    switch (frequencyType) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly';
      case 'yearly': return 'Yearly';
      default: return frequencyType;
    }
  };

  const validLineItems = useMemo(() => {
    return currentEntry.lineItems.filter(
      item => item.accountId > 0 && (item.debit > 0 || item.credit > 0)
    );
  }, [currentEntry.lineItems]);

  const handleEdit = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleConfirm = useCallback(async () => {
    try {
      dispatch(clearError());

      const payload: CreateJournalEntryPayload = {
        entryType: 'Journal Entry',
        postingDate: currentEntry.postingDate,
        entries: validLineItems.map(item => ({
          accountId: item.accountId,
          debit: item.debit || 0,
          credit: item.credit || 0,
          remarks: item.remarks,
          partyType: item.partyType,
          partyId: item.partyId,
        })),
        referenceNumber: currentEntry.referenceNumber || undefined,
        remarks: currentEntry.narration,
        makeRecurring: currentEntry.makeRecurring,
        recurringOptions: currentEntry.recurringOptions,
      };

      await dispatch(submitJournalEntry(payload)).unwrap();
      // @ts-ignore
      navigation.navigate('Confirmation');
    } catch (err: any) {
      Alert.alert(
        'Entry Failed',
        err.message || 'Failed to post journal entry. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [dispatch, navigation, currentEntry, validLineItems]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review Journal Entry</Text>
          <Text style={styles.headerSubtitle}>
            Please review the details before posting / Post karne se pehle check karein
          </Text>
        </View>

        {/* Error Banner */}
        {submitError && (
          <View style={styles.errorBanner}>
            <WarningCircleIcon size={20} color={theme.colors.error} />
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}

        {/* Date Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CalendarIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.cardTitle}>Posting Date / Tareekh</Text>
          </View>
          <Text style={styles.cardValue}>{formatDate(currentEntry.postingDate)}</Text>
        </View>

        {/* Reference Number Card */}
        {currentEntry.referenceNumber && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <HashIcon size={20} color={theme.colors.primary} weight="fill" />
              <Text style={styles.cardTitle}>Reference Number / Hawala Number</Text>
            </View>
            <Text style={styles.cardValue}>{currentEntry.referenceNumber}</Text>
          </View>
        )}

        {/* Entry Lines Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ListBulletsIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.cardTitle}>Entry Lines / Entries</Text>
          </View>

          {/* Column Headers */}
          <View style={styles.entryHeader}>
            <Text style={[styles.entryHeaderText, styles.accountColumn]}>Account</Text>
            <Text style={[styles.entryHeaderText, styles.amountColumn]}>Debit</Text>
            <Text style={[styles.entryHeaderText, styles.amountColumn]}>Credit</Text>
          </View>

          {/* Entry Rows */}
          {validLineItems.map((item, index) => (
            <View key={index} style={styles.entryRow}>
              <View style={styles.accountColumn}>
                <Text style={styles.accountName} numberOfLines={1}>
                  {item.account?.accountName || `Account #${item.accountId}`}
                </Text>
                {item.account?.accountCode && (
                  <Text style={styles.accountCode}>{item.account.accountCode}</Text>
                )}
              </View>
              <Text style={[styles.amountText, styles.amountColumn]}>
                {item.debit > 0 ? formatCurrency(item.debit) : '-'}
              </Text>
              <Text style={[styles.amountText, styles.amountColumn]}>
                {item.credit > 0 ? formatCurrency(item.credit) : '-'}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Totals Row */}
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Total</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totalDebit)}</Text>
            <Text style={styles.totalsValue}>{formatCurrency(totalCredit)}</Text>
          </View>

          {/* Balance Status */}
          <View
            style={[
              styles.balanceStatus,
              isBalanced ? styles.balanceStatusBalanced : styles.balanceStatusUnbalanced,
            ]}
          >
            {isBalanced ? (
              <>
                <CheckCircleIcon size={18} color={theme.colors.success} weight="fill" />
                <Text style={styles.balanceTextBalanced}>
                  Accounts Balanced / Hisab barabar hai
                </Text>
              </>
            ) : (
              <>
                <WarningCircleIcon size={18} color={theme.colors.error} weight="fill" />
                <Text style={styles.balanceTextUnbalanced}>
                  Accounts Not Balanced / Hisab barabar nahi hai
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Narration Card */}
        {currentEntry.narration && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <NoteIcon size={20} color={theme.colors.primary} weight="fill" />
              <Text style={styles.cardTitle}>Narration / Wazehat</Text>
            </View>
            <Text style={styles.cardValue}>{currentEntry.narration}</Text>
          </View>
        )}

        {/* Recurring Entry Card */}
        {currentEntry.makeRecurring && currentEntry.recurringOptions && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <RepeatIcon size={20} color={theme.colors.primary} weight="fill" />
              <Text style={styles.cardTitle}>Recurring Entry / Bar Bar Hone Wali Entry</Text>
            </View>

            <View style={styles.recurringDetails}>
              <View style={styles.recurringRow}>
                <Text style={styles.recurringLabel}>Entry Name:</Text>
                <Text style={styles.recurringValue}>
                  {currentEntry.recurringOptions.entryName}
                </Text>
              </View>

              <View style={styles.recurringRow}>
                <Text style={styles.recurringLabel}>Frequency:</Text>
                <Text style={styles.recurringValue}>
                  Every {currentEntry.recurringOptions.frequencyInterval}{' '}
                  {getFrequencyLabel(currentEntry.recurringOptions.frequencyType)}
                  {(currentEntry.recurringOptions.frequencyType === 'monthly' ||
                    currentEntry.recurringOptions.frequencyType === 'yearly') &&
                    currentEntry.recurringOptions.dayOfMonth &&
                    ` on day ${currentEntry.recurringOptions.dayOfMonth}`}
                </Text>
              </View>

              <View style={styles.recurringRow}>
                <Text style={styles.recurringLabel}>Start Date:</Text>
                <Text style={styles.recurringValue}>
                  {formatDate(currentEntry.recurringOptions.startDate)}
                </Text>
              </View>

              {currentEntry.recurringOptions.endDate && (
                <View style={styles.recurringRow}>
                  <Text style={styles.recurringLabel}>End Date:</Text>
                  <Text style={styles.recurringValue}>
                    {formatDate(currentEntry.recurringOptions.endDate)}
                  </Text>
                </View>
              )}

              <View style={styles.recurringBadges}>
                {currentEntry.recurringOptions.autoGenerate && (
                  <View style={styles.recurringBadge}>
                    <Text style={styles.recurringBadgeText}>Auto Generate</Text>
                  </View>
                )}
                {currentEntry.recurringOptions.autoPost && (
                  <View style={[styles.recurringBadge, styles.recurringBadgeWarning]}>
                    <Text style={styles.recurringBadgeTextWarning}>Auto Post</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <ActionButton
            title="Edit"
            onPress={handleEdit}
            variant="outline"
            style={styles.editButton}
            disabled={isSubmitting}
          />
          <ActionButton
            title={isSubmitting ? 'Posting...' : 'Post Entry / Entry Darj Karein'}
            onPress={handleConfirm}
            variant="primary"
            style={styles.confirmButton}
            disabled={isSubmitting || !isBalanced}
          />
        </View>
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Posting journal entry...</Text>
          </View>
        )}
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
    header: {
      marginBottom: theme.spacing.lg,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.error}15`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    errorText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.error,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    cardValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    entryHeader: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    entryHeaderText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    accountColumn: {
      flex: 2,
    },
    amountColumn: {
      flex: 1,
      textAlign: 'right',
    },
    entryRow: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      alignItems: 'center',
    },
    accountName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    accountCode: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    amountText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sm,
    },
    totalsRow: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
    },
    totalsLabel: {
      flex: 2,
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    totalsValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: 'right',
    },
    balanceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    balanceStatusBalanced: {
      backgroundColor: `${theme.colors.success}15`,
    },
    balanceStatusUnbalanced: {
      backgroundColor: `${theme.colors.error}15`,
    },
    balanceTextBalanced: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.success,
    },
    balanceTextUnbalanced: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.error,
    },
    recurringDetails: {
      gap: theme.spacing.sm,
    },
    recurringRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    recurringLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    recurringValue: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.primary,
      flex: 2,
      textAlign: 'right',
    },
    recurringBadges: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      flexWrap: 'wrap',
    },
    recurringBadge: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    recurringBadgeWarning: {
      backgroundColor: `${theme.colors.warning}15`,
    },
    recurringBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    recurringBadgeTextWarning: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    footerButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    editButton: {
      flex: 1,
    },
    confirmButton: {
      flex: 2,
    },
    loadingOverlay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });

export default ReviewScreen;

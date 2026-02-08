import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  ShareNetworkIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  CalendarIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../store/hooks';
import { accountingApi, TrialBalance } from '../../services/api/accounting';
import ExportReportModal from './components/ExportReportModal';

interface TrialBalanceAccount {
  accountId: number;
  accountCode: string;
  accountName: string;
  rootType: string;
  debit: number;
  credit: number;
}

const TrialBalanceScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [report, setReport] = useState<TrialBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [includeZeroBalance, setIncludeZeroBalance] = useState(false);

  // Get as of date (today)
  const asOfDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Fetch report
  const fetchReport = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await accountingApi.getTrialBalance(asOfDate, includeZeroBalance);
        setReport(response.data);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch trial balance',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [asOfDate, includeZeroBalance]
  );

  useEffect(() => {
    fetchReport();
  }, [includeZeroBalance]);

  // Group accounts by root type
  const groupedAccounts = useMemo(() => {
    if (!report?.accounts) return {};

    const groups: Record<string, TrialBalanceAccount[]> = {
      Asset: [],
      Liability: [],
      Equity: [],
      Income: [],
      Expense: [],
    };

    report.accounts.forEach((account) => {
      if (groups[account.rootType]) {
        groups[account.rootType].push(account);
      }
    });

    return groups;
  }, [report]);

  // Format helpers
  const formatCurrency = (amount: number) => {
    if (amount === 0) return '-';
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Get root type color
  const getRootTypeColor = (rootType: string) => {
    switch (rootType) {
      case 'Asset':
        return theme.colors.primary;
      case 'Liability':
        return '#FF6B35';
      case 'Equity':
        return '#8B5CF6';
      case 'Income':
        return theme.colors.success;
      case 'Expense':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  // Render account row
  const renderAccountRow = ({ item }: { item: TrialBalanceAccount }) => (
    <View style={styles.accountRow}>
      <View style={styles.accountInfo}>
        <Text style={styles.accountName}>{item.accountName}</Text>
        <Text style={styles.accountCode}>{item.accountCode}</Text>
      </View>
      <Text style={[styles.debitValue, item.debit === 0 && styles.zeroValue]}>
        {formatCurrency(item.debit)}
      </Text>
      <Text style={[styles.creditValue, item.credit === 0 && styles.zeroValue]}>
        {formatCurrency(item.credit)}
      </Text>
    </View>
  );

  // Render section
  const renderSection = (rootType: string, accounts: TrialBalanceAccount[]) => {
    if (accounts.length === 0) return null;

    const sectionDebit = accounts.reduce((sum, acc) => sum + acc.debit, 0);
    const sectionCredit = accounts.reduce((sum, acc) => sum + acc.credit, 0);

    return (
      <View key={rootType} style={styles.section}>
        <View
          style={[
            styles.sectionHeader,
            { backgroundColor: `${getRootTypeColor(rootType)}15` },
          ]}
        >
          <View
            style={[
              styles.sectionIndicator,
              { backgroundColor: getRootTypeColor(rootType) },
            ]}
          />
          <Text style={styles.sectionTitle}>{rootType.toUpperCase()}S</Text>
          <View style={styles.sectionTotals}>
            <Text style={styles.sectionDebit}>
              {sectionDebit > 0 ? formatCurrency(sectionDebit) : ''}
            </Text>
            <Text style={styles.sectionCredit}>
              {sectionCredit > 0 ? formatCurrency(sectionCredit) : ''}
            </Text>
          </View>
        </View>

        {accounts.map((account) => (
          <View key={account.accountId}>{renderAccountRow({ item: account })}</View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeftIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Trial Balance</Text>
          <Text style={styles.headerSubtitle}>Mizaan e Aazmaish</Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShowExportModal(true)}
        >
          <ShareNetworkIcon size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Date Header */}
      <View style={styles.dateHeader}>
        <View style={styles.dateInfo}>
          <CalendarIcon size={18} color={theme.colors.primary} />
          <Text style={styles.dateText}>As of {formatDate(asOfDate)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.zeroBalanceToggle,
            includeZeroBalance && styles.zeroBalanceToggleActive,
          ]}
          onPress={() => setIncludeZeroBalance(!includeZeroBalance)}
        >
          <Text
            style={[
              styles.zeroBalanceText,
              includeZeroBalance && styles.zeroBalanceTextActive,
            ]}
          >
            Show Zero
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading trial balance...</Text>
        </View>
      ) : report ? (
        <>
          {/* Balance Status */}
          <View
            style={[
              styles.balanceStatus,
              report.isBalanced ? styles.balanced : styles.unbalanced,
            ]}
          >
            {report.isBalanced ? (
              <>
                <CheckCircleIcon size={20} color={theme.colors.success} weight="fill" />
                <Text style={styles.balanceStatusTextBalanced}>
                  Books are Balanced / Hisab barabar hai
                </Text>
              </>
            ) : (
              <>
                <WarningCircleIcon size={20} color={theme.colors.error} weight="fill" />
                <Text style={styles.balanceStatusTextUnbalanced}>
                  Books are NOT Balanced / Hisab barabar nahi hai
                </Text>
              </>
            )}
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>ACCOUNT</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>
              DEBIT
            </Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>
              CREDIT
            </Text>
          </View>

          {/* Accounts List */}
          <FlatList
            data={Object.entries(groupedAccounts)}
            keyExtractor={([rootType]) => rootType}
            renderItem={({ item: [rootType, accounts] }) =>
              renderSection(rootType, accounts)
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchReport(true)}
                tintColor={theme.colors.primary}
              />
            }
            ListFooterComponent={
              <View style={styles.totalsRow}>
                <View style={styles.totalsLabel}>
                  <Text style={styles.totalsLabelText}>GRAND TOTAL</Text>
                </View>
                <Text style={styles.totalDebit}>
                  {formatCurrency(report.totalDebit)}
                </Text>
                <Text style={styles.totalCredit}>
                  {formatCurrency(report.totalCredit)}
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptySubtitle}>
            No accounts found for trial balance
          </Text>
        </View>
      )}

      {/* Export Modal */}
      <ExportReportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportTitle="Trial Balance"
        reportDateRange={`As of ${formatDate(asOfDate)}`}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    shareButton: {
      padding: theme.spacing.xs,
    },
    dateHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    dateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    dateText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    zeroBalanceToggle: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    zeroBalanceToggleActive: {
      backgroundColor: `${theme.colors.primary}15`,
      borderColor: theme.colors.primary,
    },
    zeroBalanceText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    zeroBalanceTextActive: {
      color: theme.colors.primary,
    },
    balanceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    balanced: {
      backgroundColor: `${theme.colors.success}15`,
    },
    unbalanced: {
      backgroundColor: `${theme.colors.error}15`,
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
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    tableHeaderText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    listContent: {
      paddingBottom: 100,
    },
    section: {
      marginBottom: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
    },
    sectionIndicator: {
      width: 4,
      height: 20,
      borderRadius: 2,
      marginRight: theme.spacing.sm,
    },
    sectionTitle: {
      flex: 2,
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text.primary,
      letterSpacing: 0.5,
    },
    sectionTotals: {
      flex: 2,
      flexDirection: 'row',
    },
    sectionDebit: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
    },
    sectionCredit: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
    },
    accountRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    accountInfo: {
      flex: 2,
      paddingLeft: theme.spacing.lg,
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
    debitValue: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
    },
    creditValue: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'right',
    },
    zeroValue: {
      color: theme.colors.text.disabled,
    },
    totalsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.primary,
      marginTop: theme.spacing.sm,
    },
    totalsLabel: {
      flex: 2,
    },
    totalsLabelText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    totalDebit: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'right',
    },
    totalCredit: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
      textAlign: 'right',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
  });

export default TrialBalanceScreen;

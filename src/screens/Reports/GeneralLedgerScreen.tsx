import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  FunnelIcon,
  CaretDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  ShareNetworkIcon,
  CheckIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme, useAppDispatch, useAppSelector } from '../../store/hooks';
import { accountingApi, Account, GLReport, GLEntry } from '../../services/api/accounting';
import DateFilterTabs, { DateFilterOption } from './components/DateFilterTabs';
import ExportReportModal from './components/ExportReportModal';
import CustomDateRangeModal from './components/CustomDateRangeModal';

interface GroupedEntries {
  date: string;
  dateLabel: string;
  entries: GLEntry[];
}

const GeneralLedgerScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [glReport, setGlReport] = useState<GLReport | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('thisMonth');
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<string | undefined>();
  const [customToDate, setCustomToDate] = useState<string | undefined>();

  // Calculate date range
  const getDateRange = useCallback((filter: DateFilterOption) => {
    const today = new Date();
    let fromDate: Date;

    switch (filter) {
      case 'thisMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          from: fromDate.toISOString().split('T')[0],
          to: lastDayOfLastMonth.toISOString().split('T')[0],
        };
      case 'last30Days':
        fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customFromDate && customToDate) {
          return { from: customFromDate, to: customToDate };
        }
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      from: fromDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }, [customFromDate, customToDate]);

  // Fetch accounts
  const fetchAccounts = useCallback(async () => {
    try {
      const data = await accountingApi.getAccounts({ flat: true });
      const leafAccounts = data.filter((acc) => !acc.isGroup);
      setAccounts(leafAccounts);

      // Set default account (first cash or bank account)
      if (!selectedAccount && leafAccounts.length > 0) {
        const defaultAccount =
          leafAccounts.find(
            (acc) => acc.accountType === 'Cash' || acc.accountType === 'Bank'
          ) || leafAccounts[0];
        setSelectedAccount(defaultAccount);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch accounts',
      });
    }
  }, [selectedAccount]);

  // Fetch GL Report
  const fetchGLReport = useCallback(
    async (isRefresh = false) => {
      if (!selectedAccount) return;

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const { from, to } = getDateRange(dateFilter);
        const response = await accountingApi.getGLReport({
          accountId: selectedAccount.id,
          fromDate: from,
          toDate: to,
        });

        setGlReport(response.data);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch ledger report',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedAccount, dateFilter, getDateRange]
  );

  // Initial fetch
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Fetch GL when account or date changes
  useEffect(() => {
    if (selectedAccount) {
      fetchGLReport();
    }
  }, [selectedAccount, dateFilter, customFromDate, customToDate]);

  const handleCustomDateApply = useCallback((from: string, to: string) => {
    setCustomFromDate(from);
    setCustomToDate(to);
    setDateFilter('custom');
  }, []);

  const customDateLabel = useMemo(() => {
    if (dateFilter === 'custom' && customFromDate && customToDate) {
      const f = new Date(customFromDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const t = new Date(customToDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return `${f} - ${t}`;
    }
    return undefined;
  }, [dateFilter, customFromDate, customToDate]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    if (!glReport?.entries || glReport.entries.length === 0) return [];

    const groups: Record<string, GLEntry[]> = {};

    glReport.entries.forEach((entry) => {
      const date = entry.postingDate.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, entries]) => {
        let dateLabel = '';
        if (date === today) {
          dateLabel = `TODAY, ${formatDateShort(date)}`;
        } else if (date === yesterday) {
          dateLabel = `YESTERDAY, ${formatDateShort(date)}`;
        } else {
          dateLabel = formatDateShort(date).toUpperCase();
        }

        return { date, dateLabel, entries };
      });
  }, [glReport]);

  // Filtered accounts for selector
  const filteredAccounts = useMemo(() => {
    if (!accountSearchQuery) return accounts;
    const query = accountSearchQuery.toLowerCase();
    return accounts.filter(
      (acc) =>
        acc.accountName.toLowerCase().includes(query) ||
        acc.accountCode.toLowerCase().includes(query)
    );
  }, [accounts, accountSearchQuery]);

  // Format helpers
  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${Math.abs(amount).toLocaleString()}`;
  };

  const getDateRangeLabel = () => {
    const { from, to } = getDateRange(dateFilter);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return `${fromDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${toDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  // Render account selector modal
  const renderAccountSelector = () => (
    <Modal
      visible={showAccountSelector}
      animationType="slide"
      transparent
      onRequestClose={() => setShowAccountSelector(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowAccountSelector(false)}
      >
        <Pressable
          style={styles.accountSelectorContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalHandle} />

          <Text style={styles.modalTitle}>Select Account</Text>

          {/* Search */}
          <View style={styles.searchContainer}>
            <MagnifyingGlassIcon size={18} color={theme.colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search accounts..."
              placeholderTextColor={theme.colors.text.secondary}
              value={accountSearchQuery}
              onChangeText={setAccountSearchQuery}
            />
          </View>

          {/* Account List */}
          <FlatList
            data={filteredAccounts}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.accountList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.accountOption,
                  selectedAccount?.id === item.id && styles.accountOptionSelected,
                ]}
                onPress={() => {
                  setSelectedAccount(item);
                  setShowAccountSelector(false);
                  setAccountSearchQuery('');
                }}
              >
                <View style={styles.accountOptionInfo}>
                  <Text style={styles.accountOptionName}>{item.accountName}</Text>
                  <Text style={styles.accountOptionCode}>
                    {item.accountCode} • {item.rootType}
                  </Text>
                </View>
                {selectedAccount?.id === item.id && (
                  <CheckIcon size={20} color={theme.colors.primary} weight="bold" />
                )}
              </TouchableOpacity>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );

  // Render entry row
  const renderEntryRow = ({ item }: { item: GLEntry }) => {
    const isDebit = item.debit > 0;

    return (
      <View style={styles.entryRow}>
        <View style={styles.entryInfo}>
          <Text style={styles.entryNarration} numberOfLines={1}>
            {item.remarks || item.voucherType}
          </Text>
          <Text style={styles.entryVoucher}>{item.voucherNumber}</Text>
        </View>

        <View style={styles.entryAmounts}>
          {isDebit ? (
            <View style={styles.debitAmount}>
              <ArrowUpIcon size={14} color={theme.colors.success} />
              <Text style={styles.debitText}>DR {formatCurrency(item.debit)}</Text>
            </View>
          ) : (
            <View style={styles.creditAmount}>
              <ArrowDownIcon size={14} color={theme.colors.error} />
              <Text style={styles.creditText}>CR {formatCurrency(item.credit)}</Text>
            </View>
          )}
        </View>

        <View style={styles.balanceColumn}>
          <Text style={styles.balanceValue}>{formatCurrency(item.runningBalance)}</Text>
        </View>
      </View>
    );
  };

  // Render date section
  const renderDateSection = ({ item }: { item: GroupedEntries }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateSectionLabel}>{item.dateLabel}</Text>
      {item.entries.map((entry, index) => (
        <View key={`${entry.id}-${index}`}>{renderEntryRow({ item: entry })}</View>
      ))}
    </View>
  );

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
          <Text style={styles.headerTitle}>General Ledger</Text>
          <Text style={styles.headerSubtitle}>Khaata / Ledger</Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShowExportModal(true)}
        >
          <ShareNetworkIcon size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Account Selector */}
      <TouchableOpacity
        style={styles.accountSelector}
        onPress={() => setShowAccountSelector(true)}
      >
        <View style={styles.accountSelectorContent}>
          <Text style={styles.accountSelectorLabel}>SELECTED ACCOUNT</Text>
          <Text style={styles.accountSelectorValue}>
            {selectedAccount?.accountName || 'Select Account'}
          </Text>
          {glReport && (
            <Text style={styles.previousBalance}>
              Previous Balance: {formatCurrency(glReport.openingBalance)}
            </Text>
          )}
        </View>
        <CaretDownIcon size={20} color={theme.colors.text.secondary} />
      </TouchableOpacity>

      {/* Date Filters */}
      <DateFilterTabs
        selected={dateFilter}
        onSelect={setDateFilter}
        onCustomPress={() => setShowDateRangeModal(true)}
        showCustomDate={dateFilter === 'custom' && !!customDateLabel}
        customDateLabel={customDateLabel}
      />

      {/* Summary Cards */}
      {glReport && (
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryCardIn]}>
            <View style={styles.summaryIconContainer}>
              <ArrowUpIcon size={20} color={theme.colors.success} weight="bold" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>TOTAL IN / JAMA</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                +{formatCurrency(glReport.totalDebit)}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryCard, styles.summaryCardOut]}>
            <View style={styles.summaryIconContainerOut}>
              <ArrowDownIcon size={20} color={theme.colors.error} weight="bold" />
            </View>
            <View>
              <Text style={styles.summaryLabel}>TOTAL OUT / KHARCHA</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                -{formatCurrency(glReport.totalCredit)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading ledger...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedEntries}
          renderItem={renderDateSection}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchGLReport(true)}
              tintColor={theme.colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>NARRATION</Text>
              <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>DR/CR</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>
                BALANCE
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptySubtitle}>
                No transactions found for this period
              </Text>
            </View>
          }
        />
      )}

      {/* Account Selector Modal */}
      {renderAccountSelector()}

      {/* Export Modal */}
      <ExportReportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportTitle={`${selectedAccount?.accountName || 'General'} Ledger`}
        reportDateRange={getDateRangeLabel()}
      />

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onApply={handleCustomDateApply}
        initialFromDate={customFromDate}
        initialToDate={customToDate}
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
    accountSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    accountSelectorContent: {
      flex: 1,
    },
    accountSelectorLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    accountSelectorValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 2,
    },
    previousBalance: {
      fontSize: 12,
      color: theme.colors.primary,
      marginTop: 4,
    },
    summaryContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.sm,
    },
    summaryCardIn: {
      backgroundColor: `${theme.colors.success}15`,
    },
    summaryCardOut: {
      backgroundColor: `${theme.colors.error}15`,
    },
    summaryIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.success}20`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    summaryIconContainerOut: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.error}20`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 2,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    tableHeaderText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    dateSection: {
      marginBottom: theme.spacing.lg,
    },
    dateSectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
    },
    entryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    entryInfo: {
      flex: 2,
    },
    entryNarration: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    entryVoucher: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    entryAmounts: {
      flex: 1.5,
    },
    debitAmount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    debitText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.success,
    },
    creditAmount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    creditText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.error,
    },
    balanceColumn: {
      flex: 1,
      alignItems: 'flex-end',
    },
    balanceValue: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text.primary,
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
      paddingVertical: theme.spacing.xxl * 2,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    accountSelectorContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: theme.spacing.xl,
      maxHeight: '80%',
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    accountList: {
      paddingHorizontal: theme.spacing.md,
    },
    accountOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    accountOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    },
    accountOptionInfo: {
      flex: 1,
    },
    accountOptionName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    accountOptionCode: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
  });

export default GeneralLedgerScreen;

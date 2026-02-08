import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  TrendUpIcon,
  TrendDownIcon,
  ShareNetworkIcon,
  CaretRightIcon,
  ChartLineUpIcon,
  ChartLineDownIcon,
  ScalesIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../store/hooks';
import { accountingApi, ProfitLoss } from '../../services/api/accounting';
import DateFilterTabs, { DateFilterOption } from './components/DateFilterTabs';
import ExportReportModal from './components/ExportReportModal';

const ProfitLossScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [report, setReport] = useState<ProfitLoss | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('thisMonth');
  const [showExportModal, setShowExportModal] = useState(false);
  const [expandedIncome, setExpandedIncome] = useState(true);
  const [expandedExpenses, setExpandedExpenses] = useState(true);

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
      default:
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      from: fromDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
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

        const { from, to } = getDateRange(dateFilter);
        const response = await accountingApi.getProfitLoss(from, to);
        setReport(response.data);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch profit & loss report',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateFilter, getDateRange]
  );

  useEffect(() => {
    fetchReport();
  }, [dateFilter]);

  // Format helpers
  const formatCurrency = (amount: number) => {
    return `PKR ${Math.abs(amount).toLocaleString()}`;
  };

  const getDateRangeLabel = () => {
    const { from, to } = getDateRange(dateFilter);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    return `${fromDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${toDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  // Calculate profit margin
  const profitMargin = useMemo(() => {
    if (!report || report.totalIncome === 0) return 0;
    return ((report.netProfitLoss / report.totalIncome) * 100).toFixed(1);
  }, [report]);

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
          <Text style={styles.headerTitle}>Profit & Loss</Text>
          <Text style={styles.headerSubtitle}>Nafa Nuqsaan</Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => setShowExportModal(true)}
        >
          <ShareNetworkIcon size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Date Filters */}
      <DateFilterTabs selected={dateFilter} onSelect={setDateFilter} />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading report...</Text>
        </View>
      ) : report ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchReport(true)}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Net Profit/Loss Card */}
          <View
            style={[
              styles.resultCard,
              report.isProfit ? styles.profitCard : styles.lossCard,
            ]}
          >
            <View style={styles.resultIconContainer}>
              <ScalesIcon
                size={32}
                color={report.isProfit ? theme.colors.success : theme.colors.error}
                weight="fill"
              />
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultLabel}>
                {report.isProfit ? 'NET PROFIT / NAFA' : 'NET LOSS / NUQSAAN'}
              </Text>
              <Text
                style={[
                  styles.resultValue,
                  { color: report.isProfit ? theme.colors.success : theme.colors.error },
                ]}
              >
                {report.isProfit ? '+' : '-'}
                {formatCurrency(report.netProfitLoss)}
              </Text>
              <Text style={styles.profitMargin}>
                Profit Margin: {profitMargin}%
              </Text>
            </View>
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.incomeCard]}>
              <View style={styles.summaryHeader}>
                <TrendUpIcon size={20} color={theme.colors.success} weight="bold" />
                <Text style={styles.summaryLabel}>TOTAL INCOME</Text>
              </View>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatCurrency(report.totalIncome)}
              </Text>
              <Text style={styles.summarySubtext}>Kul Aamdani</Text>
            </View>

            <View style={[styles.summaryCard, styles.expenseCard]}>
              <View style={styles.summaryHeader}>
                <TrendDownIcon size={20} color={theme.colors.error} weight="bold" />
                <Text style={styles.summaryLabel}>TOTAL EXPENSES</Text>
              </View>
              <Text style={[styles.summaryValue, { color: theme.colors.error }]}>
                {formatCurrency(report.totalExpenses)}
              </Text>
              <Text style={styles.summarySubtext}>Kul Kharcha</Text>
            </View>
          </View>

          {/* Income Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setExpandedIncome(!expandedIncome)}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.success}15` }]}>
                <ChartLineUpIcon size={20} color={theme.colors.success} weight="fill" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Income</Text>
                <Text style={styles.sectionSubtitle}>Aamdani</Text>
              </View>
            </View>
            <View style={styles.sectionHeaderRight}>
              <Text style={[styles.sectionTotal, { color: theme.colors.success }]}>
                {formatCurrency(report.totalIncome)}
              </Text>
              <CaretRightIcon
                size={20}
                color={theme.colors.text.secondary}
                style={{
                  transform: [{ rotate: expandedIncome ? '90deg' : '0deg' }],
                }}
              />
            </View>
          </TouchableOpacity>

          {expandedIncome && (
            <View style={styles.sectionContent}>
              {report.income.map((item, index) => (
                <View key={item.accountId} style={styles.lineItem}>
                  <View style={styles.lineItemInfo}>
                    <Text style={styles.lineItemName}>{item.accountName}</Text>
                    <Text style={styles.lineItemCode}>{item.accountCode}</Text>
                  </View>
                  <Text style={[styles.lineItemAmount, { color: theme.colors.success }]}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))}
              {report.income.length === 0 && (
                <Text style={styles.emptyText}>No income recorded</Text>
              )}
            </View>
          )}

          {/* Expenses Section */}
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setExpandedExpenses(!expandedExpenses)}
          >
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: `${theme.colors.error}15` }]}>
                <ChartLineDownIcon size={20} color={theme.colors.error} weight="fill" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Expenses</Text>
                <Text style={styles.sectionSubtitle}>Kharcha</Text>
              </View>
            </View>
            <View style={styles.sectionHeaderRight}>
              <Text style={[styles.sectionTotal, { color: theme.colors.error }]}>
                {formatCurrency(report.totalExpenses)}
              </Text>
              <CaretRightIcon
                size={20}
                color={theme.colors.text.secondary}
                style={{
                  transform: [{ rotate: expandedExpenses ? '90deg' : '0deg' }],
                }}
              />
            </View>
          </TouchableOpacity>

          {expandedExpenses && (
            <View style={styles.sectionContent}>
              {report.expenses.map((item, index) => (
                <View key={item.accountId} style={styles.lineItem}>
                  <View style={styles.lineItemInfo}>
                    <Text style={styles.lineItemName}>{item.accountName}</Text>
                    <Text style={styles.lineItemCode}>{item.accountCode}</Text>
                  </View>
                  <Text style={[styles.lineItemAmount, { color: theme.colors.error }]}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ))}
              {report.expenses.length === 0 && (
                <Text style={styles.emptyText}>No expenses recorded</Text>
              )}
            </View>
          )}

          {/* Visual Bar */}
          <View style={styles.visualContainer}>
            <Text style={styles.visualTitle}>Income vs Expenses</Text>
            <View style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <Text style={styles.barLabel}>Income</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      styles.incomeBar,
                      {
                        width: `${
                          report.totalIncome > report.totalExpenses
                            ? 100
                            : (report.totalIncome / report.totalExpenses) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.barWrapper}>
                <Text style={styles.barLabel}>Expenses</Text>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      styles.expenseBar,
                      {
                        width: `${
                          report.totalExpenses > report.totalIncome
                            ? 100
                            : (report.totalExpenses / report.totalIncome) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptySubtitle}>
            No transactions found for this period
          </Text>
        </View>
      )}

      {/* Export Modal */}
      <ExportReportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportTitle="Profit & Loss Statement"
        reportDateRange={getDateRangeLabel()}
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing.md,
      paddingBottom: 100,
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
    resultCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      marginBottom: theme.spacing.md,
    },
    profitCard: {
      backgroundColor: `${theme.colors.success}15`,
      borderWidth: 1,
      borderColor: `${theme.colors.success}30`,
    },
    lossCard: {
      backgroundColor: `${theme.colors.error}15`,
      borderWidth: 1,
      borderColor: `${theme.colors.error}30`,
    },
    resultIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    resultContent: {
      flex: 1,
    },
    resultLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    resultValue: {
      fontSize: 28,
      fontWeight: '800',
      marginTop: 4,
    },
    profitMargin: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 4,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    summaryCard: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    incomeCard: {
      backgroundColor: `${theme.colors.success}10`,
    },
    expenseCard: {
      backgroundColor: `${theme.colors.error}10`,
    },
    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: '700',
    },
    summarySubtext: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    sectionHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sectionTotal: {
      fontSize: 16,
      fontWeight: '700',
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    lineItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    lineItemInfo: {
      flex: 1,
    },
    lineItemName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    lineItemCode: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    lineItemAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.md,
    },
    visualContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    visualTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    barContainer: {
      gap: theme.spacing.md,
    },
    barWrapper: {
      gap: theme.spacing.xs,
    },
    barLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    barBackground: {
      height: 12,
      backgroundColor: theme.colors.border,
      borderRadius: 6,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      borderRadius: 6,
    },
    incomeBar: {
      backgroundColor: theme.colors.success,
    },
    expenseBar: {
      backgroundColor: theme.colors.error,
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

export default ProfitLossScreen;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  ChartPieIcon,
  ChartLineUpIcon,
  FileTextIcon,
  CurrencyCircleDollarIcon,
  UsersIcon,
  TruckIcon,
  WarningCircleIcon,
  CalendarIcon,
  ArrowRightIcon,
  DownloadSimpleIcon,
  BookOpenIcon,
  ListNumbersIcon,
  ScalesIcon,
  ReceiptIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation } from '../../components/common';
import { useTheme } from '../../store/hooks';
import {
  reportsApi,
  DashboardData,
  accountingApi,
  AgedReceivables,
  AgedPayables,
  ProfitLoss,
} from '../../services/api';

type DateRange = 'today' | 'week' | 'month' | 'quarter' | 'year';

const ReportsScreen: React.FC<NavigationProps<'Reports'>> = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  
  // Report data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [agedReceivables, setAgedReceivables] = useState<AgedReceivables | null>(null);
  const [agedPayables, setAgedPayables] = useState<AgedPayables | null>(null);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Calculate date range
  const getDateRange = useCallback((range: DateRange) => {
    const today = new Date();
    let fromDate: Date;
    
    switch (range) {
      case 'today':
        fromDate = today;
        break;
      case 'week':
        fromDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'quarter':
        fromDate = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        fromDate = new Date(today.getFullYear(), 0, 1);
        break;
    }
    
    return {
      from: fromDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }, []);

  // Fetch report data
  const fetchReports = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { from, to } = getDateRange(dateRange);

      // Fetch all reports in parallel
      const [
        dashboardResponse,
        receivablesResponse,
        payablesResponse,
        profitLossResponse,
      ] = await Promise.all([
        reportsApi.getDashboardFull(from, to),
        accountingApi.getAgedReceivables(),
        accountingApi.getAgedPayables(),
        accountingApi.getProfitLoss(from, to),
      ]);

      setDashboardData(dashboardResponse.data);
      setAgedReceivables(receivablesResponse.data);
      setAgedPayables(payablesResponse.data);
      setProfitLoss(profitLossResponse.data);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch reports',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange, getDateRange]);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `PKR ${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `PKR ${(amount / 1000).toFixed(0)}K`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  // Navigate to detail report
  const navigateToReport = (reportType: string) => {
    navigation.navigate('ReportDetail', { type: reportType, dateRange });
  };

  // Render date range selector
  const renderDateSelector = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.dateSelectorContainer}
      contentContainerStyle={styles.dateSelectorContent}
    >
      {(['today', 'week', 'month', 'quarter', 'year'] as DateRange[]).map((range) => (
        <TouchableOpacity
          key={range}
          style={[styles.dateTab, dateRange === range && styles.dateTabActive]}
          onPress={() => setDateRange(range)}
        >
          <Text style={[styles.dateTabText, dateRange === range && styles.dateTabTextActive]}>
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Render summary cards
  const renderSummaryCards = () => (
    <View style={styles.summaryGrid}>
      <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
        <View style={styles.summaryIcon}>
          <ChartLineUpIcon size={24} color="#FFFFFF" weight="fill" />
        </View>
        <Text style={styles.summaryValueLight}>
          {formatCurrency(profitLoss?.netProfitLoss || 0)}
        </Text>
        <Text style={styles.summaryLabelLight}>
          {profitLoss?.isProfit ? 'Net Profit' : 'Net Loss'}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: `${theme.colors.success}20` }]}>
          <CurrencyCircleDollarIcon size={20} color={theme.colors.success} weight="fill" />
        </View>
        <Text style={styles.summaryValue}>
          {formatCurrency(dashboardData?.sales.total || 0)}
        </Text>
        <Text style={styles.summaryLabel}>Total Sales</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: `${theme.colors.warning}20` }]}>
          <TruckIcon size={20} color={theme.colors.warning} weight="fill" />
        </View>
        <Text style={styles.summaryValue}>
          {formatCurrency(dashboardData?.purchases.total || 0)}
        </Text>
        <Text style={styles.summaryLabel}>Total Purchases</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: `${theme.colors.info}20` }]}>
          <UsersIcon size={20} color={theme.colors.info} weight="fill" />
        </View>
        <Text style={styles.summaryValue}>
          {formatCurrency(dashboardData?.receivables.total || 0)}
        </Text>
        <Text style={styles.summaryLabel}>Receivables</Text>
      </View>
    </View>
  );

  // Render accounting reports section
  const renderAccountingReports = () => (
    <View style={styles.reportsSection}>
      <Text style={styles.sectionTitle}>Accounting Reports</Text>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigation.navigate('GeneralJournal')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
          <BookOpenIcon size={24} color={theme.colors.primary} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>General Journal</Text>
          <Text style={styles.reportDescription}>Roznamcha / All journal entries</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigation.navigate('GeneralLedger')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.info}15` }]}>
          <ListNumbersIcon size={24} color={theme.colors.info} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>General Ledger</Text>
          <Text style={styles.reportDescription}>Khaata / Account-wise transactions</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigation.navigate('ProfitLoss')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.success}15` }]}>
          <ChartLineUpIcon size={24} color={theme.colors.success} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Profit & Loss</Text>
          <Text style={styles.reportDescription}>Nafa Nuqsaan / Income statement</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigation.navigate('TrialBalance')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.warning}15` }]}>
          <ScalesIcon size={24} color={theme.colors.warning} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Trial Balance</Text>
          <Text style={styles.reportDescription}>Mizaan e Aazmaish</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigation.navigate('BalanceSheet')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `#8B5CF615` }]}>
          <ReceiptIcon size={24} color="#8B5CF6" weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Balance Sheet</Text>
          <Text style={styles.reportDescription}>Mizaan Sheet / Financial position</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>
    </View>
  );

  // Render report cards
  const renderReportCards = () => (
    <View style={styles.reportsSection}>
      <Text style={styles.sectionTitle}>Other Reports</Text>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigateToReport('profit-loss')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
          <ChartPieIcon size={24} color={theme.colors.primary} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Profit & Loss</Text>
          <Text style={styles.reportDescription}>Income and expense breakdown</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigateToReport('aged-receivables')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.success}15` }]}>
          <UsersIcon size={24} color={theme.colors.success} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Aged Receivables</Text>
          <Text style={styles.reportDescription}>
            {agedReceivables?.totals.total
              ? `${formatCurrency(agedReceivables.totals.total)} outstanding`
              : 'Customer aging analysis'}
          </Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigateToReport('aged-payables')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.warning}15` }]}>
          <TruckIcon size={24} color={theme.colors.warning} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Aged Payables</Text>
          <Text style={styles.reportDescription}>
            {agedPayables?.totals.total
              ? `${formatCurrency(agedPayables.totals.total)} payable`
              : 'Supplier aging analysis'}
          </Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigateToReport('sales')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.info}15` }]}>
          <FileTextIcon size={24} color={theme.colors.info} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Sales Report</Text>
          <Text style={styles.reportDescription}>
            {dashboardData?.sales.invoiceCount || 0} invoices this period
          </Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigateToReport('purchases')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.error}15` }]}>
          <FileTextIcon size={24} color={theme.colors.error} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Purchase Report</Text>
          <Text style={styles.reportDescription}>
            {dashboardData?.purchases.invoiceCount || 0} bills this period
          </Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => navigateToReport('tax')}
        activeOpacity={0.7}
      >
        <View style={[styles.reportIcon, { backgroundColor: `${theme.colors.text.secondary}15` }]}>
          <WarningCircleIcon size={24} color={theme.colors.text.secondary} weight="fill" />
        </View>
        <View style={styles.reportInfo}>
          <Text style={styles.reportTitle}>Tax Report</Text>
          <Text style={styles.reportDescription}>Sales tax summary</Text>
        </View>
        <ArrowRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>
    </View>
  );

  // Render aging summary
  const renderAgingSummary = () => {
    if (!agedReceivables || !agedPayables) return null;

    return (
      <View style={styles.agingSection}>
        <Text style={styles.sectionTitle}>Aging Summary</Text>

        <View style={styles.agingCard}>
          <Text style={styles.agingTitle}>Receivables Aging</Text>
          <View style={styles.agingRow}>
            <View style={styles.agingItem}>
              <Text style={styles.agingValue}>
                {formatCurrency(agedReceivables.totals.current)}
              </Text>
              <Text style={styles.agingLabel}>Current</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={[styles.agingValue, { color: theme.colors.warning }]}>
                {formatCurrency(agedReceivables.totals.days30)}
              </Text>
              <Text style={styles.agingLabel}>1-30 Days</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={[styles.agingValue, { color: theme.colors.error }]}>
                {formatCurrency(agedReceivables.totals.days60 + agedReceivables.totals.days90 + agedReceivables.totals.over90)}
              </Text>
              <Text style={styles.agingLabel}>60+ Days</Text>
            </View>
          </View>
        </View>

        <View style={styles.agingCard}>
          <Text style={styles.agingTitle}>Payables Aging</Text>
          <View style={styles.agingRow}>
            <View style={styles.agingItem}>
              <Text style={styles.agingValue}>
                {formatCurrency(agedPayables.totals.current)}
              </Text>
              <Text style={styles.agingLabel}>Current</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={[styles.agingValue, { color: theme.colors.warning }]}>
                {formatCurrency(agedPayables.totals.days30)}
              </Text>
              <Text style={styles.agingLabel}>1-30 Days</Text>
            </View>
            <View style={styles.agingItem}>
              <Text style={[styles.agingValue, { color: theme.colors.error }]}>
                {formatCurrency(agedPayables.totals.days60 + agedPayables.totals.days90 + agedPayables.totals.over90)}
              </Text>
              <Text style={styles.agingLabel}>60+ Days</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <HeaderNavigation
          title="Reports"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Reports & Analytics"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.exportButton} activeOpacity={0.7}>
            <DownloadSimpleIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchReports(true)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {renderDateSelector()}
        {renderSummaryCards()}
        {renderAccountingReports()}
        {renderAgingSummary()}
        {renderReportCards()}
      </ScrollView>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    dateSelectorContainer: {
      marginVertical: theme.spacing.sm,
    },
    dateSelectorContent: {
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    dateTab: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      marginRight: theme.spacing.sm,
    },
    dateTabActive: {
      backgroundColor: theme.colors.primary,
    },
    dateTabText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    dateTabTextActive: {
      color: '#FFFFFF',
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.md,
    },
    summaryCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    summaryCardPrimary: {
      width: '100%',
      backgroundColor: theme.colors.primary,
    },
    summaryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    summaryValueLight: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    summaryLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    summaryLabelLight: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
    },
    reportsSection: {
      marginTop: theme.spacing.xl,
    },
    reportCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    reportIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    reportInfo: {
      flex: 1,
    },
    reportTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    reportDescription: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    agingSection: {
      marginTop: theme.spacing.xl,
    },
    agingCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    agingTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    agingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    agingItem: {
      alignItems: 'center',
      flex: 1,
    },
    agingValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.success,
    },
    agingLabel: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginTop: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    exportButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default ReportsScreen;

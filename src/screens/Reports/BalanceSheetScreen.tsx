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
  ShareNetworkIcon,
  CalendarIcon,
  CaretRightIcon,
  WalletIcon,
  ReceiptIcon,
  ScalesIcon,
  CheckCircleIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../store/hooks';
import { accountingApi, BalanceSheet } from '../../services/api/accounting';
import ExportReportModal from './components/ExportReportModal';

interface BalanceSheetItem {
  accountId: number;
  accountCode: string;
  accountName: string;
  amount: number;
}

const BalanceSheetScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [report, setReport] = useState<BalanceSheet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    assets: true,
    liabilities: true,
    equity: true,
  });

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

        const response = await accountingApi.getBalanceSheet(asOfDate);
        setReport(response.data);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch balance sheet',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [asOfDate]
  );

  useEffect(() => {
    fetchReport();
  }, []);

  // Check if balanced
  const isBalanced = useMemo(() => {
    if (!report) return true;
    const leftSide = Number(report.totalAssets) || 0;
    const rightSide = (Number(report.totalLiabilities) || 0) + (Number(report.totalEquity) || 0);
    return Math.abs(leftSide - rightSide) < 0.01;
  }, [report]);

  // Toggle section
  const toggleSection = (section: 'assets' | 'liabilities' | 'equity') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Format helpers
  const formatCurrency = (amount: number | undefined | null) => {
    const safe = Number(amount) || 0;
    return `PKR ${Math.abs(safe).toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Render line item
  const renderLineItem = (item: BalanceSheetItem) => (
    <View key={item.accountId} style={styles.lineItem}>
      <View style={styles.lineItemInfo}>
        <Text style={styles.lineItemName}>{item.accountName}</Text>
        <Text style={styles.lineItemCode}>{item.accountCode}</Text>
      </View>
      <Text style={styles.lineItemAmount}>{formatCurrency(item.amount)}</Text>
    </View>
  );

  // Render section
  const renderSection = (
    title: string,
    subtitle: string,
    items: BalanceSheetItem[],
    total: number,
    section: 'assets' | 'liabilities' | 'equity',
    icon: React.ReactNode,
    color: string
  ) => {
    const isExpanded = expandedSections[section];

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleSection(section)}
        >
          <View style={styles.sectionHeaderLeft}>
            <View style={[styles.sectionIcon, { backgroundColor: `${color}15` }]}>
              {icon}
            </View>
            <View>
              <Text style={styles.sectionTitle}>{title}</Text>
              <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            </View>
          </View>
          <View style={styles.sectionHeaderRight}>
            <Text style={[styles.sectionTotal, { color }]}>
              {formatCurrency(total)}
            </Text>
            <CaretRightIcon
              size={20}
              color={theme.colors.text.secondary}
              style={{
                transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
              }}
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionContent}>
            {items.map((item) => renderLineItem(item))}
            {items.length === 0 && (
              <Text style={styles.emptyText}>No accounts</Text>
            )}
          </View>
        )}
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
          <Text style={styles.headerTitle}>Balance Sheet</Text>
          <Text style={styles.headerSubtitle}>Mizaan Sheet</Text>
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
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading balance sheet...</Text>
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
          {/* Balance Status */}
          <View
            style={[
              styles.balanceStatus,
              isBalanced ? styles.balanced : styles.unbalanced,
            ]}
          >
            {isBalanced ? (
              <>
                <CheckCircleIcon size={20} color={theme.colors.success} weight="fill" />
                <Text style={styles.balanceStatusTextBalanced}>
                  Balance Sheet is Balanced
                </Text>
              </>
            ) : (
              <>
                <WarningCircleIcon size={20} color={theme.colors.error} weight="fill" />
                <Text style={styles.balanceStatusTextUnbalanced}>
                  Balance Sheet is NOT Balanced
                </Text>
              </>
            )}
          </View>

          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>TOTAL ASSETS</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                {formatCurrency(report.totalAssets)}
              </Text>
            </View>
            <View style={styles.equalSign}>
              <Text style={styles.equalText}>=</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>LIAB. + EQUITY</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>
                {formatCurrency((Number(report.totalLiabilities) || 0) + (Number(report.totalEquity) || 0))}
              </Text>
            </View>
          </View>

          {/* Assets Section */}
          {renderSection(
            'Assets',
            'Jaidad',
            report.assets,
            report.totalAssets,
            'assets',
            <WalletIcon size={22} color={theme.colors.primary} weight="fill" />,
            theme.colors.primary
          )}

          {/* Liabilities Section */}
          {renderSection(
            'Liabilities',
            'Qarz / Waajbaat',
            report.liabilities,
            report.totalLiabilities,
            'liabilities',
            <ReceiptIcon size={22} color="#FF6B35" weight="fill" />,
            '#FF6B35'
          )}

          {/* Equity Section */}
          {renderSection(
            'Equity',
            'Maalik ka Hissa',
            report.equity,
            report.totalEquity,
            'equity',
            <ScalesIcon size={22} color="#8B5CF6" weight="fill" />,
            '#8B5CF6'
          )}

          {/* Retained Earnings */}
          {report.retainedEarnings != null && (Number(report.retainedEarnings) || 0) !== 0 && (
            <View style={styles.retainedEarnings}>
              <View style={styles.retainedLeft}>
                <Text style={styles.retainedLabel}>Retained Earnings</Text>
                <Text style={styles.retainedSubtitle}>Jama Shuda Munafa</Text>
              </View>
              <Text
                style={[
                  styles.retainedValue,
                  {
                    color:
                      (Number(report.retainedEarnings) || 0) >= 0
                        ? theme.colors.success
                        : theme.colors.error,
                  },
                ]}
              >
                {(Number(report.retainedEarnings) || 0) >= 0 ? '+' : '-'}
                {formatCurrency(report.retainedEarnings)}
              </Text>
            </View>
          )}

          {/* Equation Display */}
          <View style={styles.equationContainer}>
            <Text style={styles.equationTitle}>
              ACCOUNTING EQUATION / HISAB KA FORMULA
            </Text>
            <View style={styles.equation}>
              <View style={styles.equationItem}>
                <Text style={styles.equationLabel}>Assets</Text>
                <Text style={[styles.equationValue, { color: theme.colors.primary }]}>
                  {formatCurrency(report.totalAssets)}
                </Text>
              </View>
              <Text style={styles.equationOperator}>=</Text>
              <View style={styles.equationItem}>
                <Text style={styles.equationLabel}>Liabilities</Text>
                <Text style={[styles.equationValue, { color: '#FF6B35' }]}>
                  {formatCurrency(report.totalLiabilities)}
                </Text>
              </View>
              <Text style={styles.equationOperator}>+</Text>
              <View style={styles.equationItem}>
                <Text style={styles.equationLabel}>Equity</Text>
                <Text style={[styles.equationValue, { color: '#8B5CF6' }]}>
                  {formatCurrency(report.totalEquity)}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Data Available</Text>
          <Text style={styles.emptySubtitle}>
            No accounts found for balance sheet
          </Text>
        </View>
      )}

      {/* Export Modal */}
      <ExportReportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        reportTitle="Balance Sheet"
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
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    dateInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    dateText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
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
    balanceStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
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
    summaryContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
      marginTop: 4,
    },
    equalSign: {
      width: 30,
      alignItems: 'center',
    },
    equalText: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.secondary,
    },
    section: {
      marginBottom: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    sectionIcon: {
      width: 44,
      height: 44,
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
      padding: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    lineItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
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
      color: theme.colors.text.primary,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.md,
    },
    retainedEarnings: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    retainedLeft: {
      flex: 1,
    },
    retainedLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    retainedSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    retainedValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    equationContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    equationTitle: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    equation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    equationItem: {
      alignItems: 'center',
      flex: 1,
    },
    equationLabel: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    equationValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    equationOperator: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      paddingHorizontal: theme.spacing.xs,
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

export default BalanceSheetScreen;

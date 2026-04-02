import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
  FunnelIcon,
  BankIcon,
  SparkleIcon,
  WarningIcon,
  CheckCircleIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';
import apiClient from '../../services/api/client';

interface BankTransaction {
  id: number;
  transactionDate: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'matched' | 'unmatched';
  referenceNumber?: string;
  bankAccountId?: number;
  bankAccountName?: string;
  matchConfidence?: number;
  suggestedMatch?: {
    type: string;
    id: number;
    reference: string;
    partyName: string;
    amount: number;
  };
  needsBankAssignment?: boolean;
}

interface PendingSummary {
  totalPending: number;
  matched: number;
  unmatched: number;
}

type FilterTab = 'all' | 'matched' | 'unmatched';

const BankFeedScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [summary, setSummary] = useState<PendingSummary>({
    totalPending: 0,
    matched: 0,
    unmatched: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');

  const fetchPendingTransactions = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);

        const [txRes, statsRes] = await Promise.all([
          apiClient.get<any>('/bank-transactions/pending'),
          apiClient.get<any>('/bank-transactions/stats').catch(() => null),
        ]);
        const raw = (txRes as any)?.data ?? txRes;
        const list: BankTransaction[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.transactions)
          ? raw.transactions
          : [];

        setTransactions(list);

        if (statsRes) {
          const s = (statsRes as any)?.data ?? statsRes;
          setSummary({
            totalPending: s.totalPending ?? list.length,
            matched: s.matched ?? 0,
            unmatched: s.unmatched ?? 0,
          });
        } else {
          const matched = list.filter(
            (t: BankTransaction) =>
              t.status === 'matched' || (t.matchConfidence && t.matchConfidence > 0),
          ).length;
          const unmatched = list.filter(
            (t: BankTransaction) => t.status === 'unmatched' || t.needsBankAssignment,
          ).length;
          setSummary({ totalPending: list.length, matched, unmatched });
        }
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch pending transactions',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (activeFilter === 'all') return transactions;
    if (activeFilter === 'matched')
      return transactions.filter(
        (t) => t.status === 'matched' || (t.matchConfidence && t.matchConfidence > 0),
      );
    return transactions.filter(
      (t) => t.status === 'unmatched' || t.needsBankAssignment,
    );
  }, [transactions, activeFilter]);

  const formatCurrency = (amount: number | undefined | null) => {
    const safe = Number(amount) || 0;
    return `Rs. ${Math.abs(safe).toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    } catch {
      return 'N/A';
    }
  };

  const handleTransactionPress = (transaction: BankTransaction) => {
    navigation.navigate(ROUTES.REVIEW_TRANSACTION as never, { transaction } as never);
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryRow}>
      <TouchableOpacity
        style={[styles.summaryCard, activeFilter === 'all' && styles.summaryCardActive]}
        onPress={() => setActiveFilter('all')}
      >
        <Text style={styles.summaryCardLabel}>TOTAL{'\n'}PENDING</Text>
        <Text style={[styles.summaryCardValue, { color: theme.colors.text.primary }]}>
          {summary.totalPending}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.summaryCard,
          activeFilter === 'matched' && styles.summaryCardActive,
        ]}
        onPress={() => setActiveFilter('matched')}
      >
        <Text style={styles.summaryCardLabel}>MATCHED</Text>
        <Text style={[styles.summaryCardValue, { color: theme.colors.text.primary }]}>
          {summary.matched}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.summaryCard,
          styles.summaryCardUnmatched,
          activeFilter === 'unmatched' && styles.summaryCardUnmatchedActive,
        ]}
        onPress={() => setActiveFilter('unmatched')}
      >
        <Text style={[styles.summaryCardLabel, { color: '#FF6B35' }]}>UNMATCHED</Text>
        <Text style={[styles.summaryCardValue, { color: '#FF6B35' }]}>
          {summary.unmatched}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderTransactionCard = ({ item }: { item: BankTransaction }) => {
    const isCredit = item.type === 'credit' || (Number(item.amount) || 0) > 0;
    const amountColor = isCredit ? theme.colors.success : theme.colors.error;
    const amountPrefix = isCredit ? '+' : '-';
    const showWarning = item.needsBankAssignment;

    return (
      <TouchableOpacity
        style={[styles.txCard, showWarning && styles.txCardWarning]}
        activeOpacity={0.7}
        onPress={() => handleTransactionPress(item)}
      >
        <View style={styles.txHeader}>
          <Text style={styles.txDate}>{formatDate(item.transactionDate)}</Text>
          <Text style={[styles.txAmount, { color: amountColor }]}>
            {amountPrefix}{formatCurrency(item.amount)}
          </Text>
        </View>

        <Text style={styles.txDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.txBadgeRow}>
          <View style={styles.txStatusBadge}>
            <Text style={styles.txStatusText}>Pending</Text>
          </View>

          {item.matchConfidence && item.matchConfidence > 0 && item.suggestedMatch ? (
            <View style={styles.txMatchBadge}>
              <SparkleIcon size={12} color={theme.colors.primary} weight="fill" />
              <Text style={styles.txMatchText}>
                Match: {item.suggestedMatch.partyName} ({item.matchConfidence}%)
              </Text>
            </View>
          ) : null}

          {showWarning ? (
            <View style={styles.txWarningBadge}>
              <WarningIcon size={12} color="#FF6B35" weight="fill" />
              <Text style={styles.txWarningText}>Needs Bank Assignment</Text>
            </View>
          ) : null}
        </View>

        {item.suggestedMatch && item.matchConfidence && item.matchConfidence > 0 && (
          <View style={styles.txSuggestionRow}>
            <Text style={styles.txSuggestionIcon}>i</Text>
            <Text style={styles.txSuggestionText}>
              Suggested based on previous invoice #{item.suggestedMatch.reference}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBackArea}
          >
            <View style={styles.headerIconBg}>
              <BankIcon size={24} color="#FFFFFF" weight="fill" />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bank Feed</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <FunnelIcon size={22} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading pending transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTransactionCard}
          ListHeaderComponent={
            <>
              {renderSummaryCards()}
              <Text style={styles.sectionLabel}>PENDING REVIEW</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <CheckCircleIcon size={48} color={theme.colors.success} weight="fill" />
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>
                No pending transactions to review
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchPendingTransactions(true)}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
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
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    headerBackArea: {
      padding: 2,
    },
    headerIconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: '#FF6B35',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    filterButton: {
      padding: theme.spacing.xs,
    },
    summaryRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: theme.spacing.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    summaryCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}08`,
    },
    summaryCardUnmatched: {
      borderColor: '#FF6B3530',
      backgroundColor: '#FF6B3508',
    },
    summaryCardUnmatchedActive: {
      borderColor: '#FF6B35',
      backgroundColor: '#FF6B3515',
    },
    summaryCardLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    summaryCardValue: {
      fontSize: 28,
      fontWeight: '700',
      marginTop: 4,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: theme.colors.text.secondary,
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    listContent: {
      paddingBottom: 100,
    },
    txCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderRadius: 14,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    txCardWarning: {
      borderColor: '#FF6B3540',
      backgroundColor: '#FFF8F5',
    },
    txHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    txDate: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    txAmount: {
      fontSize: 18,
      fontWeight: '700',
    },
    txDescription: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    txBadgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    txStatusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: `${theme.colors.text.secondary}15`,
    },
    txStatusText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    txMatchBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: `${theme.colors.primary}12`,
      gap: 4,
    },
    txMatchText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    txWarningBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: '#FF6B3515',
      gap: 4,
    },
    txWarningText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FF6B35',
    },
    txSuggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      gap: 6,
    },
    txSuggestionIcon: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: `${theme.colors.text.secondary}20`,
      textAlign: 'center',
      lineHeight: 16,
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.text.secondary,
    },
    txSuggestionText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
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
      alignItems: 'center',
      paddingTop: 80,
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
  });

export default BankFeedScreen;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  CaretLeft,
  ArrowDown,
  ArrowUp,
  CurrencyCircleDollar,
} from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';
import { paymentsApi, Payment, PaymentFilters } from '../../services/api/payments';

const PaymentsListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPayments = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        const filters: PaymentFilters = {
          page: pageNum,
          limit: 20,
        };
        const rawResponse = await paymentsApi.getAll(filters);
        // Handle both direct PaginatedResponse and wrapped { data: PaginatedResponse }
        const response: typeof rawResponse =
          (rawResponse as any)?.data ?? rawResponse;
        const items: Payment[] = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? (response as any)
          : [];
        if (refresh || pageNum === 1) {
          setPayments(items);
        } else {
          setPayments(prev => [...prev, ...items]);
        }
        setHasMore(pageNum < (response?.totalPages ?? 1));
        setPage(pageNum);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments(1, true);
  }, [fetchPayments]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchPayments(page + 1);
    }
  }, [hasMore, loading, page, fetchPayments]);

  const handlePaymentPress = useCallback(
    (payment: Payment) => {
      // @ts-ignore
      navigation.navigate(ROUTES.PAYMENT_DETAIL, { paymentId: payment.id });
    },
    [navigation],
  );

  const formatCurrency = (amount: number | undefined | null) => {
    const safe = Number(amount) || 0;
    return `PKR ${safe.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Submitted':
        return { bg: '#E3F2FD', text: '#1565C0' };
      case 'Pending':
        return { bg: '#FFF3E0', text: '#E65100' };
      case 'Cancelled':
        return { bg: '#FFEBEE', text: '#C62828' };
      default:
        return { bg: '#E0E0E0', text: '#616161' };
    }
  };

  const renderPayment = useCallback(
    ({ item }: { item: Payment }) => {
      const isReceive = item.paymentType === 'Receive';
      const statusStyle = getStatusStyle(item.status);

      return (
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={() => handlePaymentPress(item)}
          activeOpacity={0.7}>
          <View style={styles.paymentLeft}>
            <View
              style={[
                styles.typeIcon,
                {
                  backgroundColor: isReceive ? '#E8F5E915' : '#FFEBEE15',
                },
              ]}>
              {isReceive ? (
                <ArrowDown size={20} color="#2E7D32" weight="bold" />
              ) : (
                <ArrowUp size={20} color="#C62828" weight="bold" />
              )}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentNumber}>{item.paymentNumber}</Text>
              <Text style={styles.partyName}>{item.partyName}</Text>
              <Text style={styles.paymentDate}>
                {formatDate(item.paymentDate)} &middot; {item.paymentMode}
              </Text>
            </View>
          </View>

          <View style={styles.paymentRight}>
            <Text
              style={[
                styles.paymentAmount,
                { color: isReceive ? '#2E7D32' : '#C62828' },
              ]}>
              {isReceive ? '+' : '-'} {formatCurrency(item.paidAmount)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.bg },
              ]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [styles, handlePaymentPress],
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <CurrencyCircleDollar size={48} color={theme.colors.text.disabled} />
        <Text style={styles.emptyTitle}>No Payments</Text>
        <Text style={styles.emptySubtitle}>
          Your payments will appear here
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <CaretLeft size={24} color={theme.colors.text.primary} weight="bold" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerSubtitle}>All Transactions</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading && payments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={payments}
          renderItem={renderPayment}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={
            hasMore && payments.length > 0 ? (
              <ActivityIndicator
                style={{ padding: 16 }}
                color={theme.colors.primary}
              />
            ) : null
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
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContent: {
      padding: 16,
      paddingBottom: 100,
    },
    paymentCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    paymentLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    typeIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    paymentInfo: {
      flex: 1,
    },
    paymentNumber: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    partyName: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    paymentDate: {
      fontSize: 11,
      color: theme.colors.text.disabled,
      marginTop: 2,
    },
    paymentRight: {
      alignItems: 'flex-end',
    },
    paymentAmount: {
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 80,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 12,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });

export default PaymentsListScreen;

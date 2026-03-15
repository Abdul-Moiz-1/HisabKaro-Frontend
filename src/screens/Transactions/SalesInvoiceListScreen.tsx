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
import { CaretLeft } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';
import {
  salesInvoicesApi,
  Invoice,
  InvoiceFilters,
  InvoiceStatus,
} from '../../services/api/invoices';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Draft: { bg: '#E0E0E0', text: '#616161' },
  Submitted: { bg: '#E3F2FD', text: '#1565C0' },
  Paid: { bg: '#E8F5E9', text: '#2E7D32' },
  'Partially Paid': { bg: '#FFF3E0', text: '#E65100' },
  Cancelled: { bg: '#FFEBEE', text: '#C62828' },
};

const SalesInvoiceListScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | undefined>();

  const fetchInvoices = useCallback(
    async (pageNum: number = 1, refresh: boolean = false) => {
      try {
        if (pageNum === 1) setLoading(true);
        const filters: InvoiceFilters = {
          page: pageNum,
          limit: 20,
          search: searchQuery || undefined,
          status: statusFilter,
        };
        const response = await salesInvoicesApi.getAll(filters);
        if (refresh || pageNum === 1) {
          setInvoices(response.data);
        } else {
          setInvoices(prev => [...prev, ...response.data]);
        }
        setHasMore(pageNum < response.totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error('Error fetching sales invoices:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, statusFilter],
  );

  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInvoices(1, true);
  }, [fetchInvoices]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchInvoices(page + 1);
    }
  }, [hasMore, loading, page, fetchInvoices]);

  const handleInvoicePress = useCallback(
    (invoice: Invoice) => {
      // @ts-ignore
      navigation.navigate(ROUTES.SALES_INVOICE_DETAIL, {
        invoiceId: invoice.id,
      });
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

  const renderInvoice = useCallback(
    ({ item }: { item: Invoice }) => {
      const statusStyle = STATUS_COLORS[item.status] || STATUS_COLORS.Draft;
      return (
        <TouchableOpacity
          style={styles.invoiceCard}
          onPress={() => handleInvoicePress(item)}
          activeOpacity={0.7}>
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceHeaderLeft}>
              <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                {formatDate(item.invoiceDate)}
              </Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.customerName}>
            {item.customerName || 'Walk-in Customer'}
          </Text>

          <View style={styles.invoiceFooter}>
            <View>
              <Text style={styles.amountLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(item.totalAmount)}
              </Text>
            </View>
            {item.outstandingAmount > 0 && (
              <View style={styles.outstandingContainer}>
                <Text style={styles.amountLabel}>Outstanding</Text>
                <Text style={styles.outstandingAmount}>
                  {formatCurrency(item.outstandingAmount)}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [styles, handleInvoicePress],
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No Sales Invoices</Text>
        <Text style={styles.emptySubtitle}>
          Your sales invoices will appear here
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
          <Text style={styles.headerTitle}>Sales Invoices</Text>
          <Text style={styles.headerSubtitle}>Bikri Bills</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading && invoices.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={invoices}
          renderItem={renderInvoice}
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
            hasMore && invoices.length > 0 ? (
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
    invoiceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.sm,
    },
    invoiceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    invoiceHeaderLeft: {},
    invoiceNumber: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    invoiceDate: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    customerName: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 12,
    },
    invoiceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 12,
    },
    amountLabel: {
      fontSize: 11,
      color: theme.colors.text.disabled,
      marginBottom: 2,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    outstandingContainer: {
      alignItems: 'flex-end',
    },
    outstandingAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: '#E65100',
    },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 80,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  });

export default SalesInvoiceListScreen;

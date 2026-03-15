import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  CaretLeft,
  ArrowDown,
  ArrowUp,
  CalendarBlank,
  User,
  Bank,
  CreditCard,
  Note,
} from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';
import { paymentsApi, Payment } from '../../services/api/payments';

const PaymentDetailScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { paymentId } = route.params;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPaymentDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await paymentsApi.getById(paymentId);
      // API may return { data: Payment } or Payment directly
      const paymentData = (res as any)?.data ?? res;
      setPayment(paymentData);
    } catch (error) {
      console.error('Error fetching payment detail:', error);
      Alert.alert('Error', 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPaymentDetail();
  }, [fetchPaymentDetail]);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <CaretLeft
              size={24}
              color={theme.colors.text.primary}
              weight="bold"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!payment) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <CaretLeft
              size={24}
              color={theme.colors.text.primary}
              weight="bold"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Detail</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Payment not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isReceive = payment.paymentType === 'Receive';
  const statusStyle = getStatusStyle(payment.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <CaretLeft
            size={24}
            color={theme.colors.text.primary}
            weight="bold"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{payment.paymentNumber}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {/* Amount Card */}
        <View style={styles.card}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: isReceive ? '#E8F5E915' : '#FFEBEE15',
                },
              ]}>
              {isReceive ? (
                <ArrowDown size={20} color="#2E7D32" weight="bold" />
              ) : (
                <ArrowUp size={20} color="#C62828" weight="bold" />
              )}
              <Text
                style={[
                  styles.typeText,
                  { color: isReceive ? '#2E7D32' : '#C62828' },
                ]}>
                {isReceive ? 'Received' : 'Paid'}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.bg },
              ]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {payment.status}
              </Text>
            </View>
          </View>

          <Text style={styles.amountLabel}>Amount</Text>
          <Text
            style={[
              styles.amountValue,
              { color: isReceive ? '#2E7D32' : '#C62828' },
            ]}>
            {isReceive ? '+' : '-'} {formatCurrency(payment.paidAmount)}
          </Text>

          <View style={styles.allocationRow}>
            <View style={styles.allocationBox}>
              <Text style={styles.allocationLabel}>Allocated</Text>
              <Text style={styles.allocationValue}>
                {formatCurrency(payment.allocatedAmount)}
              </Text>
            </View>
            <View style={styles.allocationDivider} />
            <View style={styles.allocationBox}>
              <Text style={styles.allocationLabel}>Unallocated</Text>
              <Text style={styles.allocationValue}>
                {formatCurrency(payment.unallocatedAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailRow}>
            <User size={20} color={theme.colors.text.secondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>
                {isReceive ? 'Customer' : 'Supplier'}
              </Text>
              <Text style={styles.detailValue}>{payment.partyName}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <CalendarBlank size={20} color={theme.colors.text.secondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Payment Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(payment.paymentDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <CreditCard size={20} color={theme.colors.text.secondary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Payment Mode</Text>
              <Text style={styles.detailValue}>{payment.paymentMode}</Text>
            </View>
          </View>

          {payment.bankAccountName && (
            <View style={styles.detailRow}>
              <Bank size={20} color={theme.colors.text.secondary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Bank Account</Text>
                <Text style={styles.detailValue}>
                  {payment.bankAccountName}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Cheque Details */}
        {payment.chequeDetails && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cheque Details</Text>
            <View style={styles.detailRow}>
              <Note size={20} color={theme.colors.text.secondary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Cheque Number</Text>
                <Text style={styles.detailValue}>
                  {payment.chequeDetails.chequeNumber}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <CalendarBlank size={20} color={theme.colors.text.secondary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Cheque Date</Text>
                <Text style={styles.detailValue}>
                  {formatDate(payment.chequeDetails.chequeDate)}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <Bank size={20} color={theme.colors.text.secondary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Bank Name</Text>
                <Text style={styles.detailValue}>
                  {payment.chequeDetails.bankName}
                </Text>
              </View>
            </View>
            {payment.chequeStatus && (
              <View style={styles.chequeStatusRow}>
                <Text style={styles.chequeStatusLabel}>Status:</Text>
                <Text
                  style={[
                    styles.chequeStatusValue,
                    {
                      color:
                        payment.chequeStatus === 'cleared'
                          ? '#2E7D32'
                          : payment.chequeStatus === 'bounced'
                          ? '#C62828'
                          : '#E65100',
                    },
                  ]}>
                  {payment.chequeStatus.charAt(0).toUpperCase() +
                    payment.chequeStatus.slice(1)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Notes */}
        {payment.notes && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{payment.notes}</Text>
          </View>
        )}

        {/* Timestamps */}
        <View style={styles.card}>
          <Text style={styles.timestampText}>
            Created: {formatDate(payment.createdAt)}
          </Text>
          <Text style={styles.timestampText}>
            Updated: {formatDate(payment.updatedAt)}
          </Text>
        </View>
      </ScrollView>
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
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    content: {
      padding: 16,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      ...theme.shadows.sm,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    typeText: {
      fontSize: 13,
      fontWeight: '600',
      marginLeft: 6,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    amountLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    amountValue: {
      fontSize: 32,
      fontWeight: '700',
      marginBottom: 16,
    },
    allocationRow: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      overflow: 'hidden',
    },
    allocationBox: {
      flex: 1,
      padding: 12,
      alignItems: 'center',
    },
    allocationDivider: {
      width: 1,
      backgroundColor: theme.colors.border,
    },
    allocationLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    allocationValue: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailContent: {
      marginLeft: 12,
      flex: 1,
    },
    detailLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 2,
    },
    chequeStatusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
    },
    chequeStatusLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginRight: 8,
    },
    chequeStatusValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    notesText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
    timestampText: {
      fontSize: 12,
      color: theme.colors.text.disabled,
      marginBottom: 4,
    },
  });

export default PaymentDetailScreen;

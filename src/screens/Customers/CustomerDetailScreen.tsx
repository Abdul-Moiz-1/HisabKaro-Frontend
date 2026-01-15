import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
} from 'react-native';
import {
  PhoneIcon,
  WhatsappLogoIcon,
  MoneyIcon,
  CaretLeftIcon,
  DotsThreeVerticalIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ReceiptIcon,
  BookOpenIcon,
  PencilSimpleIcon,
  TrashIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container } from '../../components/common';
import { useTheme } from '../../store/hooks';
import { customersApi, Customer, CustomerStatement } from '../../services/api';

const CustomerDetailScreen: React.FC<NavigationProps<'CustomerDetail'>> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { customerId } = route.params || {};

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<CustomerStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch customer details
  const fetchCustomerDetails = useCallback(
    async (isRefresh: boolean = false) => {
      if (!customerId) return;

      try {
        if (!isRefresh) setLoading(true);
        const today = new Date();
        today.setUTCHours(23, 59, 59, 999);

        const sevenDaysBefore = new Date();
        sevenDaysBefore.setUTCDate(sevenDaysBefore.getUTCDate() - 7);
        sevenDaysBefore.setUTCHours(0, 0, 0, 0);

        const todayISO = today.toISOString();
        const sevenDaysBeforeISO = sevenDaysBefore.toISOString();

        const [customerData] = await Promise.all([
          customersApi.getById(customerId),
        ]);

        console.log(customerData);

        setCustomer(customerData);
        setTimeline(customerData?.recentTransactions);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load customer details',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [customerId],
  );

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomerDetails(true);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return `Rs. ${Math.abs(amount).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-PK', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Handle call
  const handleCall = () => {
    if (customer?.phoneNumber) {
      Linking.openURL(`tel:${customer.phoneNumber}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'No Phone',
        text2: 'No phone number available for this customer',
      });
    }
  };

  // Handle WhatsApp
  const handleWhatsApp = () => {
    if (customer?.phoneNumber) {
      // Clean the phone number and format for WhatsApp
      const cleanPhone = customer.phoneNumber.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'No Phone',
        text2: 'No phone number available for this customer',
      });
    }
  };

  // Handle Paisa Vasool (receive payment)
  const handlePaisaVasool = () => {
    // Navigate to payment receipt screen with customer pre-selected
    navigation.navigate('Receipt', {
      customerId: customer?.id,
      customerName: customer?.name,
      outstandingBalance: customer?.outstanding_balance,
    } as any);
  };

  // Handle view ledger
  const handleViewLedger = () => {
    if (customer) {
      navigation.navigate('CustomerLedger', {
        customerId: customer.id,
        customerName: customer.name,
      });
    }
  };

  // Handle edit customer
  const handleEditCustomer = () => {
    setShowMenu(false);
    navigation.navigate('EditCustomer', { customerId: customer?.id || '' });
  };

  // Handle delete customer
  const handleDeleteCustomer = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete "${customer?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await customersApi.delete(customerId!);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${customer?.name} has been removed`,
              });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete customer',
              });
            }
          },
        },
      ],
    );
  };

  // Get transaction type icon and color
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'invoice':
        return {
          icon: ArrowUpRightIcon,
          bgColor: `${theme.colors.error}15`,
          iconColor: theme.colors.error,
          label: 'INVOICED',
        };
      case 'payment':
        return {
          icon: ArrowDownLeftIcon,
          bgColor: `${theme.colors.success}15`,
          iconColor: theme.colors.success,
          label: 'RECEIVED',
        };
      case 'credit_note':
        return {
          icon: ReceiptIcon,
          bgColor: `${theme.colors.warning}15`,
          iconColor: theme.colors.warning,
          label: 'CREDIT',
        };
      default:
        return {
          icon: ReceiptIcon,
          bgColor: `${theme.colors.info}15`,
          iconColor: theme.colors.info,
          label: type.toUpperCase(),
        };
    }
  };

  // Calculate overdue days
  const getOverdueDays = (): number => {
    if (!customer?.last_sale_date) return 0;
    const lastSale = new Date(customer.last_sale_date);
    const today = new Date();
    const diffTime = today.getTime() - lastSale.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? diffDays - 30 : 0;
  };

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading customer...</Text>
        </View>
      </Container>
    );
  }

  if (!customer) {
    return (
      <Container safeArea edges={['top']}>
        <View style={styles.errorContainer}>
          <WarningCircleIcon size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Customer Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The customer you're looking for doesn't exist
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const overdueDays = getOverdueDays();
  const isTrusted =
    customer.total_payments > 100000 && customer.outstanding_balance < 50000;
  console.log(timeline);
  return (
    <Container safeArea edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <CaretLeftIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Customer Profile</Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <DotsThreeVerticalIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleEditCustomer}
            >
              <PencilSimpleIcon size={18} color={theme.colors.text.primary} />
              <Text style={styles.menuItemText}>Edit Customer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteCustomer}
            >
              <TrashIcon size={18} color={theme.colors.error} />
              <Text
                style={[styles.menuItemText, { color: theme.colors.error }]}
              >
                Delete Customer
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {customer.email ? (
              <Image
                source={{
                  uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    customer?.name,
                  )}&background=16A34A&color=fff&size=100`,
                }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {customer?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {isTrusted && (
              <View style={styles.verifiedBadge}>
                <CheckCircleIcon size={20} color="#fff" weight="fill" />
              </View>
            )}
          </View>

          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.balanceLabel}>Baqaya Raqam (Balance)</Text>
          <Text
            style={[
              styles.balanceAmount,
              timeline?.outstandingBalance > 0
                ? styles.balanceRed
                : styles.balanceGreen,
            ]}
          >
            {formatCurrency(customer?.outstandingBalance)}
          </Text>

          {overdueDays > 0 && (
            <View style={styles.overdueBadge}>
              <WarningCircleIcon size={14} color={theme.colors.error} />
              <Text style={styles.overdueText}>OVERDUE {overdueDays} DAYS</Text>
            </View>
          )}

          {isTrusted && (
            <View style={styles.trustedBadge}>
              <CheckCircleIcon size={14} color={theme.colors.primary} />
              <Text style={styles.trustedText}>TRUSTED PARTNER</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <View style={styles.actionIconContainer}>
              <PhoneIcon size={22} color={theme.colors.text.primary} />
            </View>
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleWhatsApp}
          >
            <View style={styles.actionIconContainer}>
              <WhatsappLogoIcon size={22} color="#25D366" />
            </View>
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.paisaVasoolButton]}
            onPress={handlePaisaVasool}
          >
            <View style={[styles.actionIconContainer, styles.paisaVasoolIcon]}>
              <MoneyIcon size={22} color="#fff" weight="fill" />
            </View>
            <Text style={[styles.actionButtonText, styles.paisaVasoolText]}>
              Paisa Vasool
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={styles.statValue}>
              {formatCurrency(customer.totalSales)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Payments</Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatCurrency(customer.totalPayments)}
            </Text>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>Timeline</Text>
            <TouchableOpacity>
              <Text style={styles.filterLink}>Filter</Text>
            </TouchableOpacity>
          </View>

          {timeline?.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <ReceiptIcon size={48} color={theme.colors.text.disabled} />
              <Text style={styles.emptyTimelineText}>No transactions yet</Text>
            </View>
          ) : (
            timeline?.map((item, index) => {
              const txStyle = getTransactionStyle(item.type);
              const TxIcon = txStyle.icon;

              return (
                <View key={item.id || index} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineIcon,
                      { backgroundColor: txStyle.bgColor },
                    ]}
                  >
                    <TxIcon size={18} color={txStyle.iconColor} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineItemTitle}>
                      {item.type === 'payment'
                        ? 'Paisa Vasool'
                        : item.type === 'invoice'
                        ? 'Sale'
                        : item.type}
                      {item.type === 'payment'
                        ? ' (Cash)'
                        : `: Bill #${item.number.split('-').pop()}`}
                    </Text>
                    <Text style={styles.timelineItemDate}>
                      {formatDate(item.date)} • {formatTime(item.date)}
                    </Text>
                  </View>
                  <View style={styles.timelineAmount}>
                    <Text
                      style={[
                        styles.timelineAmountText,
                        item.type === 'payment'
                          ? { color: theme.colors.success }
                          : { color: theme.colors.text.primary },
                      ]}
                    >
                      {formatCurrency(
                        item.type === 'payment' ? item.amount : item.amount,
                      )}
                    </Text>
                    <Text style={styles.timelineAmountLabel}>
                      {txStyle.label}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* View Ledger Button */}
      <TouchableOpacity style={styles.ledgerButton} onPress={handleViewLedger}>
        <BookOpenIcon size={20} color="#fff" />
        <Text style={styles.ledgerButtonText}>View Ledger (Khata Dekhain)</Text>
      </TouchableOpacity>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    dropdownMenu: {
      position: 'absolute',
      top: 50,
      right: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.sm,
      ...theme.shadows.lg,
      zIndex: 100,
      minWidth: 160,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    menuItemText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    errorTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
    },
    errorSubtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    backButton: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    backButtonText: {
      color: '#fff',
      fontWeight: '600',
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    avatarText: {
      fontSize: 40,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    customerName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    balanceLabel: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    balanceAmount: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    balanceRed: {
      color: theme.colors.error,
    },
    balanceGreen: {
      color: theme.colors.success,
    },
    overdueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.error}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.sm,
      gap: 4,
    },
    overdueText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.error,
    },
    trustedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.full,
      marginTop: theme.spacing.sm,
      gap: 4,
    },
    trustedText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    actionButtons: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
    },
    actionButtonText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    paisaVasoolButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    paisaVasoolIcon: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    paisaVasoolText: {
      color: '#fff',
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    timelineSection: {
      paddingHorizontal: theme.spacing.md,
    },
    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    timelineTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    filterLink: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    emptyTimeline: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyTimelineText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
    },
    timelineIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    timelineContent: {
      flex: 1,
    },
    timelineItemTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    timelineItemDate: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    timelineAmount: {
      alignItems: 'flex-end',
    },
    timelineAmountText: {
      fontSize: 15,
      fontWeight: '600',
    },
    timelineAmountLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    ledgerButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1F2937',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    ledgerButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default CustomerDetailScreen;

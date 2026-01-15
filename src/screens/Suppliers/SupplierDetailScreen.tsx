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
  CurrencyDollarIcon,
  CaretLeftIcon,
  DotsThreeVerticalIcon,
  WarningCircleIcon,
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ReceiptIcon,
  BookOpenIcon,
  PencilSimpleIcon,
  TrashIcon,
  TruckIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container } from '../../components/common';
import { useTheme } from '../../store/hooks';
import { suppliersApi, Supplier, SupplierStatement } from '../../services/api';

const SupplierDetailScreen: React.FC<NavigationProps<'SupplierDetail'>> = ({ 
  navigation, 
  route 
}) => {
  const theme = useTheme();
  const { supplierId } = route.params || {};
  
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [timeline, setTimeline] = useState<SupplierStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch supplier details
  const fetchSupplierDetails = useCallback(async (isRefresh: boolean = false) => {
    if (!supplierId) return;
    
    try {
      if (!isRefresh) setLoading(true);
      
      const [supplierData, statementData] = await Promise.all([
        suppliersApi.getById(supplierId),
        suppliersApi.getStatement(supplierId),
      ]);
      
      setSupplier(supplierData);
      setTimeline(statementData);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load supplier details',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supplierId]);

  useEffect(() => {
    fetchSupplierDetails();
  }, [fetchSupplierDetails]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSupplierDetails(true);
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
    if (supplier?.phone) {
      Linking.openURL(`tel:${supplier.phone}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'No Phone',
        text2: 'No phone number available for this supplier',
      });
    }
  };

  // Handle WhatsApp
  const handleWhatsApp = () => {
    if (supplier?.phone) {
      const cleanPhone = supplier.phone.replace(/\D/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'No Phone',
        text2: 'No phone number available for this supplier',
      });
    }
  };

  // Handle make payment
  const handleMakePayment = () => {
    navigation.navigate('SupplierPayment', {
      supplierId: supplier?.id,
      supplierName: supplier?.name,
      payableBalance: supplier?.payable_balance,
    } as any);
  };

  // Handle view ledger
  const handleViewLedger = () => {
    if (supplier) {
      navigation.navigate('SupplierLedger', {
        supplierId: supplier.id,
        supplierName: supplier.name,
      });
    }
  };

  // Handle edit supplier
  const handleEditSupplier = () => {
    setShowMenu(false);
    navigation.navigate('EditSupplier', { supplierId: supplier?.id || '' });
  };

  // Handle delete supplier
  const handleDeleteSupplier = () => {
    setShowMenu(false);
    Alert.alert(
      'Delete Supplier',
      `Are you sure you want to delete "${supplier?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await suppliersApi.delete(supplierId!);
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: `${supplier?.name} has been removed`,
              });
              navigation.goBack();
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to delete supplier',
              });
            }
          },
        },
      ]
    );
  };

  // Get transaction type icon and color
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'purchase':
        return {
          icon: ArrowDownLeftIcon,
          bgColor: `${theme.colors.warning}15`,
          iconColor: theme.colors.warning,
          label: 'PURCHASED',
        };
      case 'payment':
        return {
          icon: ArrowUpRightIcon,
          bgColor: `${theme.colors.success}15`,
          iconColor: theme.colors.success,
          label: 'PAID',
        };
      case 'credit_note':
        return {
          icon: ReceiptIcon,
          bgColor: `${theme.colors.info}15`,
          iconColor: theme.colors.info,
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
    if (!supplier?.last_purchase_date) return 0;
    const lastPurchase = new Date(supplier.last_purchase_date);
    const today = new Date();
    const diffTime = today.getTime() - lastPurchase.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 30 ? diffDays - 30 : 0;
  };

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading supplier...</Text>
        </View>
      </Container>
    );
  }

  if (!supplier) {
    return (
      <Container safeArea edges={['top']}>
        <View style={styles.errorContainer}>
          <WarningCircleIcon size={64} color={theme.colors.error} />
          <Text style={styles.errorTitle}>Supplier Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The supplier you're looking for doesn't exist
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Container>
    );
  }

  const overdueDays = getOverdueDays();

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
        
        <Text style={styles.headerTitle}>Supplier Profile</Text>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <DotsThreeVerticalIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {showMenu && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditSupplier}>
              <PencilSimpleIcon size={18} color={theme.colors.text.primary} />
              <Text style={styles.menuItemText}>Edit Supplier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleDeleteSupplier}>
              <TrashIcon size={18} color={theme.colors.error} />
              <Text style={[styles.menuItemText, { color: theme.colors.error }]}>
                Delete Supplier
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
            <View style={styles.avatarPlaceholder}>
              <TruckIcon size={40} color={theme.colors.warning} weight="fill" />
            </View>
          </View>
          
          <Text style={styles.supplierName}>{supplier.name}</Text>
          <Text style={styles.balanceLabel}>Dena Baqi (Payable)</Text>
          <Text style={[
            styles.balanceAmount,
            supplier.payable_balance > 0 ? styles.balanceOrange : styles.balanceGreen
          ]}>
            {formatCurrency(supplier.payable_balance)}
          </Text>
          
          {overdueDays > 0 && supplier.payable_balance > 0 && (
            <View style={styles.overdueBadge}>
              <WarningCircleIcon size={14} color={theme.colors.error} />
              <Text style={styles.overdueText}>PAYMENT DUE {overdueDays} DAYS</Text>
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

          <TouchableOpacity style={styles.actionButton} onPress={handleWhatsApp}>
            <View style={styles.actionIconContainer}>
              <WhatsappLogoIcon size={22} color="#25D366" />
            </View>
            <Text style={styles.actionButtonText}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.paymentButton]} 
            onPress={handleMakePayment}
          >
            <View style={[styles.actionIconContainer, styles.paymentIcon]}>
              <CurrencyDollarIcon size={22} color="#fff" weight="fill" />
            </View>
            <Text style={[styles.actionButtonText, styles.paymentText]}>Make Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Purchases</Text>
            <Text style={styles.statValue}>{formatCurrency(supplier.total_purchases)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Payments</Text>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {formatCurrency(supplier.total_payments)}
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

          {timeline.length === 0 ? (
            <View style={styles.emptyTimeline}>
              <ReceiptIcon size={48} color={theme.colors.text.disabled} />
              <Text style={styles.emptyTimelineText}>No transactions yet</Text>
            </View>
          ) : (
            timeline.map((item, index) => {
              const txStyle = getTransactionStyle(item.type);
              const TxIcon = txStyle.icon;
              
              return (
                <View key={item.id || index} style={styles.timelineItem}>
                  <View style={[styles.timelineIcon, { backgroundColor: txStyle.bgColor }]}>
                    <TxIcon size={18} color={txStyle.iconColor} />
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineItemTitle}>
                      {item.type === 'payment' ? 'Payment Made' : item.type === 'purchase' ? 'Purchase' : item.type}
                      {item.type === 'payment' ? ' (Bank)' : `: Bill #${item.reference.split('-').pop()}`}
                    </Text>
                    <Text style={styles.timelineItemDate}>
                      {formatDate(item.date)} • {formatTime(item.date)}
                    </Text>
                  </View>
                  <View style={styles.timelineAmount}>
                    <Text style={[
                      styles.timelineAmountText,
                      item.type === 'payment' ? { color: theme.colors.success } : { color: theme.colors.warning }
                    ]}>
                      {formatCurrency(item.type === 'payment' ? item.credit : item.debit)}
                    </Text>
                    <Text style={styles.timelineAmountLabel}>{txStyle.label}</Text>
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
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: `${theme.colors.warning}20`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.warning,
    },
    supplierName: {
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
    balanceOrange: {
      color: theme.colors.warning,
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
    paymentButton: {
      backgroundColor: theme.colors.warning,
      borderColor: theme.colors.warning,
    },
    paymentIcon: {
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    paymentText: {
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

export default SupplierDetailScreen;

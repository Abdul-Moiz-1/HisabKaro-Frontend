import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PlusIcon,
  BellIcon,
} from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, useAppDispatch } from '../../../store/hooks';
import { Container, HeaderNavigation, Button } from '../../../components/common';
import { suppliersApi, Supplier } from '../../../services/api/suppliers';
import { ROUTES } from '../../../constants/routes';
import { PaymentsFlowParamList } from '../PaymentsFlowNavigator';

type NavigationProp = StackNavigationProp<PaymentsFlowParamList>;

type FilterType = 'all' | 'due_soon' | 'overdue';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due_soon', label: 'Due Soon' },
  { id: 'overdue', label: 'Overdue' },
];

const SelectSupplierScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [totalPayable, setTotalPayable] = useState(0);

  const loadSuppliers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await suppliersApi.getAll({});
      setSuppliers(response.data);
      
      // Calculate total payable
      const total = response.data.reduce((sum, s) => sum + s.payable_balance, 0);
      setTotalPayable(total);
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSuppliers();
    setRefreshing(false);
  }, [loadSuppliers]);

  const handleSupplierSelect = (supplier: Supplier) => {
    navigation.navigate(ROUTES.MAKE_PAYMENT, {
      partyId: supplier.id,
      partyName: supplier.name,
      partyType: 'supplier',
      balance: supplier.payable_balance,
    });
  };

  const filteredSuppliers = useMemo(() => {
    let data = suppliers;
    
    // Search filter
    if (searchQuery.trim()) {
      data = data.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter - simulate based on balance
    if (activeFilter === 'overdue') {
      return data.filter((s) => s.payable_balance > 100000);
    }
    if (activeFilter === 'due_soon') {
      return data.filter((s) => s.payable_balance > 10000 && s.payable_balance <= 100000);
    }
    
    return data;
  }, [suppliers, searchQuery, activeFilter]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        header: {
          paddingHorizontal: theme.spacing.lg,
          paddingTop: theme.spacing.md,
        },
        searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.md,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        searchIcon: {
          marginRight: theme.spacing.sm,
        },
        searchInput: {
          flex: 1,
          ...theme.typography.body,
          color: theme.colors.text.primary,
          paddingVertical: theme.spacing.md,
        },
        micButton: {
          padding: theme.spacing.xs,
        },
        totalCard: {
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
        },
        totalLabel: {
          ...theme.typography.caption,
          color: 'rgba(255, 255, 255, 0.8)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        totalAmount: {
          ...theme.typography.h1,
          color: '#FFFFFF',
          fontWeight: 'bold',
          marginTop: theme.spacing.xs,
        },
        filtersContainer: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        },
        filterChip: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
        },
        filterChipActive: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        filterChipInactive: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        filterChipText: {
          ...theme.typography.bodySmall,
          fontWeight: '500',
        },
        filterChipTextActive: {
          color: '#FFFFFF',
        },
        filterChipTextInactive: {
          color: theme.colors.text.primary,
        },
        overdueIndicator: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.error,
          marginLeft: theme.spacing.xs,
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
        },
        sectionTitle: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        activeCount: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        listContent: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 100,
        },
        supplierCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          ...theme.shadows.xs,
        },
        supplierCardOverdue: {
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.error,
        },
        supplierHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: theme.spacing.sm,
        },
        supplierInfo: {
          flex: 1,
        },
        supplierNameRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.spacing.sm,
        },
        supplierName: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        statusBadge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
        },
        statusBadgeOverdue: {
          backgroundColor: `${theme.colors.error}20`,
        },
        statusBadgeText: {
          ...theme.typography.caption,
          fontWeight: '600',
          fontSize: 10,
        },
        statusBadgeTextOverdue: {
          color: theme.colors.error,
        },
        billsCount: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          backgroundColor: theme.colors.border,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: 2,
          borderRadius: theme.borderRadius.sm,
        },
        supplierMeta: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 4,
        },
        supplierFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing.sm,
        },
        amountDue: {
          flex: 1,
        },
        amountLabel: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        },
        amountValue: {
          ...theme.typography.h3,
          fontWeight: 'bold',
        },
        amountOverdue: {
          color: theme.colors.error,
        },
        amountNormal: {
          color: theme.colors.text.primary,
        },
        payButton: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          backgroundColor: theme.colors.primary,
        },
        payButtonText: {
          ...theme.typography.bodySmall,
          fontWeight: '600',
          color: '#FFFFFF',
        },
        emptyContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: theme.spacing.xxl,
        },
        emptyText: {
          ...theme.typography.body,
          color: theme.colors.text.secondary,
          textAlign: 'center',
        },
        fab: {
          position: 'absolute',
          bottom: theme.spacing.xl,
          right: theme.spacing.lg,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          ...theme.shadows.lg,
        },
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [theme]
  );

  const getSupplierStatus = (balance: number) => {
    if (balance > 100000) return { label: 'OVERDUE', isOverdue: true };
    return { label: '', isOverdue: false };
  };

  const renderSupplierItem = ({ item }: { item: Supplier }) => {
    const status = getSupplierStatus(item.payable_balance);

    return (
      <View style={[styles.supplierCard, status.isOverdue && styles.supplierCardOverdue]}>
        <View style={styles.supplierHeader}>
          <View style={styles.supplierInfo}>
            <View style={styles.supplierNameRow}>
              <Text style={styles.supplierName}>{item.name}</Text>
              {status.isOverdue && (
                <View style={[styles.statusBadge, styles.statusBadgeOverdue]}>
                  <Text style={[styles.statusBadgeText, styles.statusBadgeTextOverdue]}>
                    {status.label}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.supplierMeta}>
              Last payment: {item.total_payments > 0 ? '3 days ago' : 'Never'}
            </Text>
          </View>
          <Text style={styles.billsCount}>3 BILLS</Text>
        </View>
        
        <View style={styles.supplierFooter}>
          <View style={styles.amountDue}>
            <Text style={styles.amountLabel}>Amount Due</Text>
            <Text
              style={[
                styles.amountValue,
                status.isOverdue ? styles.amountOverdue : styles.amountNormal,
              ]}
            >
              Rs. {item.payable_balance.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handleSupplierSelect(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.payButtonText}>Pay (Ada Karein)</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Container safeArea style={styles.container}>
      <HeaderNavigation
        title="Select Supplier"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity>
            <BellIcon size={24} color={theme.colors.text.primary} weight="regular" />
          </TouchableOpacity>
        }
      />

      <View style={styles.header}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MagnifyingGlassIcon
            size={20}
            color={theme.colors.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Supplier (Talaash karein)"
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <MicrophoneIcon size={20} color={theme.colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

        {/* Total Payable Card */}
        <LinearGradient
          colors={[theme.colors.primary, '#00897B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.totalCard}
        >
          <Text style={styles.totalLabel}>Total Payable (Kul Adaigi)</Text>
          <Text style={styles.totalAmount}>Rs. {totalPayable.toLocaleString()}</Text>
        </LinearGradient>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                activeFilter === filter.id
                  ? styles.filterChipActive
                  : styles.filterChipInactive,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === filter.id
                      ? styles.filterChipTextActive
                      : styles.filterChipTextInactive,
                  ]}
                >
                  {filter.label}
                </Text>
                {filter.id === 'overdue' && activeFilter !== 'overdue' && (
                  <View style={styles.overdueIndicator} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Suppliers</Text>
        <Text style={styles.activeCount}>{filteredSuppliers.length} ACTIVE</Text>
      </View>

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredSuppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No suppliers found.{'\n'}Add a new supplier to get started.
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <PlusIcon size={28} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>
    </Container>
  );
};

export default SelectSupplierScreen;

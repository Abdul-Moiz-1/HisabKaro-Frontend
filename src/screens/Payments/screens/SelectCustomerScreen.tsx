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
  CaretRightIcon,
  BellIcon,
} from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme, useAppDispatch, useAppSelector } from '../../../store/hooks';
import { Container, HeaderNavigation } from '../../../components/common';
import { fetchCustomers, searchCustomers } from '../../../store/slices/customersSlice';
import { ROUTES } from '../../../constants/routes';
import { PaymentsFlowParamList } from '../PaymentsFlowNavigator';
import { Customer } from '../../../services/api/customers';

type NavigationProp = StackNavigationProp<PaymentsFlowParamList>;

type FilterType = 'all' | 'due_soon' | 'overdue';

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'due_soon', label: 'Due Soon' },
  { id: 'overdue', label: 'Overdue' },
];

const SelectCustomerScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();
  
  const { customers, isLoading, searchResults, searchQuery } = useAppSelector(
    (state) => state.customers
  );

  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers({}));
  }, [dispatch]);

  const handleSearch = useCallback(
    (query: string) => {
      setLocalSearchQuery(query);
      if (query.trim().length > 2) {
        dispatch(searchCustomers(query));
      }
    },
    [dispatch]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchCustomers({}));
    setRefreshing(false);
  }, [dispatch]);

  const handleCustomerSelect = (customer: Customer) => {
    navigation.navigate(ROUTES.MAKE_PAYMENT, {
      partyId: customer.id,
      partyName: customer.name,
      partyType: 'customer',
      balance: customer.outstanding_balance,
    });
  };

  const filteredCustomers = useMemo(() => {
    const data = localSearchQuery.trim().length > 2 ? searchResults : customers;
    
    if (activeFilter === 'all') return data;
    
    // In real app, filter by due date status
    // For now, simulate based on balance
    if (activeFilter === 'overdue') {
      return data.filter((c) => c.outstanding_balance > 50000);
    }
    if (activeFilter === 'due_soon') {
      return data.filter((c) => c.outstanding_balance > 10000 && c.outstanding_balance <= 50000);
    }
    
    return data;
  }, [customers, searchResults, localSearchQuery, activeFilter]);

  const getBalanceStatus = (balance: number) => {
    if (balance > 50000) return { label: 'OVERDUE', color: theme.colors.error };
    if (balance > 10000) return { label: 'DUE IN 2 DAYS', color: theme.colors.warning };
    if (balance === 0) return { label: 'CLEARED', color: theme.colors.success };
    return { label: '', color: theme.colors.text.secondary };
  };

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
        listContent: {
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: 100,
        },
        customerCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          ...theme.shadows.xs,
        },
        customerCardOverdue: {
          borderLeftWidth: 4,
          borderLeftColor: theme.colors.error,
        },
        avatar: {
          width: 48,
          height: 48,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        avatarText: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.primary,
        },
        customerInfo: {
          flex: 1,
        },
        customerName: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        customerMeta: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        balanceContainer: {
          alignItems: 'flex-end',
          marginRight: theme.spacing.sm,
        },
        balanceAmount: {
          ...theme.typography.body,
          fontWeight: '600',
        },
        balanceAmountOverdue: {
          color: theme.colors.error,
        },
        balanceAmountNormal: {
          color: theme.colors.text.primary,
        },
        balanceStatus: {
          ...theme.typography.caption,
          fontWeight: '500',
          marginTop: 2,
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

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const status = getBalanceStatus(item.outstanding_balance);
    const isOverdue = item.outstanding_balance > 50000;

    return (
      <TouchableOpacity
        style={[styles.customerCard, isOverdue && styles.customerCardOverdue]}
        onPress={() => handleCustomerSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.avatar, { backgroundColor: `${getAvatarColor(item.name)}20` }]}>
          <Text style={[styles.avatarText, { color: getAvatarColor(item.name) }]}>
            {getInitials(item.name)}
          </Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerMeta}>
            {item.phone || 'No phone'} • {item.city || 'N/A'}
          </Text>
        </View>
        <View style={styles.balanceContainer}>
          <Text
            style={[
              styles.balanceAmount,
              isOverdue ? styles.balanceAmountOverdue : styles.balanceAmountNormal,
            ]}
          >
            Rs. {item.outstanding_balance.toLocaleString()}
          </Text>
          {status.label && (
            <Text style={[styles.balanceStatus, { color: status.color }]}>
              {status.label}
            </Text>
          )}
        </View>
        <CaretRightIcon size={20} color={theme.colors.text.tertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <Container safeArea style={styles.container}>
      <HeaderNavigation
        title="Select Customer"
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
            placeholder="Search Customer (Talaash karein)"
            placeholderTextColor={theme.colors.text.tertiary}
            value={localSearchQuery}
            onChangeText={handleSearch}
          />
          <TouchableOpacity style={styles.micButton}>
            <MicrophoneIcon size={20} color={theme.colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

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

      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderCustomerItem}
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
                No customers found.{'\n'}Add a new customer to get started.
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

export default SelectCustomerScreen;

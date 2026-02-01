import React, { useEffect, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  CaretRightIcon,
  WarningCircleIcon,
} from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useTheme, useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { SearchBar } from '../../../../components/common';
import { Supplier } from '../../../../services/api/suppliers';
import {
  fetchRecentSuppliers,
  searchSuppliers,
  setSelectedSupplier,
  selectRecentSuppliers,
  selectPurchasesError,
  clearError,
} from '../../../../store/slices/purchasesSlice';

const SupplierSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const suppliers = useAppSelector(selectRecentSuppliers);
  const suppliersLoading = useAppSelector((state) => state.purchases.suppliersLoading);
  const error = useAppSelector(selectPurchasesError);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch suppliers on mount
  useEffect(() => {
    dispatch(fetchRecentSuppliers());
  }, [dispatch]);

  // Handle search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        dispatch(searchSuppliers(searchQuery));
      } else {
        dispatch(fetchRecentSuppliers());
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, dispatch]);

  // Handle error
  useEffect(() => {
    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await dispatch(fetchRecentSuppliers());
    setIsRefreshing(false);
  }, [dispatch]);

  const handleSupplierSelect = useCallback(
    (supplier: Supplier) => {
      dispatch(setSelectedSupplier(supplier));
      // @ts-ignore
      navigation.navigate('ProductSelection', { supplier });
    },
    [dispatch, navigation]
  );

  const handleAddSupplier = useCallback(() => {
    // @ts-ignore
    navigation.navigate('AddSupplier');
  }, [navigation]);

  const formatCurrency = (amount: number): string => {
    if (amount >= 100000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'No purchases yet';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const renderSupplierItem = useCallback(
    ({ item }: { item: Supplier }) => (
      <TouchableOpacity
        style={styles.supplierCard}
        onPress={() => handleSupplierSelect(item)}
        activeOpacity={0.7}
      >
        <View style={styles.supplierAvatar}>
          <UserIcon size={24} color={theme.colors.primary} weight="fill" />
        </View>

        <View style={styles.supplierInfo}>
          <Text style={styles.supplierName}>{item.name}</Text>

          <View style={styles.supplierMeta}>
            {item.phone && (
              <View style={styles.metaItem}>
                <PhoneIcon size={12} color={theme.colors.text.secondary} />
                <Text style={styles.metaText}>{item.phone}</Text>
              </View>
            )}
            {item.city && (
              <View style={styles.metaItem}>
                <MapPinIcon size={12} color={theme.colors.text.secondary} />
                <Text style={styles.metaText}>{item.city}</Text>
              </View>
            )}
          </View>

          <View style={styles.supplierStats}>
            <Text style={styles.lastPurchase}>
              Last: {formatDate(item.last_purchase_date)}
              {item.last_purchase_amount && ` • PKR ${formatCurrency(item.last_purchase_amount)}`}
            </Text>
          </View>

          {item.payable_balance > 0 && (
            <View style={styles.outstandingBadge}>
              <WarningCircleIcon size={14} color={theme.colors.warning} weight="fill" />
              <Text style={styles.outstandingText}>
                Outstanding: PKR {formatCurrency(item.payable_balance)}
              </Text>
            </View>
          )}
        </View>

        <CaretRightIcon size={20} color={theme.colors.text.disabled} />
      </TouchableOpacity>
    ),
    [styles, theme, handleSupplierSelect]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UserIcon size={48} color={theme.colors.text.disabled} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No suppliers found' : 'No suppliers yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search term or add a new supplier'
          : 'Add your first supplier to get started'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddSupplier}>
        <PlusIcon size={18} color="#FFFFFF" weight="bold" />
        <Text style={styles.emptyButtonText}>Add Supplier</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, phone, or city..."
          onClear={() => setSearchQuery('')}
        />
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : 'Recent Suppliers'}
        </Text>
        <Text style={styles.sectionCount}>{suppliers.length} suppliers</Text>
      </View>

      {/* Suppliers List */}
      {suppliersLoading && suppliers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading suppliers...</Text>
        </View>
      ) : (
        <FlatList
          data={suppliers}
          renderItem={renderSupplierItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* Add Supplier FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddSupplier}
        activeOpacity={0.8}
      >
        <PlusIcon size={24} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionCount: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      color: theme.colors.text.secondary,
    },
    supplierCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    supplierAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    supplierInfo: {
      flex: 1,
    },
    supplierName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    supplierMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: 4,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    supplierStats: {
      marginTop: 2,
    },
    lastPurchase: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    outstandingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
    },
    outstandingText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.warning,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
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
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    emptyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.lg,
    },
    emptyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    fab: {
      position: 'absolute',
      bottom: theme.spacing.xl,
      right: theme.spacing.md,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.lg,
    },
  });

export default SupplierSelectionScreen;

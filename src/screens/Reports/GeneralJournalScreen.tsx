import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  FunnelIcon,
  SparkleIcon,
  MicrophoneIcon,
  PlusIcon,
  FileTextIcon,
  CircleIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme, useAppDispatch, useAppSelector } from '../../store/hooks';
import { accountingApi, JournalEntry } from '../../services/api/accounting';
import DateFilterTabs, { DateFilterOption } from './components/DateFilterTabs';
import CustomDateRangeModal from './components/CustomDateRangeModal';

interface GroupedEntries {
  date: string;
  dateLabel: string;
  entries: JournalEntry[];
}

const GeneralJournalScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // State
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('thisMonth');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [customFromDate, setCustomFromDate] = useState<string | undefined>();
  const [customToDate, setCustomToDate] = useState<string | undefined>();

  // Calculate date range
  const getDateRange = useCallback((filter: DateFilterOption) => {
    const today = new Date();
    let fromDate: Date;

    switch (filter) {
      case 'thisMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return {
          from: fromDate.toISOString().split('T')[0],
          to: lastDayOfLastMonth.toISOString().split('T')[0],
        };
      case 'last30Days':
        fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (customFromDate && customToDate) {
          return { from: customFromDate, to: customToDate };
        }
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return {
      from: fromDate.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0],
    };
  }, [customFromDate, customToDate]);

  // Fetch entries
  const fetchEntries = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const { from, to } = getDateRange(dateFilter);
        const response = await accountingApi.getJournalEntries({
          fromDate: from,
          toDate: to,
        });

        setEntries(response.data);
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to fetch journal entries',
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [dateFilter, getDateRange]
  );

  useEffect(() => {
    fetchEntries();
  }, [dateFilter, customFromDate, customToDate]);

  const handleCustomDateApply = useCallback((from: string, to: string) => {
    setCustomFromDate(from);
    setCustomToDate(to);
    setDateFilter('custom');
  }, []);

  const customDateLabel = useMemo(() => {
    if (dateFilter === 'custom' && customFromDate && customToDate) {
      const f = new Date(customFromDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      const t = new Date(customToDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
      return `${f} - ${t}`;
    }
    return undefined;
  }, [dateFilter, customFromDate, customToDate]);

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  };
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };


  // Group entries by date
  const groupedEntries = useMemo(() => {
    const filtered = searchQuery
      ? entries.filter(
          (entry) =>
            entry.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.remarks?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.entries.some((e) =>
              e.accountName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : entries;

    const groups: Record<string, JournalEntry[]> = {};

    filtered.forEach((entry) => {
      const date = entry.postingDate.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, entries]) => {
        let dateLabel = '';
        if (date === today) {
          dateLabel = `TODAY, ${formatDateShort(date)}`;
        } else if (date === yesterday) {
          dateLabel = `YESTERDAY, ${formatDateShort(date)}`;
        } else {
          dateLabel = formatDateShort(date).toUpperCase();
        }

        return { date, dateLabel, entries };
      });
  }, [entries, searchQuery]);



  // Navigate to add entry
  const handleAddEntry = useCallback(() => {
    navigation.navigate('JournalEntry' as never);
  }, [navigation]);

  // Render entry card
  const renderEntryCard = ({ item }: { item: JournalEntry }) => {
    const debitEntries = item.entries.filter((e) => e.debit > 0);
    const creditEntries = item.entries.filter((e) => e.credit > 0);

    return (
      <TouchableOpacity style={styles.entryCard} activeOpacity={0.7}>
        {/* Header */}
        <View style={styles.entryHeader}>
          <View style={styles.voucherBadge}>
            <Text style={styles.voucherText}>{item.voucherNumber}</Text>
          </View>
          <Text style={styles.entryAmount}>{formatCurrency(item.totalDebit)}</Text>
        </View>

        <Text style={styles.entryTime}>{formatTime(item.createdAt)}</Text>

        {/* Entries */}
        <View style={styles.entriesList}>
          {debitEntries.map((entry, idx) => (
            <View key={`dr-${idx}`} style={styles.entryLine}>
              <CircleIcon
                size={8}
                color={theme.colors.primary}
                weight="fill"
                style={styles.entryDot}
              />
              <Text style={styles.entryLineText}>Dr. {entry.accountName}</Text>
            </View>
          ))}
          {creditEntries.map((entry, idx) => (
            <View key={`cr-${idx}`} style={styles.entryLine}>
              <CircleIcon
                size={8}
                color={theme.colors.text.secondary}
                weight="fill"
                style={styles.entryDot}
              />
              <Text style={styles.entryLineText}>Cr. {entry.accountName}</Text>
            </View>
          ))}
        </View>

        {/* Narration */}
        {item.remarks && (
          <View style={styles.narrationRow}>
            <FileTextIcon size={14} color={theme.colors.text.secondary} />
            <Text style={styles.narrationText} numberOfLines={1}>
              {item.remarks}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render date section
  const renderDateSection = ({ item }: { item: GroupedEntries }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateSectionLabel}>{item.dateLabel}</Text>
      {item.entries.map((entry) => (
        <View key={entry.id}>{renderEntryCard({ item: entry })}</View>
      ))}
    </View>
  );

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
          <Text style={styles.headerTitle}>General Journal</Text>
          <Text style={styles.headerSubtitle}>Roznamcha</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <FunnelIcon size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* AI Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <SparkleIcon size={18} color={theme.colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ask AI: Show cash sales from yes..."
            placeholderTextColor={theme.colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <MicrophoneIcon size={20} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Filters */}
      <DateFilterTabs
        selected={dateFilter}
        onSelect={setDateFilter}
        onCustomPress={() => setShowDateRangeModal(true)}
        showCustomDate={dateFilter === 'custom' && !!customDateLabel}
        customDateLabel={customDateLabel}
      />

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading entries...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedEntries}
          renderItem={renderDateSection}
          keyExtractor={(item) => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => fetchEntries(true)}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FileTextIcon size={64} color={theme.colors.text.secondary} />
              <Text style={styles.emptyTitle}>No Entries Found</Text>
              <Text style={styles.emptySubtitle}>
                Start recording your journal entries
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddEntry}
        activeOpacity={0.8}
      >
        <PlusIcon size={24} color="#FFFFFF" weight="bold" />
      </TouchableOpacity>

      {/* Custom Date Range Modal */}
      <CustomDateRangeModal
        visible={showDateRangeModal}
        onClose={() => setShowDateRangeModal(false)}
        onApply={handleCustomDateApply}
        initialFromDate={customFromDate}
        initialToDate={customToDate}
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
    filterButton: {
      padding: theme.spacing.xs,
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      marginLeft: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    micButton: {
      padding: theme.spacing.xs,
    },
    listContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 100,
    },
    dateSection: {
      marginBottom: theme.spacing.lg,
    },
    dateSectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.5,
    },
    entryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    voucherBadge: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
    },
    voucherText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    entryAmount: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    entryTime: {
      fontSize: 11,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    entriesList: {
      marginTop: theme.spacing.md,
    },
    entryLine: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    entryDot: {
      marginRight: theme.spacing.sm,
    },
    entryLineText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    narrationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    narrationText: {
      fontSize: 13,
      color: theme.colors.primary,
      fontStyle: 'italic',
      flex: 1,
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
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl * 2,
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
    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
    },
  });

export default GeneralJournalScreen;

// screens/transactions/TransactionSearchScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

interface Transaction {
  id: string;
  type: string;
  date: string;
  amount: number;
  party?: string;
  description: string;
  reference: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'receipt',
    date: '2025-12-08T10:30:00',
    amount: 45000,
    party: 'Ahmed Electronics',
    description: 'Payment received',
    reference: 'REC-123456',
  },
  {
    id: 'TXN-002',
    type: 'sale',
    date: '2025-12-08T09:15:00',
    amount: 28000,
    party: 'Bilal Store',
    description: 'Samsung Galaxy A54 - 2 units',
    reference: 'INV-123457',
  },
  {
    id: 'TXN-003',
    type: 'expense',
    date: '2025-12-07T14:20:00',
    amount: 7800,
    description: 'Electricity Bill',
    reference: 'EXP-123458',
  },
  // Add more mock transactions
];

const TransactionSearchScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Ahmed Electronics',
    'Electricity',
    'INV-123457',
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const results = mockTransactions.filter(
        txn =>
          txn.description.toLowerCase().includes(query.toLowerCase()) ||
          txn.party?.toLowerCase().includes(query.toLowerCase()) ||
          txn.reference.toLowerCase().includes(query.toLowerCase()) ||
          txn.amount.toString().includes(query),
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleTransactionPress = (transaction: Transaction) => {
    // @ts-ignore
    navigation.navigate('TransactionDetail', { transaction });
  };

  const handleRecentSearchPress = (query: string) => {
    handleSearch(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return { name: 'arrow-down-circle', color: '#34C759' };
      case 'sale':
        return { name: 'cart', color: '#007AFF' };
      case 'purchase':
        return { name: 'basket', color: '#FF9500' };
      case 'expense':
        return { name: 'receipt', color: '#FF3B30' };
      case 'transfer':
        return { name: 'swap-horizontal', color: '#5856D6' };
      case 'payment':
        return { name: 'cash', color: '#FF2D55' };
      default:
        return { name: 'document', color: '#8E8E93' };
    }
  };

  const renderSearchResult = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type);

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => handleTransactionPress(item)}
      >
        <View
          style={[styles.resultIcon, { backgroundColor: icon.color + '20' }]}
        >
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>

        <View style={styles.resultInfo}>
          {item.party && <Text style={styles.resultParty}>{item.party}</Text>}
          <Text style={styles.resultDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.resultReference}>{item.reference}</Text>
        </View>

        <View style={styles.resultRight}>
          <Text
            style={[
              styles.resultAmount,
              {
                color:
                  item.type === 'receipt' || item.type === 'sale'
                    ? '#34C759'
                    : '#FF3B30',
              },
            ]}
          >
            {item.type === 'receipt' || item.type === 'sale' ? '+' : '-'}
            {item.amount.toLocaleString()}
          </Text>
          <Text style={styles.resultDate}>
            {new Date(item.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search transactions..."
          placeholderTextColor="#8E8E93"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results or Recent Searches */}
      {searchQuery.length > 0 ? (
        <View style={styles.resultsContainer}>
          {searchResults.length > 0 ? (
            <>
              <Text style={styles.resultsHeader}>
                {searchResults.length} result
                {searchResults.length !== 1 ? 's' : ''} found
              </Text>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.resultsList}
              />
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={64}
                color="#C7C7CC"
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>
                Try searching with different keywords
              </Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.recentSearchesContainer}>
          <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
          {recentSearches.map((query, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentSearchItem}
              onPress={() => handleRecentSearchPress(query)}
            >
              <Ionicons name="time-outline" size={20} color="#8E8E93" />
              <Text style={styles.recentSearchText}>{query}</Text>
              <Ionicons name="arrow-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          ))}

          {/* Search Suggestions */}
          <Text style={styles.suggestionsTitle}>Search by</Text>
          <View style={styles.suggestionChips}>
            <TouchableOpacity style={styles.suggestionChip}>
              <Text style={styles.suggestionChipText}>Customer name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionChip}>
              <Text style={styles.suggestionChipText}>Amount</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionChip}>
              <Text style={styles.suggestionChipText}>Reference #</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.suggestionChip}>
              <Text style={styles.suggestionChipText}>Description</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
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
    padding: 0,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  resultsList: {
    padding: theme.spacing.md,
  },
  resultCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  resultInfo: {
    flex: 1,
  },
  resultParty: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  resultDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  resultReference: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
  },
  resultRight: {
    alignItems: 'flex-end' as const,
  },
  resultAmount: {
    ...theme.typography.body,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  resultDate: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: theme.spacing.xxl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },
  recentSearchesContainer: {
    padding: theme.spacing.md,
  },
  recentSearchesTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: theme.spacing.sm,
  },
  recentSearchItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  recentSearchText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  suggestionsTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  suggestionChips: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  },
  suggestionChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
  },
  suggestionChipText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
});

export default TransactionSearchScreen;

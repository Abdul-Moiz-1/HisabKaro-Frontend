// flows/shared/components/SearchableList.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import Icon from '../Icon';
import { useThemedStyles } from '../../theme';
import { Theme } from '../../constants/theme';

interface SearchableListProps<T> {
  data: T[];
  searchPlaceholder: string;
  searchKey: keyof T;
  onItemPress: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  emptyMessage?: string;
  sectionHeader?: string;
}

function SearchableList<T>({
  data,
  searchPlaceholder,
  searchKey,
  onItemPress,
  renderItem,
  emptyMessage = 'No items found',
  sectionHeader,
}: SearchableListProps<T>) {
  const styles = useThemedStyles(createStyles);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = data.filter(item =>
    String(item[searchKey]).toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#8E8E93"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          placeholderTextColor="#8E8E93"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      {/* Section Header */}
      {sectionHeader && (
        <Text style={styles.sectionHeader}>{sectionHeader}</Text>
      )}

      {/* List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => onItemPress(item)}
            activeOpacity={0.7}
          >
            {renderItem(item)}
            <Icon name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
        contentContainerStyle={filteredData.length === 0 && styles.emptyList}
      />
    </View>
  );
}

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
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
  sectionHeader: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
    marginTop: theme.spacing.md,
  },
});

export default SearchableList;

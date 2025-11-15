import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Super AI search',
  value,
  onChangeText,
  onSearch,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSearch} style={styles.searchIcon}>
        <Text style={styles.iconText}>🔍</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSearch}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  iconText: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
  },
});


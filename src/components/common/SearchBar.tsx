import React, { useMemo, memo } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { MagnifyingGlassIcon, XIcon } from 'phosphor-react-native';
import { useTheme } from '../../store/hooks';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
}

const SearchBarComponent: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onSearch,
  onClear,
  autoFocus = false,
}) => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.input?.background || theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          paddingHorizontal: theme.spacing.md,
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.sm,
          minHeight: 48,
          borderWidth: 1,
          borderColor: theme.colors.input?.border || theme.colors.border,
        },
        searchIcon: {
          marginRight: theme.spacing.sm,
        },
        input: {
          flex: 1,
          ...theme.typography.body,
          color: theme.colors.text.primary,
          paddingVertical: theme.spacing.sm,
        },
        clearButton: {
          padding: theme.spacing.xs,
          marginLeft: theme.spacing.xs,
        },
      }),
    [theme]
  );

  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onSearch} style={styles.searchIcon} activeOpacity={0.7}>
        <MagnifyingGlassIcon
          size={20}
          color={theme.colors.text.secondary}
          weight="regular"
        />
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.input?.placeholder || theme.colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onSearch}
        autoFocus={autoFocus}
      />
      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <XIcon size={18} color={theme.colors.text.secondary} weight="regular" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export const SearchBar = memo(SearchBarComponent);

// components/DynamicForm/fields/SearchField.tsx
import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FormField } from '../../../types/forms';

import { Theme } from '../../../constants/theme';
import { useThemedStyles } from '../../../theme';
import { useTheme } from '../../../store/hooks';

interface SearchFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const SearchField: React.FC<SearchFieldProps> = ({
  field,
  value,
  onChange,
  onBlur,
}) => {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={value || ''}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          placeholderTextColor={theme.colors.text.disabled}
          returnKeyType="search"
        />
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  searchContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  searchInput: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
});

export default SearchField;

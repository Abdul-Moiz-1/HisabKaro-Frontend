// components/DynamicForm/fields/TextAreaField.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

import { Theme } from '../../../constants/theme';
import { FormField } from '../../../types/forms';
import { useThemedStyles } from '../../../theme';
import { useTheme } from '../../../store/hooks';

interface TextAreaFieldProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const theme = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[styles.inputContainer, error && styles.inputContainerError]}
      >
        <TextInput
          style={styles.input}
          value={value || ''}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          placeholderTextColor={theme.colors.text.disabled}
          multiline={field.multiline}
          numberOfLines={field.numberOfLines || 4}
          textAlignVertical="top"
          maxLength={field.maxLength}
          editable={!field.disabled}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {field.maxLength && (
        <Text style={styles.charCounter}>
          {(value || '').length}/{field.maxLength}
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500' as const,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 100,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    minHeight: 80,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  charCounter: {
    ...theme.typography.caption,
    color: theme.colors.text.disabled,
    textAlign: 'right' as const,
    marginTop: theme.spacing.xs,
  },
});

export default TextAreaField;

// components/DynamicForm/fields/PhoneInputField.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { FormField } from '../../../types/forms';

import { Theme } from '../../../constants/theme';
import { useThemedStyles } from '../../../theme';
import { useTheme } from '../../../store/hooks';

interface PhoneInputFieldProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
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
        {field.icon && <Text style={styles.icon}>{field.icon}</Text>}

        {field.prefix && <Text style={styles.prefix}>{field.prefix}</Text>}

        <TextInput
          style={styles.input}
          value={value || ''}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={field.placeholder}
          placeholderTextColor={theme.colors.text.disabled}
          keyboardType="phone-pad"
          maxLength={10}
          editable={!field.disabled}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
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
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  prefix: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginRight: theme.spacing.xs,
    fontWeight: '600' as const,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default PhoneInputField;

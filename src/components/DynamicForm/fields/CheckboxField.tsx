// components/DynamicForm/fields/CheckboxField.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormField } from '../../../types/forms';
import { Theme } from '../../../theme/types';
import { useThemedStyles } from '../../../theme';

interface CheckboxFieldProps {
  field: FormField;
  value: string[];
  error?: string;
  onChange: (value: string[]) => void;
  onBlur: () => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  value = [],
  error,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);

  const handleToggle = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];

    onChange(newValues);
    onBlur();
  };

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.optionsContainer}>
        {field.options?.map(option => {
          const isChecked =
            Array.isArray(value) && value.includes(option.value as string);

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, option.disabled && styles.optionDisabled]}
              onPress={() =>
                !option.disabled && handleToggle(option.value as string)
              }
              disabled={option.disabled}
              activeOpacity={0.7}
            >
              <View
                style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              >
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>

              {option.icon && (
                <Text style={styles.optionIcon}>{option.icon}</Text>
              )}

              <Text
                style={[
                  styles.optionLabel,
                  isChecked && styles.optionLabelChecked,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: theme.spacing.md,
    fontWeight: '500' as const,
  },
  required: {
    color: theme.colors.error,
  },
  optionsContainer: {
    gap: theme.spacing.sm,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  optionLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  optionLabelChecked: {
    fontWeight: '600' as const,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default CheckboxField;

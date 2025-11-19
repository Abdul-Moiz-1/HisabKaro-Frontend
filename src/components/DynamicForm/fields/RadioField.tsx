// components/DynamicForm/fields/RadioField.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FormField } from '../../../types/forms';
import { Theme } from '../../../constants/theme';
import { useThemedStyles } from '../../../theme';

interface RadioFieldProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur: () => void;
}

const RadioField: React.FC<RadioFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.optionsContainer}>
        {field.options?.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionCard,
              value === option.value && styles.optionCardSelected,
              option.disabled && styles.optionCardDisabled,
            ]}
            onPress={() => {
              if (!option.disabled) {
                onChange(option.value);
                onBlur();
              }
            }}
            activeOpacity={0.7}
            disabled={option.disabled}
          >
            {option.icon && (
              <Text style={styles.optionIcon}>{option.icon}</Text>
            )}

            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionLabel,
                  value === option.value && styles.optionLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </View>

            <View
              style={[
                styles.radioButton,
                value === option.value && styles.radioButtonSelected,
              ]}
            >
              {value === option.value && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        ))}
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
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 64,
  },
  optionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500' as const,
  },
  optionLabelSelected: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default RadioField;

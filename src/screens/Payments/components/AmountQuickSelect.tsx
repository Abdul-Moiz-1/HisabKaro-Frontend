import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../store/hooks';

interface QuickAmountOption {
  label: string;
  value: number | 'full';
}

interface AmountQuickSelectProps {
  options?: QuickAmountOption[];
  selectedValue: number | 'full' | null;
  onSelect: (value: number | 'full') => void;
  fullBalanceAmount?: number;
  disabled?: boolean;
}

const DEFAULT_OPTIONS: QuickAmountOption[] = [
  { label: 'Full Balance', value: 'full' },
  { label: 'Rs. 5,000', value: 5000 },
  { label: 'Rs. 10,000', value: 10000 },
];

const AmountQuickSelectComponent: React.FC<AmountQuickSelectProps> = ({
  options = DEFAULT_OPTIONS,
  selectedValue,
  onSelect,
  fullBalanceAmount,
  disabled = false,
}) => {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginVertical: theme.spacing.md,
        },
        scrollContent: {
          flexDirection: 'row',
          gap: theme.spacing.sm,
        },
        chip: {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1.5,
        },
        chipUnselected: {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        chipSelected: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        chipDisabled: {
          opacity: 0.5,
        },
        chipText: {
          ...theme.typography.bodySmall,
          fontWeight: '500',
        },
        chipTextUnselected: {
          color: theme.colors.text.primary,
        },
        chipTextSelected: {
          color: '#FFFFFF',
        },
      }),
    [theme]
  );

  const isSelected = (optionValue: number | 'full') => {
    if (optionValue === 'full' && selectedValue === 'full') return true;
    if (typeof optionValue === 'number' && selectedValue === optionValue) return true;
    // Also check if full balance equals the selected amount
    if (optionValue === 'full' && fullBalanceAmount && selectedValue === fullBalanceAmount) {
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option, index) => {
          const selected = isSelected(option.value);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.chip,
                selected ? styles.chipSelected : styles.chipUnselected,
                disabled && styles.chipDisabled,
              ]}
              onPress={() => onSelect(option.value)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  selected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export const AmountQuickSelect = memo(AmountQuickSelectComponent);

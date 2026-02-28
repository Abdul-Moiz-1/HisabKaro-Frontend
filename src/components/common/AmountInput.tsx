// flows/shared/components/AmountInput.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from '../Icon';
import { Theme } from '../../constants/theme';
import { useThemedStyles } from '../../theme';

interface QuickAmount {
  label: string;
  value: number;
}

interface AmountInputProps {
  value: number;
  onChange: (value: number) => void;
  quickAmounts?: QuickAmount[];
  currency?: string;
}

const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  quickAmounts = [],
  currency = 'PKR',
}) => {
  const styles = useThemedStyles(createStyles);

  const handleQuickAmount = (amount: number) => {
    onChange(amount);
  };

  // Simple keypad buttons
  const handleNumberPress = (num: string) => {
    if (num === 'clear') {
      onChange(0);
      return;
    }
    if (num === 'backspace') {
      onChange(Math.floor(value / 10));
      return;
    }
    const newValue = value * 10 + parseInt(num);
    onChange(newValue);
  };

  return (
    <View style={styles.container}>
      {/* Amount Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.currency}>{currency}</Text>
        <Text style={styles.amount}>{value.toLocaleString()}</Text>
      </View>

      {/* Quick Amounts */}
      {quickAmounts.length > 0 && (
        <View style={styles.quickAmountsContainer}>
          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((qa, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmount(qa.value)}
              >
                <Text style={styles.quickAmountText}>{qa.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['clear', '0', 'backspace'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map(key => (
              <TouchableOpacity
                key={key}
                style={styles.keypadButton}
                onPress={() => handleNumberPress(key)}
              >
                {key === 'backspace' ? (
                  <Icon name="backspace" size={24} color="#000" />
                ) : key === 'clear' ? (
                  <Text style={styles.keypadButtonTextSmall}>Clear</Text>
                ) : (
                  <Text style={styles.keypadButtonText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

interface AmountInputStyles {
  container: ViewStyle;
  displayContainer: ViewStyle;
  currency: TextStyle;
  amount: TextStyle;
  quickAmountsContainer: ViewStyle;
  quickAmountsLabel: TextStyle;
  quickAmounts: ViewStyle;
  quickAmountButton: ViewStyle;
  quickAmountText: TextStyle;
  keypad: ViewStyle;
  keypadRow: ViewStyle;
  keypadButton: ViewStyle;
  keypadButtonText: TextStyle;
  keypadButtonTextSmall: TextStyle;
}

const createStyles = (theme: Theme): AmountInputStyles =>
  StyleSheet.create<AmountInputStyles>({
    container: {
      width: '100%',
    },
    displayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    currency: {
      ...theme.typography.h2,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.sm,
    },
    amount: {
      ...theme.typography.h1,
      fontSize: 36,
      color: theme.colors.text.primary,
      fontWeight: 'bold',
    },
    quickAmountsContainer: {
      marginBottom: theme.spacing.lg,
    },
    quickAmountsLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
    quickAmounts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    quickAmountButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
    },
    quickAmountText: {
      ...theme.typography.caption,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    keypad: {
      marginTop: theme.spacing.md,
    },
    keypadRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    keypadButton: {
      flex: 1,
      aspectRatio: 2,
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.xs,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    keypadButtonText: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    keypadButtonTextSmall: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
  });

export default AmountInput;

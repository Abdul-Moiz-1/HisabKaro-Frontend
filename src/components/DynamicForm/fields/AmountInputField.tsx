// components/DynamicForm/fields/AmountInputField.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FormField } from '../../../types/forms';
import { useThemedStyles } from '../../../theme';
import { Theme } from '../../../constants/theme';

interface AmountInputFieldProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const AmountInputField: React.FC<AmountInputFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);
  const [showKeypad, setShowKeypad] = useState(false);

  const handleNumberPress = (num: string) => {
    const currentValue = value || '0';

    // Don't allow multiple decimal points
    if (num === '.' && currentValue.includes('.')) return;

    // Don't allow more than 2 decimal places
    if (currentValue.includes('.')) {
      const parts = currentValue.split('.');
      if (parts[1] && parts[1].length >= 2) return;
    }

    const newValue =
      currentValue === '0' && num !== '.' ? num : currentValue + num;

    onChange(newValue);
  };

  const handleBackspace = () => {
    const currentValue = value || '0';
    const newValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    onChange(newValue);
  };

  const handleClear = () => {
    onChange('0');
  };

  const handleConfirm = () => {
    setShowKeypad(false);
    onBlur();
  };

  const formatAmount = (amount: string) => {
    if (!amount || amount === '0') return '0';
    const num = parseFloat(amount);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.amountDisplay, error && styles.amountDisplayError]}
        onPress={() => setShowKeypad(true)}
        activeOpacity={0.7}
      >
        {field.prefix && <Text style={styles.prefix}>{field.prefix}</Text>}

        <Text style={styles.amount}>{formatAmount(value || '0')}</Text>

        {field.suffix && <Text style={styles.suffix}>{field.suffix}</Text>}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showKeypad}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKeypad(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowKeypad(false)}
        >
          <View style={styles.keypadContainer}>
            <View style={styles.displayContainer}>
              <Text style={styles.displayAmount}>
                {field.suffix} {formatAmount(value || '0')}
              </Text>
            </View>

            <View style={styles.keypad}>
              {/* Number rows */}
              <View style={styles.keypadRow}>
                {['1', '2', '3'].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={styles.key}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={styles.keyText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.keypadRow}>
                {['4', '5', '6'].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={styles.key}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={styles.keyText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.keypadRow}>
                {['7', '8', '9'].map(num => (
                  <TouchableOpacity
                    key={num}
                    style={styles.key}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={styles.keyText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.keypadRow}>
                <TouchableOpacity
                  style={styles.key}
                  onPress={() => handleNumberPress('.')}
                >
                  <Text style={styles.keyText}>.</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.key}
                  onPress={() => handleNumberPress('0')}
                >
                  <Text style={styles.keyText}>0</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.key}
                  onPress={() => handleNumberPress('00')}
                >
                  <Text style={styles.keyText}>00</Text>
                </TouchableOpacity>
              </View>

              {/* Action row */}
              <View style={styles.keypadRow}>
                <TouchableOpacity
                  style={[styles.key, styles.actionKey]}
                  onPress={handleClear}
                >
                  <Text style={styles.actionKeyText}>Clear</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.key, styles.actionKey]}
                  onPress={handleBackspace}
                >
                  <Text style={styles.actionKeyText}>←</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.key, styles.confirmKey]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.confirmKeyText}>✓</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  amountDisplay: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 80,
  },
  amountDisplayError: {
    borderColor: theme.colors.error,
  },
  prefix: {
    ...theme.typography.h2,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  amount: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  suffix: {
    ...theme.typography.h3,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  keypadContainer: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: theme.spacing.lg,
  },
  displayContainer: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center' as const,
  },
  displayAmount: {
    ...theme.typography.h1,
    fontSize: 36,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  keypad: {
    padding: theme.spacing.md,
  },
  keypadRow: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  key: {
    flex: 1,
    aspectRatio: 2,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  keyText: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  actionKey: {
    backgroundColor: theme.colors.surface,
  },
  actionKeyText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  confirmKey: {
    backgroundColor: theme.colors.primary,
  },
  confirmKeyText: {
    fontSize: 28,
    color: theme.colors.text.inverse,
    fontWeight: 'bold' as const,
  },
});

export default AmountInputField;

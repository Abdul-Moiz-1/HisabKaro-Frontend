import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BankIcon, MoneyIcon, WalletIcon } from 'phosphor-react-native';
import { useTheme } from '../../../store/hooks';
import { PaymentMethodType, PAYMENT_METHODS } from '../schemas/paymentSchemas';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  disabled?: boolean;
}

const PaymentMethodSelectorComponent: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}) => {
  const theme = useTheme();

  const getIcon = (iconName: string, isSelected: boolean) => {
    const color = isSelected ? theme.colors.primary : theme.colors.text.secondary;
    const size = 28;

    switch (iconName) {
      case 'bank':
        return <BankIcon size={size} color={color} weight={isSelected ? 'fill' : 'regular'} />;
      case 'money':
        return <MoneyIcon size={size} color={color} weight={isSelected ? 'fill' : 'regular'} />;
      case 'wallet':
        return <WalletIcon size={size} color={color} weight={isSelected ? 'fill' : 'regular'} />;
      default:
        return <MoneyIcon size={size} color={color} weight="regular" />;
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginVertical: theme.spacing.md,
        },
        label: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: theme.spacing.sm,
        },
        grid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
        },
        methodButton: {
          flex: 1,
          minWidth: 70,
          maxWidth: 90,
          aspectRatio: 1,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.sm,
        },
        methodButtonUnselected: {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        },
        methodButtonSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}15`,
        },
        methodButtonDisabled: {
          opacity: 0.5,
        },
        methodLabel: {
          ...theme.typography.caption,
          marginTop: theme.spacing.xs,
          textAlign: 'center',
        },
        methodLabelUnselected: {
          color: theme.colors.text.secondary,
        },
        methodLabelSelected: {
          color: theme.colors.primary,
          fontWeight: '600',
        },
      }),
    [theme]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Payment Mode / Tariqa-e-Adaigi</Text>
      <View style={styles.grid}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodButton,
                isSelected ? styles.methodButtonSelected : styles.methodButtonUnselected,
                disabled && styles.methodButtonDisabled,
              ]}
              onPress={() => onSelectMethod(method.id as PaymentMethodType)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              {getIcon(method.icon, isSelected)}
              <Text
                style={[
                  styles.methodLabel,
                  isSelected ? styles.methodLabelSelected : styles.methodLabelUnselected,
                ]}
              >
                {method.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export const PaymentMethodSelector = memo(PaymentMethodSelectorComponent);

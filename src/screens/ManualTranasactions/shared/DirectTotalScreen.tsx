// flows/sales/screens/DirectTotalScreen.tsx
import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../../../store/hooks';

import { AmountInputField } from '../../../components/DynamicForm';
import { FieldType } from '../../../types/forms';
import ActionButton from '../../../components/common/ActionButton';
import {
  DirectTotalFormValues,
  directTotalSchema,
} from '../sales/schemas/salesSchemas';
import { FlowType } from '../../../types/trasactions';
import { useDirectTotalSelectionFlow } from './hooks/useDirectTotalFlow';
type RouteParams = {
  DirectTotal: {
    flowType?: FlowType;
  };
};
const DirectTotalScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'DirectTotal'>>();

  const { flowType = 'sales' } = route.params || {};

  const { party, setDirectTotalAmount, isWalkIn, amount, config } =
    useDirectTotalSelectionFlow(flowType);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // React Hook Form setup with Zod validation
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<DirectTotalFormValues>({
    resolver: zodResolver(directTotalSchema),
    mode: 'onChange',
    defaultValues: {
      total: 0,
      notes: '',
    },
  });

  const totalAmount = watch('total');

  const handleContinue = useCallback(
    (data: DirectTotalFormValues) => {
      // Set direct total in Redux
      setDirectTotalAmount(data.total);

      // Navigate to payment terms screen
      // @ts-ignore
      navigation.navigate(config?.nextScreen || 'PaymentTerms', { flowType });
    },
    [setDirectTotalAmount, navigation, config?.nextScreen, flowType],
  );

  // Quick amount options
  const quickAmounts = useMemo(() => {
    const amounts: { label: string; value: number }[] = [];

    if (amount > 0) {
      amounts.push({
        label: `Full ${amount.toLocaleString()}`,
        value: amount,
      });
    }

    if (amount >= 2) {
      const half = Math.floor(amount / 2);
      amounts.push({
        label: `Half ${half.toLocaleString()}`,
        value: half,
      });
    }

    if (amount >= 25000) {
      amounts.push({ label: '25k', value: 25000 });
    }

    if (amount >= 10000) {
      amounts.push({ label: '10k', value: 10000 });
    }

    if (amount >= 5000) {
      amounts.push({ label: '5k', value: 5000 });
    }

    return amounts;
  }, [amount]);

  const partyName = isWalkIn ? 'Walk-in ' : party?.name || '';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* party Info */}
        <View style={styles.partyCard}>
          <Text style={styles.partyLabel}>{config?.partyLabel}</Text>
          <Text style={styles.partyName}>{partyName}</Text>
        </View>

        {/* Info Message */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>{config?.infoText}</Text>
        </View>

        {/* Question */}
        <Text style={styles.question}>{config?.question}</Text>

        {/* Amount Input with React Hook Form */}
        <Controller
          control={control}
          name="total"
          render={({ field: { onChange, value } }) => (
            <AmountInputField
              field={{
                id: 'amount',
                name: 'amount',
                label: '',
                required: true,
                type: FieldType.AMOUNT,
                placeholder: '0',
                suffix: 'PKR',
              }}
              value={value.toString()}
              onChange={text => onChange(parseFloat(text) || 0)}
              error={errors.total?.message}
              quickAmounts={quickAmounts}
              onBlur={() => {}}
            />
          )}
        />

        {/* Summary Card */}
        {totalAmount > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{config?.summaryLabel}</Text>
              <Text style={styles.summaryValue}>
                PKR {totalAmount.toLocaleString()}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleSubmit(handleContinue)}
          disabled={!isValid || totalAmount <= 0}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    partyCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    partyLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    partyName: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    infoBox: {
      flexDirection: 'row',
      backgroundColor: `${theme.colors.primary}15`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    infoIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      flex: 1,
      lineHeight: 18,
    },
    question: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    summaryValue: {
      fontSize: 22,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default DirectTotalScreen;

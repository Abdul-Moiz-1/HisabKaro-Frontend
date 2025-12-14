import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';

interface CurrencyCardData {
  id: string;
  amount: string;
  label: string;
  icon: string;
}

const currencyData: CurrencyCardData[] = [
  {
    id: '1',
    amount: '$425',
    label: 'PASHABANK USD',
    icon: '🏛️',
  },
  {
    id: '2',
    amount: '$600',
    label: 'Cash USD',
    icon: '💵',
  },
  {
    id: '3',
    amount: '$775',
    label: 'LEON',
    icon: '🦁',
  },
];

interface CurrencyCardsProps {
  onCardPress?: (accountId: string) => void;
  onSeeAll?: () => void;
}

export const CurrencyCards: React.FC<CurrencyCardsProps> = ({
  onCardPress,
  onSeeAll,
}) => {
  return (
    <View style={styles.container}>
      {currencyData.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => onCardPress?.(item.id)}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <Text style={styles.amount}>{item.amount}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
      {onSeeAll && (
        <TouchableOpacity style={styles.seeAllCard} onPress={onSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  amount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },
  seeAllCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  seeAllText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

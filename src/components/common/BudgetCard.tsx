import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

export interface Budget {
  id: string;
  name: string;
  spent: number;
  limit: number;
  period: 'Monthly' | 'Weekly' | 'Yearly';
}

interface BudgetCardProps {
  budget: Budget;
  onPress?: () => void;
  showSeeAll?: boolean;
  onSeeAll?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onPress,
  showSeeAll = false,
  onSeeAll,
}) => {
  const percentage = (budget.spent / budget.limit) * 100;
  const isOverspending = percentage >= 100;
  const isRisk = percentage >= 90 && percentage < 100;
  const isWithin = percentage < 90;

  const getStatusColor = () => {
    if (isOverspending) return theme.colors.error;
    if (isRisk) return theme.colors.warning;
    return theme.colors.primary;
  };

  const getStatusText = () => {
    if (isOverspending) return 'Overspending';
    if (isRisk) return 'Risk';
    return 'Within';
  };

  // Calculate the angle for the circular progress
  const angle = Math.min(percentage, 100) * 3.6; // Convert to degrees (360/100)

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{budget.name}</Text>
        {showSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.label}>{budget.period} spending limit</Text>
          <Text style={styles.spentAmount}>
            Spend: ${budget.spent.toLocaleString()} / ${budget.limit.toLocaleString()}
          </Text>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Within</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.legendText}>Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.legendText}>Overspending</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.progressRing}>
            <View style={styles.progressBackground} />
            {angle > 0 && (
              <View
                style={[
                  styles.progressForeground,
                  {
                    borderColor: getStatusColor(),
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            )}
            <View style={styles.progressCenter}>
              <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  seeAll: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  spentAmount: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 11,
  },
  chartSection: {
    alignItems: 'center',
  },
  progressRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: theme.colors.border,
  },
  progressForeground: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: theme.colors.primary,
  },
  progressCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  percentageText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    fontSize: 20,
  },
});


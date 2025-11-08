import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';

interface MonthlyBudgetProps {
  spent: number;
  limit: number;
}

export const MonthlyBudget: React.FC<MonthlyBudgetProps> = ({ spent, limit }) => {
  const percentage = (spent / limit) * 100;
  const remaining = limit - spent;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Budget</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.label}>Monthly</Text>
          <Text style={styles.label}>spending limit</Text>
          <Text style={styles.spentAmount}>Spend: ${spent.toLocaleString()}/${limit.toLocaleString()}</Text>
          
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Within</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
              <Text style={styles.legendText}>Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.secondary }]} />
              <Text style={styles.legendText}>Overspending</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.progressRing}>
            <View style={styles.progressBackground} />
            <View 
              style={[
                styles.progressForeground,
                {
                  transform: [{ rotate: `${(percentage / 100) * 360}deg` }]
                }
              ]} 
            />
            <View style={styles.progressCenter}>
              <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
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
    borderColor: theme.colors.primary,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
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

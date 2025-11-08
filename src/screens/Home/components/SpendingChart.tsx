import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../../constants/theme';

interface SpendingChartProps {
  period: 'Daily' | 'Weekly' | 'Monthly';
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ period }) => {
  // Mock data for the chart
  const chartData = [
    { day: 'Mon', amount: 2500 },
    { day: 'Tue', amount: 1800 },
    { day: 'Wed', amount: 3200 },
    { day: 'Thu', amount: 2100 },
    { day: 'Fri', amount: 2800 },
    { day: 'Sat', amount: 3500 },
    { day: 'Sun', amount: 1900 },
  ];

  const maxAmount = Math.max(...chartData.map(item => item.amount));

  return (
    <View style={styles.container}>
      <Text style={styles.periodLabel}>23 May</Text>
      <View style={styles.chart}>
        {chartData.map((item, index) => {
          const height = (item.amount / maxAmount) * 100;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barBackground}>
                <View 
                  style={[
                    styles.bar,
                    { 
                      height: `${height}%`,
                      backgroundColor: index === 5 ? theme.colors.primary : theme.colors.secondary
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dayLabel}>{item.day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  periodLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: theme.spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  barBackground: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 10,
  },
  dayLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    fontSize: 11,
  },
});

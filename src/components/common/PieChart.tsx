import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export interface PieChartSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  segments: PieChartSegment[];
  total: number;
  size?: number;
  showLegend?: boolean;
}

export const PieChart: React.FC<PieChartProps> = ({
  segments,
  total,
  size = 200,
  showLegend = true,
}) => {
  // Calculate angles for each segment
  let currentAngle = -90; // Start from top
  const segmentAngles = segments.map((segment) => {
    const percentage = (segment.value / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return {
      ...segment,
      startAngle,
      endAngle: currentAngle,
      percentage,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={[styles.pieChart, { width: size, height: size }]}>
          {/* Simplified pie chart visualization */}
          {/* In a production app, use react-native-svg for proper pie chart rendering */}
          <View style={styles.chartBackground}>
            {segments.map((segment) => {
              const percentage = (segment.value / total) * 100;
              return (
                <View
                  key={segment.id}
                  style={[
                    styles.segmentIndicator,
                    {
                      backgroundColor: segment.color,
                      width: `${percentage}%`,
                    },
                  ]}
                />
              );
            })}
          </View>
          <View style={[styles.center, { width: size, height: size }]}>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
            <Text style={styles.totalLabel}>Total</Text>
          </View>
        </View>
      </View>

      {showLegend && (
        <View style={styles.legend}>
          {segments.map((segment) => (
            <View key={segment.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText}>{segment.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChart: {
    borderRadius: 1000,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  chartBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  segmentIndicator: {
    height: '100%',
  },
  center: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  totalAmount: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
  },
  totalLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  legend: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.xs,
  },
  legendText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
});


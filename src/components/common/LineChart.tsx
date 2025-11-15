import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../constants/theme';

export interface ChartDataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  lineColor?: string;
  fillColor?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 150,
  showGrid = true,
  lineColor = theme.colors.primary,
  fillColor = theme.colors.primary,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const getYPosition = (value: number) => {
    return ((value - minValue) / range) * height;
  };

  // Generate grid lines
  const gridLines = showGrid ? 5 : 0;
  const gridStep = height / (gridLines + 1);
  const valueStep = range / (gridLines + 1);

  return (
    <View style={styles.container}>
      {showGrid && (
        <View style={styles.gridContainer}>
          {Array.from({ length: gridLines }).map((_, index) => {
            const yPos = (index + 1) * gridStep;
            const value = maxValue - (index + 1) * valueStep;
            return (
              <View key={index} style={[styles.gridLine, { top: yPos }]}>
                <Text style={styles.gridLabel}>${Math.round(value)}</Text>
              </View>
            );
          })}
        </View>
      )}

      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.chart}>
          {data.map((point, index) => {
            const xPos = (index / (data.length - 1)) * 100;
            const yPos = getYPosition(point.value);
            return (
              <View
                key={index}
                style={[
                  styles.point,
                  {
                    left: `${xPos}%`,
                    bottom: yPos,
                    backgroundColor: lineColor,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      <View style={styles.labelsContainer}>
        {data.map((point, index) => (
          <Text key={index} style={styles.label}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  gridContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.divider,
    zIndex: 0,
  },
  gridLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 10,
    position: 'absolute',
    left: -40,
    top: -8,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  chart: {
    flex: 1,
    position: 'relative',
  },
  point: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginBottom: -3,
    zIndex: 2,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 11,
  },
});


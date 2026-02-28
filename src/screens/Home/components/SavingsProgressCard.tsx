import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../../constants/theme';

interface SavingsProgressCardProps {
  savedAmount: number;
  targetAmount: number;
  message: string;
  subtitle: string;
}

export const SavingsProgressCard: React.FC<SavingsProgressCardProps> = ({
  savedAmount,
  targetAmount,
  message,
  subtitle,
}) => {
  const progressPercentage = (savedAmount / targetAmount) * 100;
  const circumference = 2 * Math.PI * 35; // radius = 35
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <TouchableOpacity>
            <Text style={styles.viewDetails}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            {/* Circular Progress Ring */}
            <View style={styles.progressRing}>
              <View style={styles.progressBackground} />
              <View
                style={[
                  styles.progressForeground,
                  {
                    transform: [
                      { rotate: `${(progressPercentage / 100) * 360}deg` },
                    ],
                  },
                ]}
              />
              <View style={styles.progressCenter}>
                <Text style={styles.progressAmount}>Rs.{savedAmount}K</Text>
                <Text style={styles.progressLabel}>Saved</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
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
  message: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  viewDetails: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  progressSection: {
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: theme.colors.border,
  },
  progressForeground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
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
  progressAmount: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontSize: 12,
  },
});

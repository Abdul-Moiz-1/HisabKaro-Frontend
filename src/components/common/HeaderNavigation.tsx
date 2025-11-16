import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { Theme, useThemedStyles } from '../../theme';

interface HeaderNavigationProps {
  title: string;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
}

const HeaderNavigationComponent: React.FC<HeaderNavigationProps> = ({
  title,
  onBackPress,
  rightComponent,
  showBackButton = true,
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightComponent && (
        <View style={styles.rightContainer}>{rightComponent}</View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  leftContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  backButton: {
    marginRight: theme.spacing.sm,
    padding: theme.spacing.xs,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    minWidth: 32,
    minHeight: 32,
  },
  backButtonText: {
    fontSize: 32,
    color: theme.colors.text.primary,
    lineHeight: 32,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    flex: 1,
  },
  rightContainer: {
    alignItems: 'flex-end' as const,
  },
});

export const HeaderNavigation = memo(HeaderNavigationComponent);

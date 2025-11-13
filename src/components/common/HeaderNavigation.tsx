import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

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
      {rightComponent && <View style={styles.rightContainer}>{rightComponent}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: theme.spacing.sm,
    padding: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'flex-end',
  },
});

export const HeaderNavigation = memo(HeaderNavigationComponent);


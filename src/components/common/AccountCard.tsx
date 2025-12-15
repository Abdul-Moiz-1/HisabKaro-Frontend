import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils';

interface AccountCardProps {
  name: string;
  balance: number;
  currency?: string;
  icon?: string;
  onPress?: () => void;
  isAddNew?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  name,
  balance,
  currency = 'USD',
  icon,
  onPress,
  isAddNew = false,
}) => {
  if (isAddNew) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.addCard]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.addIconContainer}>
          <View style={styles.addIconHorizontal} />
          <View style={styles.addIconVertical} />
        </View>
        <Text style={styles.addText}>Add new</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{icon || '🏦'}</Text>
      </View>
      <Text style={styles.balance}>{formatCurrency(balance)}</Text>
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    ...theme.shadows.md,
  },
  addCard: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconText: {
    fontSize: 24,
  },
  balance: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  name: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  addIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  addIconHorizontal: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  addIconVertical: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: theme.colors.text.secondary,
    borderRadius: 1,
  },
  addText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
});


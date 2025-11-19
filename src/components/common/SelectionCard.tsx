// flows/shared/components/SelectionCard.tsx
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useThemedStyles } from '../../theme';
import { Theme } from '../../constants/theme';

interface SelectionCardProps {
  icon: string;
  label: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({
  icon,
  label,
  description,
  selected = false,
  disabled = false,
  onPress,
}) => {
  const styles = useThemedStyles(createStyles);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.content}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        <Text
          style={[styles.description, disabled && styles.descriptionDisabled]}
        >
          {description}
        </Text>
      </View>
      <View
        style={[styles.checkCircle, selected && styles.checkCircleSelected]}
      >
        {selected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => ({
  card: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  labelDisabled: {
    color: theme.colors.text.disabled,
  },
  description: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  descriptionDisabled: {
    color: theme.colors.text.disabled,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkCircleSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
});

export default SelectionCard;

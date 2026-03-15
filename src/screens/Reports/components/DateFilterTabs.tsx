import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CalendarIcon } from 'phosphor-react-native';
import { useTheme } from '../../../store/hooks';

export type DateFilterOption = 'thisMonth' | 'lastMonth' | 'last30Days' | 'custom';

interface DateFilterTabsProps {
  selected: DateFilterOption;
  onSelect: (option: DateFilterOption) => void;
  onCustomPress?: () => void;
  options?: { value: DateFilterOption; label: string }[];
  showCustomDate?: boolean;
  customDateLabel?: string;
}

const DEFAULT_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
];

const DateFilterTabs: React.FC<DateFilterTabsProps> = ({
  selected,
  onSelect,
  onCustomPress,
  options = DEFAULT_OPTIONS,
  showCustomDate = false,
  customDateLabel,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        const isCustomWithDate = option.value === 'custom' && showCustomDate && customDateLabel;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.tab, isSelected && styles.tabActive]}
            onPress={() => {
              if (option.value === 'custom' && onCustomPress) {
                onCustomPress();
              } else {
                onSelect(option.value);
              }
            }}
            activeOpacity={0.7}
          >
            {option.value === 'custom' && (
              <CalendarIcon
                size={14}
                color={isSelected ? '#FFFFFF' : theme.colors.text.secondary}
                style={styles.calendarIcon}
              />
            )}
            <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
              {isCustomWithDate ? customDateLabel : option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    tab: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.surface,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    tabTextActive: {
      color: '#FFFFFF',
    },
    calendarIcon: {
      marginRight: theme.spacing.xs,
    },
  });

export default DateFilterTabs;

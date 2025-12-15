// flows/editTransaction/screens/SelectCategoryScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';

import Icon from '../../../components/Icon';
import { useThemedStyles } from '../../../theme';
import { useFlowNavigation } from '../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionButton from '../../../components/common/ActionButton';
import { Theme } from '../../../constants/theme';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const expenseCategories: Category[] = [
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#007AFF' },
  { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#FF9500' },
  { id: 'water', name: 'Water', icon: '💧', color: '#5AC8FA' },
  { id: 'phone', name: 'Phone/Internet', icon: '📞', color: '#34C759' },
  { id: 'salaries', name: 'Salaries', icon: '👥', color: '#AF52DE' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#FF2D55' },
  { id: 'food', name: 'Food/Tea', icon: '🍽️', color: '#FF3B30' },
  { id: 'supplies', name: 'Supplies', icon: '📦', color: '#FF9500' },
  { id: 'repairs', name: 'Repairs', icon: '🔧', color: '#8E8E93' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: '#5856D6' },
  {
    id: 'professional',
    name: 'Professional Fees',
    icon: '💼',
    color: '#007AFF',
  },
  { id: 'bank', name: 'Bank Charges', icon: '🏦', color: '#34C759' },
  { id: 'other', name: 'Other', icon: '📚', color: '#8E8E93' },
];

const SelectCategoryScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { goBack } = useFlowNavigation();

  // @ts-ignore
  const { currentCategory } = route.params?.flowData || {};

  const [selectedCategory, setSelectedCategory] =
    useState<string>(currentCategory);

  const handleConfirm = () => {
    const category = expenseCategories.find(c => c.id === selectedCategory);
    goBack();
    // goBack({ category: category?.name });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Icon name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoBannerText}>
            Select a new category for this expense
          </Text>
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {expenseCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardSelected,
                { borderColor: category.color + '40' },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === category.id && { color: category.color },
                ]}
                numberOfLines={2}
              >
                {category.name}
              </Text>
              {selectedCategory === category.id && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: category.color },
                  ]}
                >
                  <Icon name="checkmark" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Confirm Category"
          onPress={handleConfirm}
          disabled={!selectedCategory}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  infoBanner: {
    flexDirection: 'row' as const,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  infoBannerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.md,
  },
  categoryCard: {
    width: '30%' as const,
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: theme.spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    position: 'relative' as const,
    ...theme.shadows.sm,
  },
  categoryCardSelected: {
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  selectedBadge: {
    position: 'absolute' as const,
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default SelectCategoryScreen;

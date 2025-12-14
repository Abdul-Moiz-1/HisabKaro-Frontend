// flows/expense/screens/ExpenseCategorySelectionScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from 'react-native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInputField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import Icon from '../../../../components/Icon';


interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

interface RecentExpense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

const expenseCategories: ExpenseCategory[] = [
  { id: 'rent', name: 'Rent', icon: '🏠', color: '#FF3B30' },
  { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#FF9500' },
  { id: 'water', name: 'Water', icon: '💧', color: '#007AFF' },
  { id: 'phone', name: 'Phone/Internet', icon: '📞', color: '#5856D6' },
  { id: 'salaries', name: 'Salaries', icon: '👥', color: '#34C759' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#FF2D55' },
  { id: 'food', name: 'Food/Tea', icon: '🍽️', color: '#FF9500' },
  { id: 'supplies', name: 'Supplies', icon: '📦', color: '#8E8E93' },
  { id: 'repairs', name: 'Repairs', icon: '🔧', color: '#5856D6' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: '#FF2D55' },
  {
    id: 'professional',
    name: 'Professional Fees',
    icon: '💼',
    color: '#007AFF',
  },
  { id: 'bank', name: 'Bank Charges', icon: '🏦', color: '#34C759' },
  { id: 'other', name: 'Other', icon: '📚', color: '#8E8E93' },
];

const mockRecentExpenses: RecentExpense[] = [
  {
    id: '1',
    category: 'Electricity',
    description: 'Electricity bill (Last month)',
    amount: 7800,
    date: '2025-10-22',
  },
  {
    id: '2',
    category: 'Rent',
    description: 'Shop rent (October)',
    amount: 45000,
    date: '2025-10-05',
  },
];

const ExpenseCategorySelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleCategorySelect = (category: ExpenseCategory) => {
    navigateToScreen('ExpenseDetails', { category });
  };

  const handleRecentExpenseSelect = (expense: RecentExpense) => {
    const category = expenseCategories.find(c => c.name === expense.category);
    navigateToScreen('ExpenseDetails', {
      category,
      prefillAmount: expense.amount,
    });
  };

  const handleAddCustomCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: ExpenseCategory = {
        id: Date.now().toString(),
        name: newCategoryName,
        icon: '📝',
      };
      handleCategorySelect(newCategory);
      setShowAddCategoryModal(false);
      setNewCategoryName('');
    }
  };

  const filteredCategories = expenseCategories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Question */}
        <Text style={styles.question}>What did you pay for?</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={20}
            color="#8E8E93"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="🔍 Search or describe..."
            placeholderTextColor="#8E8E93"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        {/* Recent Expenses */}
        {searchQuery === '' && mockRecentExpenses.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Expenses</Text>
            {mockRecentExpenses.map(expense => (
              <TouchableOpacity
                key={expense.id}
                style={styles.recentExpenseCard}
                onPress={() => handleRecentExpenseSelect(expense)}
              >
                <View style={styles.recentExpenseInfo}>
                  <Text style={styles.recentExpenseDescription}>
                    {expense.description}
                  </Text>
                  <Text style={styles.recentExpenseAmount}>
                    PKR {expense.amount.toLocaleString()}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Grid */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryGrid}>
          {filteredCategories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategorySelect(category)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.categoryIconContainer,
                  { backgroundColor: (category.color || '#007AFF') + '20' },
                ]}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add Custom Category Button */}
        <TouchableOpacity
          style={styles.addCategoryButton}
          onPress={() => setShowAddCategoryModal(true)}
        >
          <Icon name="add-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.addCategoryButtonText}>
            + Add custom category
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Custom Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Category</Text>

            <TextInputField
              field={{
                id: 'newCategoryName',
                name: 'newCategoryName',
                label: 'Category Name',
                placeholder: 'Enter category name',
                required: true,
                type: FieldType.TEXT,
              }}
              value={newCategoryName}
              onChange={setNewCategoryName}
              onBlur={() => { }}
            />

            <View style={styles.modalButtons}>
              <ActionButton
                title="Cancel"
                onPress={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName('');
                }}
                variant="outline"
              />
              <View style={styles.modalButtonSpacer} />
              <ActionButton
                title="Add"
                onPress={handleAddCustomCategory}
                variant="primary"
                disabled={!newCategoryName.trim()}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
  recentSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    marginBottom: theme.spacing.sm,
  },
  recentExpenseCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  recentExpenseInfo: {
    flex: 1,
  },
  recentExpenseDescription: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  recentExpenseAmount: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  categoryGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  categoryCard: {
    width: '31%' as const,
    aspectRatio: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...theme.shadows.sm,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
    fontWeight: '600' as const,
  },
  addCategoryButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  addCategoryButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '100%' as const,
    maxWidth: 400,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  modalButtonSpacer: {
    width: theme.spacing.sm,
  },
});

export default ExpenseCategorySelectionScreen;

import { NavigationProps } from '../../types';
import { Theme, theme } from '../../constants/theme';
import { Container, HeaderNavigation } from '../../components/common';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useThemedStyles } from '../../theme';
import { ROUTES } from '../../constants/routes';

// Menu data structure - easily replaceable with API data
const menuSections: MenuSection[] = [
  {
    id: 'money-in',
    title: 'MONEY COMING IN',
    emoji: '💰',
    color: '#10B981',
    options: [
      {
        id: 'customer-payment',
        label: 'Customer paid me',
        icon: '👤',
        route: ROUTES.ADD_TRANSACTION_RECEIPT,
      },
      {
        id: 'sales',
        label: 'Sold something',
        icon: '🛍️',
        route: ROUTES.ADD_TRANSACTION_SALES,
      },
      // {
      //   id: 'advance-received',
      //   label: 'Got advance payment',
      //   icon: '⏰',
      //   route: '/transactions/customer-payment',
      //   params: { isAdvance: true },
      // },
      // {
      //   id: 'loan-received',
      //   label: 'Received loan',
      //   icon: '🏦',
      //   route: '/transactions/loan-receipt',
      // },
      // {
      //   id: 'bank-deposit',
      //   label: 'Cash deposited to bank',
      //   icon: '🏧',
      //   route: ROUTES.ADD_TRANSACTION_BANK,
      // },
      // {
      //   id: 'other-income',
      //   label: 'Other income',
      //   icon: '💵',
      //   route: '/transactions/other-income',
      // },
    ],
  },
  {
    id: 'money-out',
    title: 'MONEY GOING OUT',
    emoji: '💸',
    color: '#EF4444',
    options: [
      {
        id: 'supplier-payment',
        label: 'Paid to supplier',
        icon: '🏪',
        route: ROUTES.ADD_TRANSACTION_SUPPLIER_PAYMENT,
      },
      {
        id: 'purchase',
        label: 'Bought inventory/goods',
        icon: '📦',
        route: ROUTES.ADD_TRANSACTION_PURCHASE,
      },
      // {
      //   id: 'expense',
      //   label: 'Paid expense',
      //   icon: '🧾',
      //   route: ROUTES.ADD_TRANSACTION_EXPENSE,
      // },
      // {
      //   id: 'advance-given',
      //   label: 'Gave advance payment',
      //   icon: '⏱️',
      //   route: '/transactions/supplier-payment',
      //   params: { isAdvance: true },
      // },
      // {
      //   id: 'bank-withdrawal',
      //   label: 'Withdrew cash from bank',
      //   icon: '💳',
      //   route: '/transactions/bank-withdrawal',
      // },
      // {
      //   id: 'loan-payment',
      //   label: 'Paid loan installment',
      //   icon: '📊',
      //   route: '/transactions/loan-payment',
      // },
    ],
  },
  {
    id: 'advanced-accounting',
    title: 'Advanced',
    emoji: '🧮',
    color: '#6366F1',
    options: [
      {
        id: 'journal-entry',
        label: 'Journal Entry',
        icon: '📘',
        route: ROUTES.ADD_JOURNAL_ENTRY,
      },
      // {
      //   id: 'ledger-entry',
      //   label: 'Gernerl Entry',
      //   icon: '📘',
      //   route: ROUTES.TRIAL_BALANCE,
      // },
      // {
      //   id: 'stock-adjust',
      //   label: 'Adjust stock',
      //   icon: '📋',
      //   route: '/transactions/stock-adjust',
      // },
      // {
      //   id: 'credit-given',
      //   label: 'Record credit given',
      //   icon: '📤',
      //   route: '/transactions/credit-given',
      // },
      // {
      //   id: 'credit-taken',
      //   label: 'Record credit taken',
      //   icon: '📥',
      //   route: '/transactions/credit-taken',
      // },
    ],
  },
];

// Types
type AppStyles = ReturnType<typeof createStyles>;

interface MenuOption {
  id: string;
  label: string;
  icon: string;
  route: string;
  params?: Record<string, any>;
}

interface MenuSection {
  id: string;
  title: string;
  emoji: string;
  color: string;
  options: MenuOption[];
}

// Reusable Components

interface SectionHeaderProps {
  title: string;
  emoji: string;
  color: string;
  styles: AppStyles;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  emoji,
  color,
  styles,
}) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIndicator, { backgroundColor: color }]} />
    <Text style={styles.sectionEmoji}>{emoji}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

interface MenuItemProps {
  option: MenuOption;
  onPress: () => void;
  accentColor: string;
  styles: AppStyles;
}

const AddTransactionScreen: React.FC<NavigationProps<'Transactions'>> = ({
  navigation,
}) => {
  const styles = useThemedStyles(createStyles);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMenuItemPress = (option: MenuOption) => {
    // @ts-ignore - navigation typing
    navigation.navigate(option.route, option.params || {});
  };

  return (
    <Container safeArea style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" /> */}

      <HeaderNavigation
        title="What would you like to do?"
        onBackPress={handleBackPress}
        showBackButton={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuSections.map((section, sectionIndex) => (
          <View key={section.id} style={styles.section}>
            <SectionHeader
              styles={styles}
              title={section.title}
              emoji={section.emoji}
              color={section.color}
            />

            <View style={styles.menuItemsContainer}>
              {section.options.map(option => (
                <MenuItem
                  styles={styles}
                  key={option.id}
                  option={option}
                  onPress={() => handleMenuItemPress(option)}
                  accentColor={section.color}
                />
              ))}
            </View>

            {sectionIndex < menuSections.length - 1 && (
              <View style={styles.sectionDivider} />
            )}
          </View>
        ))}
      </ScrollView>
    </Container>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: theme.colors.background,
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: theme.spacing.xl,
//   },
//   title: {
//     ...theme.typography.h1,
//     color: theme.colors.text.primary,
//     marginBottom: theme.spacing.md,
//   },
//   subtitle: {
//     ...theme.typography.h3,
//     color: theme.colors.primary,
//     marginBottom: theme.spacing.lg,
//   },
//   description: {
//     ...theme.typography.body,
//     color: theme.colors.text.secondary,
//     textAlign: 'center',
//     lineHeight: 24,
//   },
// });

export default AddTransactionScreen;

// TransactionTypeSelection.tsx

const MenuItem: React.FC<MenuItemProps> = ({
  option,
  onPress,
  accentColor,
  styles,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.6}
  >
    <View
      style={[
        styles.menuItemIconContainer,
        { backgroundColor: accentColor + '15' },
      ]}
    >
      <Text style={styles.menuItemIcon}>{option.icon}</Text>
    </View>
    <Text style={styles.menuItemLabel}>{option.label}</Text>
    <Text style={styles.menuItemArrow}>→</Text>
  </TouchableOpacity>
);

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: theme.colors.background,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: theme.colors.background,
//     borderBottomWidth: 1,
//     borderBottomColor: theme.colors.background,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   backButtonText: {
//     fontSize: 24,
//     color: theme.colors.text.primary,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: theme.colors.text.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerSpacer: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     paddingBottom: 24,
//   },
//   section: {
//     marginTop: 16,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: theme.colors.background,
//   },
//   sectionIndicator: {
//     width: 4,
//     height: 20,
//     borderRadius: 2,
//     marginRight: 12,
//   },
//   sectionEmoji: {
//     fontSize: 20,
//     marginRight: 8,
//   },
//   sectionTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: theme.colors.text.primary,
//     letterSpacing: 0.5,
//   },
//   menuItemsContainer: {
//     backgroundColor: theme.colors.background,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: theme.colors.background,
//   },
//   menuItemIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   menuItemIcon: {
//     fontSize: 24,
//   },
//   menuItemLabel: {
//     flex: 1,
//     fontSize: 16,
//     fontWeight: '500',
//     color: theme.colors.text.primary,
//   },
//   menuItemArrow: {
//     fontSize: 20,
//     color: theme.colors.text.primary,
//   },
//   sectionDivider: {
//     height: 8,
//     backgroundColor: '#F9FAFB',
//   },
// });

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.text.primary,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'center' as const,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  sectionEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: theme.colors.text.secondary,
    letterSpacing: 0.5,
  },
  menuItemsContainer: {
    backgroundColor: theme.colors.surface,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  menuItemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: theme.spacing.md,
  },
  menuItemIcon: {
    fontSize: 24,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
    color: theme.colors.text.primary,
  },
  menuItemArrow: {
    fontSize: 20,
    color: theme.colors.text.disabled,
  },
  sectionDivider: {
    height: 8,
    backgroundColor: theme.colors.background,
  },
});

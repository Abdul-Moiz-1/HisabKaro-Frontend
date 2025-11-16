// screens/TransactionManualEntryScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Theme, useTheme, useThemedStyles } from '../../theme';
import { FormConfig } from '../../types/forms';
import { DynamicForm } from '../../components/DynamicForm';
import { receiptFlowJSON } from '../../config/forms/json/receiptFlow.json';
import { NavigationProps } from '../../types';

interface TransactionManualEntryScreenProps {}

const TransactionManualEntryScreen: React.FC<
  NavigationProps<'AddTransactionManual'>
> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const styles = useThemedStyles(createStyles);
  const { theme } = useTheme();

  // @ts-ignore
  const { screenId, flowData } = route.params || {};

  const [currentScreen, setCurrentScreen] = useState<any>(null);
  const [flowState, setFlowState] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScreen(screenId || 'customer-selection');
  }, [screenId]);

  const loadScreen = (screenIdToLoad: string) => {
    setLoading(true);

    // Find screen configuration from JSON
    const screen = receiptFlowJSON.flow.screens.find(
      s => s.id === screenIdToLoad,
    );

    if (screen) {
      setCurrentScreen(screen);
    }

    setLoading(false);
  };

  const handleNavigate = (nextScreenId: string, params?: any) => {
    // Update flow state with new params
    setFlowState((prev: any) => ({
      ...prev,
      ...params,
    }));

    // Navigate to next screen
    loadScreen(nextScreenId);
  };

  const renderScreenByType = () => {
    if (!currentScreen) return null;

    switch (currentScreen.type) {
      case 'FORM':
        return renderFormScreen();
      case 'LIST_WITH_SEARCH':
        return renderListWithSearchScreen();
      case 'AMOUNT_INPUT':
        return renderAmountInputScreen();
      case 'SELECTION':
        return renderSelectionScreen();
      case 'COMPOUND':
        return renderCompoundScreen();
      case 'CONFIRMATION':
        return renderConfirmationScreen();
      case 'MODAL':
        return renderModalScreen();
      default:
        return renderGenericScreen();
    }
  };

  const renderFormScreen = () => {
    const formConfig: FormConfig = {
      id: currentScreen.config.formId,
      title: currentScreen.title,
      submitButtonText: currentScreen.config.submitButtonText,
      cancelButtonText: currentScreen.config.cancelButtonText,
      sections: currentScreen.config.sections,
    };

    return (
      <DynamicForm
        config={formConfig}
        initialData={flowState}
        onSubmit={data => {
          console.log('Form submitted:', data);

          // Handle navigation based on config
          const action = currentScreen.config.actions.onSubmit;
          if (action.navigate) {
            handleNavigate(action.navigate, data);
          }
        }}
        onCancel={() => {
          const action = currentScreen.config.actions.onCancel;
          if (action.navigate) {
            handleNavigate(action.navigate);
          } else {
            navigation.goBack();
          }
        }}
      />
    );
  };

  const renderListWithSearchScreen = () => {
    return (
      <View style={styles.screenContainer}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.question}>{currentScreen.config.question}</Text>

          {/* Search Field */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchPlaceholder}>
              {currentScreen.config.searchPlaceholder}
            </Text>
          </View>

          {/* Section Header */}
          <Text style={styles.sectionHeader}>
            {currentScreen.config.sectionHeader}
          </Text>

          {/* Mock Customer List */}
          <View style={styles.listContainer}>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                handleNavigate('amount-entry', {
                  customer: {
                    id: '1',
                    name: 'Ahmed Electronics',
                    outstanding: 125000,
                    dueDate: '2025-11-10',
                  },
                });
              }}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Ahmed Electronics</Text>
                <Text style={styles.listItemAmount}>PKR 125,000</Text>
                <View style={styles.listItemDue}>
                  <Text style={styles.dueDateIndicator}>🔴</Text>
                  <Text style={styles.dueDateText}>Due: Nov 10, 2025</Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                handleNavigate('amount-entry', {
                  customer: {
                    id: '2',
                    name: 'Karachi Traders',
                    outstanding: 85000,
                    dueDate: '2025-11-20',
                  },
                });
              }}
            >
              <View style={styles.listItemContent}>
                <Text style={styles.listItemTitle}>Karachi Traders</Text>
                <Text style={styles.listItemAmount}>PKR 85,000</Text>
                <View style={styles.listItemDue}>
                  <Text style={styles.dueDateIndicator}>🟡</Text>
                  <Text style={styles.dueDateText}>Due: Nov 20, 2025</Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Add New Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleNavigate('add-customer')}
        >
          <Text style={styles.addButtonText}>
            {currentScreen.config.addNewButtonText}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAmountInputScreen = () => {
    const customer = flowState.customer || { name: 'Customer', outstanding: 0 };

    return (
      <View style={styles.screenContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Info Display */}
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>{customer.name} owes you:</Text>
            <Text style={styles.infoAmount}>
              PKR {customer.outstanding.toLocaleString()}
            </Text>
          </View>

          {/* Question */}
          <Text style={styles.question}>
            {currentScreen.title.replace('{customerName}', customer.name)}
          </Text>

          {/* Amount Display */}
          <TouchableOpacity
            style={styles.amountDisplay}
            onPress={() => {
              // Open amount keypad modal
              console.log('Open amount keypad');
            }}
          >
            <Text style={styles.amountPrefix}>PKR</Text>
            <Text style={styles.amountValue}>
              {flowState.amount?.toLocaleString() || '0'}
            </Text>
          </TouchableOpacity>

          {/* Quick Amounts */}
          <View style={styles.quickAmountsContainer}>
            <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
            <View style={styles.quickAmounts}>
              <TouchableOpacity
                style={styles.quickAmountButton}
                onPress={() =>
                  setFlowState({ ...flowState, amount: customer.outstanding })
                }
              >
                <Text style={styles.quickAmountText}>
                  Full {customer.outstanding.toLocaleString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAmountButton}
                onPress={() =>
                  setFlowState({
                    ...flowState,
                    amount: customer.outstanding / 2,
                  })
                }
              >
                <Text style={styles.quickAmountText}>
                  Half {(customer.outstanding / 2).toLocaleString()}
                </Text>
              </TouchableOpacity>
              {customer.outstanding >= 25000 && (
                <TouchableOpacity
                  style={styles.quickAmountButton}
                  onPress={() => setFlowState({ ...flowState, amount: 25000 })}
                >
                  <Text style={styles.quickAmountText}>25k</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Remaining Card */}
          <View style={styles.remainingCard}>
            <Text style={styles.remainingLabel}>Remaining:</Text>
            <Text style={styles.remainingAmount}>
              PKR{' '}
              {(
                customer.outstanding - (flowState.amount || 0)
              ).toLocaleString()}
            </Text>
          </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !flowState.amount && styles.continueButtonDisabled,
            ]}
            onPress={() => {
              if (flowState.amount) {
                handleNavigate('payment-method', {
                  amount: flowState.amount,
                  remaining: customer.outstanding - flowState.amount,
                });
              }
            }}
            disabled={!flowState.amount}
          >
            <Text style={styles.continueButtonText}>Continue ✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSelectionScreen = () => {
    const field = currentScreen.config.field;

    return (
      <View style={styles.screenContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.question}>{currentScreen.title}</Text>

          <View style={styles.selectionContainer}>
            {field.options.map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectionCard,
                  flowState[field.id] === option.value &&
                    styles.selectionCardSelected,
                ]}
                onPress={() => {
                  setFlowState({ ...flowState, [field.id]: option.value });

                  // Navigate based on option
                  setTimeout(() => {
                    handleNavigate(option.navigateTo, {
                      [field.id]: option.value,
                    });
                  }, 300);
                }}
              >
                <Text style={styles.selectionIcon}>{option.icon}</Text>
                <View style={styles.selectionContent}>
                  <Text style={styles.selectionLabel}>{option.label}</Text>
                  <Text style={styles.selectionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    flowState[field.id] === option.value &&
                      styles.checkCircleSelected,
                  ]}
                >
                  {flowState[field.id] === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCompoundScreen = () => {
    // For compound screens, render multiple sections
    return (
      <View style={styles.screenContainer}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.screenTitle}>{currentScreen.title}</Text>
          <Text style={styles.placeholder}>
            Compound screen rendering in progress...
          </Text>
        </ScrollView>
      </View>
    );
  };

  const renderConfirmationScreen = () => {
    const customer = flowState.customer || { name: 'Customer' };
    const amount = flowState.amount || 0;
    const remaining = flowState.remaining || 0;

    return (
      <View style={styles.screenContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Success Header */}
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Payment Recorded</Text>
          </View>

          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Customer</Text>
              <Text style={styles.summaryValue}>{customer.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Amount Received</Text>
              <Text style={[styles.summaryValue, styles.summaryValueLarge]}>
                PKR {amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method</Text>
              <Text style={styles.summaryValue}>
                {flowState.paymentMethod || 'N/A'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Remaining Balance</Text>
              <Text style={[styles.summaryValue, styles.summaryValueBold]}>
                PKR {remaining.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Actions Section */}
          <Text style={styles.actionsTitle}>What's next?</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📲</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionLabel}>
                  Send Receipt to {customer.name}
                </Text>
                <Text style={styles.actionDescription}>
                  WhatsApp / SMS / Email
                </Text>
              </View>
            </TouchableOpacity>

            {remaining > 0 && (
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>🔔</Text>
                <View style={styles.actionContent}>
                  <Text style={styles.actionLabel}>
                    Remind {customer.name} for remaining
                  </Text>
                  <Text style={styles.actionDescription}>
                    Set reminder for PKR {remaining.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionCard}>
              <Text style={styles.actionIcon}>📝</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionLabel}>Add Note</Text>
                <Text style={styles.actionDescription}>Optional memo</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // @ts-ignore
              navigation.navigate('Dashboard');
            }}
          >
            <Text style={styles.primaryButtonText}>✓ Done</Text>
          </TouchableOpacity>
          <View style={styles.secondaryActions}>
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>↩️ Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => handleNavigate('customer-selection')}
            >
              <Text style={styles.secondaryButtonText}>➕ Add Another</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderModalScreen = () => {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{currentScreen.title}</Text>
          <Text style={styles.placeholder}>Modal screen rendering...</Text>
        </View>
      </View>
    );
  };

  const renderGenericScreen = () => {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>{currentScreen.title}</Text>
        <Text style={styles.placeholder}>
          Screen type: {currentScreen.type}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentScreen?.title || 'Transaction'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Dynamic Screen Content */}
      {renderScreenByType()}
    </SafeAreaView>
  );
};

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  screenContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  screenTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  question: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  placeholder: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
    textAlign: 'center' as const,
    marginTop: theme.spacing.xxl,
  },

  // List with Search styles
  searchContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  searchPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
  },
  sectionHeader: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase' as const,
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  listItemAmount: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.xs,
  },
  listItemDue: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  dueDateIndicator: {
    fontSize: 12,
  },
  dueDateText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  arrow: {
    fontSize: 20,
    color: theme.colors.text.disabled,
  },
  addButton: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    padding: theme.spacing.md,
    alignItems: 'center' as const,
  },
  addButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },

  // Amount Input styles
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  infoAmount: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  },
  amountDisplay: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 80,
    marginBottom: theme.spacing.lg,
  },
  amountPrefix: {
    ...theme.typography.h2,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  amountValue: {
    ...theme.typography.h1,
    fontSize: 32,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  quickAmountsContainer: {
    marginBottom: theme.spacing.lg,
  },
  quickAmountsLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '600' as const,
  },
  quickAmounts: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.spacing.sm,
  },
  quickAmountButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
  },
  quickAmountText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  remainingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  remainingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
  },
  remainingAmount: {
    ...theme.typography.h3,
    color: theme.colors.success,
    fontWeight: 'bold' as const,
  },
  footer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },

  // Selection styles
  selectionContainer: {
    gap: theme.spacing.md,
  },
  selectionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  selectionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  selectionIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  selectionContent: {
    flex: 1,
  },
  selectionLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  selectionDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
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
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },

  // Confirmation styles
  successHeader: {
    alignItems: 'center' as const,
    marginBottom: theme.spacing.lg,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  successTitle: {
    ...theme.typography.h2,
    color: theme.colors.text.primary,
    fontWeight: 'bold' as const,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.sm,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    textAlign: 'right' as const,
  },
  summaryValueLarge: {
    ...theme.typography.h3,
    fontWeight: 'bold' as const,
  },
  summaryValueBold: {
    fontWeight: '700' as const,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: theme.spacing.sm,
  },
  actionsTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  actionsContainer: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  actionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  actionDescription: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  bottomActions: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
  },
  primaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  secondaryActions: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center' as const,
  },
  secondaryButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
});

export default TransactionManualEntryScreen;

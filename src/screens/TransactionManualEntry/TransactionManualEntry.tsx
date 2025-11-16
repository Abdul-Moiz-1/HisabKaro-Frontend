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
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Theme, useTheme, useThemedStyles } from '../../theme';
import { FieldType, FormConfig } from '../../types/forms';
import { DynamicForm, DynamicFormField } from '../../components/DynamicForm';
import { receiptFlowJSON } from '../../config/forms/json/receiptFlow.json';
import { NavigationProps } from '../../types';

interface TransactionManualEntryScreenProps {}
const mockBankAccounts = [
  {
    id: '1',
    bankName: 'HBL',
    accountTitle: 'Business Account',
    accountNumber: '****1234',
    balance: 250000,
  },
  {
    id: '2',
    bankName: 'Meezan Bank',
    accountTitle: 'Savings Account',
    accountNumber: '****5678',
    balance: 150000,
  },
];
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
  const [searchQuery, setSearchQuery] = useState('');
  const [screenHistory, setScreenHistory] = useState<string[]>([
    'customer-selection',
  ]);
  const [customersList, setCustomersList] = useState([
    {
      id: '1',
      name: 'Ahmed Electronics',
      outstanding: 125000,
      dueDate: '2025-11-10',
    },
    {
      id: '2',
      name: 'Karachi Traders',
      outstanding: 85000,
      dueDate: '2025-11-20',
    },
    {
      id: '3',
      name: 'Bismillah Store',
      outstanding: 45000,
      dueDate: '2025-11-05',
    },
  ]);

  useEffect(() => {
    loadScreen(screenId || 'customer-selection');
  }, [screenId]);

  const loadScreen = (screenIdToLoad: string) => {
    setLoading(true);

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

    setScreenHistory(prev => [...prev, nextScreenId]);

    // Navigate to next screen
    loadScreen(nextScreenId);
  };

  const handleBack = () => {
    if (screenHistory.length > 1) {
      // Remove current screen
      const newHistory = [...screenHistory];
      newHistory.pop();
      setScreenHistory(newHistory);

      // Load previous screen
      const previousScreen = newHistory[newHistory.length - 1];
      loadScreen(previousScreen);
    } else {
      navigation.goBack();
    }
  };

  const filteredCustomers = customersList.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
          console.log('Current Screen:', currentScreen);

          if (currentScreen.id === 'add-customer') {
            const newCustomer = {
              id: Date.now().toString(),
              name: data.name,
              outstanding: parseFloat(data.openingBalance || '0'),
              dueDate: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              phone: data.phone,
              email: data.email,
            };

            // Add to customers list
            setCustomersList(prev => [newCustomer, ...prev]);

            // Navigate back with new customer
            handleNavigate('customer-selection', { newCustomer });
            return;
          }

          // Handle navigation based on config
          const action = currentScreen.config.actions.onSubmit;
          const navigate = action.navigate || action.onSuccess?.navigate;
          if (navigate) {
            handleNavigate(navigate, data);
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
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={currentScreen.config.searchPlaceholder}
              placeholderTextColor={theme.colors.text.disabled}
            />
          </View>

          {/* Section Header */}
          <Text style={styles.sectionHeader}>
            {currentScreen.config.sectionHeader}
          </Text>

          {/* Mock Customer List */}
          {/* <View style={styles.listContainer}>
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
        </ScrollView> */}

          <View style={styles.listContainer}>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(customer => (
                <TouchableOpacity
                  key={customer.id}
                  style={styles.listItem}
                  onPress={() => {
                    handleNavigate('amount-entry', {
                      customer: customer,
                    });
                  }}
                >
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{customer.name}</Text>
                    <Text style={styles.listItemAmount}>
                      PKR {customer.outstanding.toLocaleString()}
                    </Text>
                    <View style={styles.listItemDue}>
                      <Text style={styles.dueDateIndicator}>🔴</Text>
                      <Text style={styles.dueDateText}>
                        Due: {new Date(customer.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrow}>→</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No customers found</Text>
              </View>
            )}
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
          <View style={styles.amountDisplayContainer}>
            <DynamicFormField
              field={{
                id: 'amount',
                name: 'amount',
                type: FieldType.AMOUNT,
                label: '',
                required: true,
              }}
              value={flowState.amount?.toString() || '0'}
              onChange={value => {
                setFlowState({ ...flowState, amount: parseFloat(value) || 0 });
              }}
              onBlur={() => {}}
            />
          </View>

          {/* <TouchableOpacity
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
          </TouchableOpacity> */}

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
    const customer = flowState.customer || { name: 'Customer', outstanding: 0 };

    return (
      <View style={styles.screenContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.question}>
            {currentScreen.title.replace('{customerName}', customer.name)}
          </Text>

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

                  // // Navigate based on option
                  // setTimeout(() => {
                  //   handleNavigate(option.navigateTo, {
                  //     [field.id]: option.value,
                  //   });
                  // }, 300);
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
          {/* Continue Button */}
          {flowState[field.id] && (
            <TouchableOpacity
              style={styles.proceedButton}
              onPress={() => {
                const selectedOption = field.options.find(
                  (opt: any) => opt.value === flowState[field.id],
                );
                if (selectedOption) {
                  handleNavigate(selectedOption.navigateTo, {
                    [field.id]: selectedOption.value,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.proceedButtonText}>Continue →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderCompoundScreen = () => {
    const sections = currentScreen.config.sections;

    // Bank Transfer Screen
    if (currentScreen.id === 'bank-selection') {
      return (
        <View style={styles.screenContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {sections.map((section: any) => {
              if (section.type === 'LIST_SELECTION') {
                return (
                  <View key={section.id}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    {mockBankAccounts.map(bank => (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.bankCard,
                          flowState[section.field.id] === bank.id &&
                            styles.bankCardSelected,
                        ]}
                        onPress={() => {
                          setFlowState({
                            ...flowState,
                            [section.field.id]: bank.id,
                          });
                        }}
                      >
                        <View style={styles.bankIcon}>
                          <Text style={styles.bankIconText}>🏦</Text>
                        </View>

                        <View style={styles.bankInfo}>
                          <Text style={styles.bankName}>{bank.bankName}</Text>
                          <Text style={styles.accountTitle}>
                            {bank.accountTitle}
                          </Text>
                          <Text style={styles.accountNumber}>
                            {bank.accountNumber}
                          </Text>
                          <Text style={styles.balance}>
                            Balance: PKR {bank.balance.toLocaleString()}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.radioButton,
                            flowState[section.field.id] === bank.id &&
                              styles.radioButtonSelected,
                          ]}
                        >
                          {flowState[section.field.id] === bank.id && (
                            <View style={styles.radioButtonInner} />
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={styles.addBankButton}
                      onPress={() => handleNavigate('add-bank-account')}
                    >
                      <Text style={styles.addBankButtonText}>
                        {section.addNewButton.text}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }

              if (section.type === 'DATE_SELECTION') {
                return (
                  <View
                    key={section.id}
                    style={{ marginTop: theme.spacing.lg }}
                  >
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    <DynamicFormField
                      field={{
                        id: section.field.id,
                        name: section.field.name,
                        type: FieldType.DATE,
                        label: '',
                        required: section.field.required,
                        defaultValue: new Date().toISOString(),
                      }}
                      value={
                        flowState[section.field.id] || new Date().toISOString()
                      }
                      onChange={value => {
                        setFlowState({
                          ...flowState,
                          [section.field.id]: value,
                        });
                      }}
                      onBlur={() => {}}
                    />
                  </View>
                );
              }

              return null;
            })}

            {flowState.bankAccount && flowState.transferDate && (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => {
                  handleNavigate('confirmation', {
                    bankAccount: mockBankAccounts.find(
                      b => b.id === flowState.bankAccount,
                    ),
                    transferDate: flowState.transferDate,
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.proceedButtonText}>Continue →</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      );
    }

    // Mobile Wallet Screen
    if (currentScreen.id === 'wallet-selection') {
      return (
        <View style={styles.screenContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {sections.map((section: any, index: number) => {
              // Wallet Type Selection
              if (section.type === 'SELECTION') {
                return (
                  <View key={section.id}>
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    <View style={styles.selectionContainer}>
                      {section.field.options.map((option: any) => (
                        <TouchableOpacity
                          key={option.value}
                          style={[
                            styles.selectionCard,
                            flowState[section.field.id] === option.value &&
                              styles.selectionCardSelected,
                          ]}
                          onPress={() => {
                            setFlowState({
                              ...flowState,
                              [section.field.id]: option.value,
                            });
                          }}
                        >
                          <Text style={styles.selectionIcon}>
                            {option.icon}
                          </Text>
                          <View style={styles.selectionContent}>
                            <Text style={styles.selectionLabel}>
                              {option.label}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.checkCircle,
                              flowState[section.field.id] === option.value &&
                                styles.checkCircleSelected,
                            ]}
                          >
                            {flowState[section.field.id] === option.value && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              }

              // Custom Wallet Name (shows when "other" selected)
              if (section.showWhen) {
                console.log(section.showWhen);
                console.log(
                  section.showWhen.replace(
                    'walletType',
                    JSON.stringify(flowState.walletType),
                  ),
                );
                const shouldShow = eval(
                  section.showWhen.replace(
                    'walletType',
                    JSON.stringify(flowState.walletType),
                  ),
                );
                if (!shouldShow) return null;

                return (
                  <View
                    key={section.id}
                    style={{ marginTop: theme.spacing.md }}
                  >
                    {section.fields.map((field: any) => (
                      <DynamicFormField
                        key={field.id}
                        field={{
                          ...field,
                          type: FieldType.TEXT,
                        }}
                        value={flowState[field.id] || ''}
                        onChange={value => {
                          setFlowState({
                            ...flowState,
                            [field.id]: value,
                          });
                        }}
                        onBlur={() => {}}
                      />
                    ))}
                  </View>
                );
              }

              // Wallet Account/Phone
              if (section.id === 'wallet-account-section') {
                return (
                  <View
                    key={section.id}
                    style={{ marginTop: theme.spacing.md }}
                  >
                    {section.fields.map((field: any) => (
                      <DynamicFormField
                        key={field.id}
                        field={{
                          ...field,
                          type: FieldType.TEXT,
                        }}
                        value={flowState[field.id] || ''}
                        onChange={value => {
                          setFlowState({
                            ...flowState,
                            [field.id]: value,
                          });
                        }}
                        onBlur={() => {}}
                      />
                    ))}
                  </View>
                );
              }

              // Date Selection
              if (section.type === 'DATE_SELECTION') {
                return (
                  <View
                    key={section.id}
                    style={{ marginTop: theme.spacing.lg }}
                  >
                    <Text style={styles.sectionTitle}>{section.title}</Text>

                    <DynamicFormField
                      field={{
                        id: section.field.id,
                        name: section.field.name,
                        type: FieldType.DATE,
                        label: '',
                        required: section.field.required,
                        defaultValue: new Date().toISOString(),
                      }}
                      value={
                        flowState[section.field.id] || new Date().toISOString()
                      }
                      onChange={value => {
                        setFlowState({
                          ...flowState,
                          [section.field.id]: value,
                        });
                      }}
                      onBlur={() => {}}
                    />
                  </View>
                );
              }

              return null;
            })}

            {/* Continue Button */}
            {flowState.walletType && flowState.walletDate && (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => {
                  handleNavigate('confirmation', {
                    walletType: flowState.walletType,
                    walletAccount: flowState.walletAccount,
                    walletDate: flowState.walletDate,
                    customWalletName: flowState.customWalletName,
                  });
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.proceedButtonText}>Continue →</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      );
    }

    // Default fallback
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.screenTitle}>{currentScreen.title}</Text>
        <Text style={styles.placeholder}>
          Compound screen rendering in progress...
        </Text>
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
  searchInput: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    padding: 0,
  },
  emptyState: {
    alignItems: 'center' as const,
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.text.disabled,
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
  amountDisplayContainer: {
    marginBottom: theme.spacing.lg,
  },
  proceedButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
    marginTop: theme.spacing.lg,
  },
  proceedButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  bankCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  bankCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: theme.spacing.md,
  },
  bankIconText: {
    fontSize: 24,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: theme.spacing.xs,
  },
  accountTitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  accountNumber: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  balance: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  addBankButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center' as const,
    marginTop: theme.spacing.sm,
  },
  addBankButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});

export default TransactionManualEntryScreen;

// shared/BankSelectionScreen.tsx
// Reusable bank account selection screen for Sales, Purchase, Receipt, Payment flows
import React, { useEffect, useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BankIcon, CheckCircleIcon, PlusIcon } from 'phosphor-react-native';

import { useTheme } from '../../../store/hooks';
import {
  bankAccountsApi,
  BankAccount,
} from '../../../services/api/bankAccounts';
import ActionButton from '../../../components/common/ActionButton';
import {
  useBankSelectionFlow,
  FlowType,
} from './hooks/useFlowAdapter';

type RouteParams = {
  BankSelection: {
    flowType?: FlowType;
    nextScreen?: string;
    amount?: number;
    partyName?: string;
  };
};

const BankSelectionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'BankSelection'>>();

  // Get route params with defaults
  const {
    flowType = 'sales',
    nextScreen: customNextScreen,
  } = route.params || {};

  // Use flow adapter hook
  const {
    config,
    customer,
    amount,
    setBankAccount,
  } = useBankSelectionFlow(flowType);

  // Local state
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Determine next screen - custom override or config default
  const nextScreen = customNextScreen || config.nextScreen;

  // Fetch bank accounts on mount
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await bankAccountsApi.getAll();
      setBankAccounts(response.data);
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBank = useMemo(
    () => bankAccounts.find(b => b.id === selectedBankId),
    [bankAccounts, selectedBankId]
  );

  const handleSelectBank = useCallback((bankId: number) => {
    setSelectedBankId(bankId);
  }, []);

  const handleContinue = useCallback(() => {
    if (!selectedBankId || !selectedBank) return;

    // Update Redux state based on flow type using adapter
    setBankAccount(selectedBankId);

    // Navigate to next screen
    // @ts-ignore
    navigation.navigate(nextScreen, {
      flowType,
      selectedBankAccountId: selectedBankId,
      selectedBankAccount: selectedBank,
    });
  }, [
    selectedBankId,
    selectedBank,
    setBankAccount,
    navigation,
    nextScreen,
    flowType,
  ]);

  const handleAddBank = useCallback(() => {
    // @ts-ignore
    navigation.navigate('AddBankAccount', { fromFlow: true, flowType });
  }, [navigation, flowType]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading bank accounts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Amount Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{config.amountLabel}</Text>
          <Text style={styles.summaryAmount}>
            PKR {amount.toLocaleString()}
          </Text>
          {customer?.name && (
            <Text style={styles.partyName}>
              {config.partyPrefix}: {customer.name}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text style={styles.question}>{config.title}</Text>
        <Text style={styles.subtitle}>{config.subtitle}</Text>

        {/* Bank Accounts List */}
        {bankAccounts.length === 0 ? (
          <View style={styles.emptyState}>
            <BankIcon size={48} color={theme.colors.text.disabled} />
            <Text style={styles.emptyTitle}>No Bank Accounts</Text>
            <Text style={styles.emptySubtitle}>
              Add a bank account to continue
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddBank}
              activeOpacity={0.7}
            >
              <PlusIcon size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Bank Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.accountsList}>
            {bankAccounts.map(bank => {
              const isSelected = selectedBankId === bank.id;

              return (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankCard,
                    isSelected && styles.bankCardSelected,
                  ]}
                  onPress={() => handleSelectBank(bank.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.bankIcon,
                      isSelected && styles.bankIconSelected,
                    ]}
                  >
                    <BankIcon
                      size={28}
                      color={
                        isSelected
                          ? theme.colors.primary
                          : theme.colors.text.secondary
                      }
                      weight={isSelected ? 'fill' : 'regular'}
                    />
                  </View>

                  <View style={styles.bankInfo}>
                    <Text
                      style={[
                        styles.bankName,
                        isSelected && styles.bankNameSelected,
                      ]}
                    >
                      {bank.bankName}
                    </Text>
                    <Text style={styles.accountTitle}>{bank.accountTitle}</Text>
                    <Text style={styles.accountNumber}>
                      ****{bank?.accountNumber.slice(-4)}
                    </Text>
                  </View>

                  <View style={styles.rightSection}>
                    <Text style={styles.balance}>
                      PKR {bank.currentBalance.toLocaleString()}
                    </Text>
                    {isSelected ? (
                      <CheckCircleIcon
                        size={24}
                        color={theme.colors.primary}
                        weight="fill"
                      />
                    ) : bank.isDefault ? (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Add Account Link */}
        {bankAccounts.length > 0 && (
          <TouchableOpacity
            style={styles.addAccountLink}
            onPress={handleAddBank}
            activeOpacity={0.7}
          >
            <PlusIcon size={18} color={theme.colors.primary} />
            <Text style={styles.addAccountLinkText}>Add New Account</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedBankId}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    loadingText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    summaryAmount: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    partyName: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    question: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
    },
    accountsList: {
      gap: theme.spacing.sm,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      gap: theme.spacing.xs,
    },
    addButtonText: {
      fontSize: 14,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    bankCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      ...theme.shadows.sm,
    },
    bankCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}08`,
    },
    bankIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${theme.colors.primary}15`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    bankIconSelected: {
      backgroundColor: `${theme.colors.primary}25`,
    },
    bankInfo: {
      flex: 1,
    },
    bankName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    bankNameSelected: {
      color: theme.colors.primary,
    },
    accountTitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    accountNumber: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    rightSection: {
      alignItems: 'flex-end',
      gap: theme.spacing.xs,
    },
    balance: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    defaultBadge: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    defaultBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    addAccountLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    addAccountLinkText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    footer: {
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.sm,
    },
  });

export default BankSelectionScreen;

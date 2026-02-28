import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  MicrophoneIcon,
  ArrowRightIcon,
  UserIcon,
  StorefrontIcon,
} from 'phosphor-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../../../store/hooks';
import { Container, HeaderNavigation, Button } from '../../../components/common';
import { PaymentMethodSelector, AmountQuickSelect, AllocatePaymentModal } from '../components';
import { paymentSchema, PaymentFormData, PaymentMethodType, InvoiceAllocation } from '../schemas/paymentSchemas';
import { paymentsApi } from '../../../services/api/payments';
import { invoicesApi, Invoice } from '../../../services/api/invoices';
import { ROUTES } from '../../../constants/routes';
import { PaymentsFlowParamList } from '../PaymentsFlowNavigator';
import Toast from 'react-native-toast-message';

type NavigationProp = StackNavigationProp<PaymentsFlowParamList>;
type RouteProps = RouteProp<PaymentsFlowParamList, typeof ROUTES.MAKE_PAYMENT>;

const MakePaymentScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  
  const { partyId, partyName, partyType, balance } = route.params;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [allocations, setAllocations] = useState<InvoiceAllocation[]>([]);
  const [selectedQuickAmount, setSelectedQuickAmount] = useState<number | 'full' | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      party_id: partyId,
      party_name: partyName,
      party_type: partyType,
      amount: 0,
      method: 'cash',
      auto_allocate: true,
      allocations: [],
    },
  });

  const watchAmount = watch('amount');
  const watchAutoAllocate = watch('auto_allocate');

  // Load pending invoices
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        const filters = partyType === 'customer' 
          ? { customer_id: partyId, status: 'pending' as const }
          : { supplier_id: partyId, status: 'pending' as const };
        
        const response = await invoicesApi.getAll(filters);
        setPendingInvoices(response.data);
      } catch (error) {
        console.error('Failed to load invoices:', error);
      }
    };
    loadInvoices();
  }, [partyId, partyType]);

  const handleQuickAmountSelect = (value: number | 'full') => {
    setSelectedQuickAmount(value);
    if (value === 'full') {
      setValue('amount', balance);
    } else {
      setValue('amount', value);
    }
  };

  const handleAmountChange = (text: string) => {
    const numericValue = parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
    setValue('amount', numericValue);
    setSelectedQuickAmount(null);
  };

  const handleAllocationsApply = (newAllocations: InvoiceAllocation[]) => {
    setAllocations(newAllocations);
    setValue('allocations', newAllocations);
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        method: data.method,
        [partyType === 'customer' ? 'customer_id' : 'supplier_id']: partyId,
        amount: data.amount,
        date: new Date().toISOString(),
        notes: data.notes,
        allocations: allocations.map((a) => ({
          invoice_id: a.invoice_id,
          amount: a.allocated_amount,
        })),
      };

      let payment;
      if (partyType === 'customer') {
        payment = await paymentsApi.receivePayment(payload);
      } else {
        payment = await paymentsApi.makePayment(payload);
      }

      navigation.navigate(ROUTES.PAYMENT_SUCCESS, {
        paymentId: payment.id,
        amount: data.amount,
        partyName: partyName,
        partyType: partyType,
        method: data.method,
        receiptNumber: payment.reference_number,
        allocations: allocations.map((a) => ({
          invoiceNumber: a.invoice_number || '',
          amount: a.allocated_amount,
          status: a.is_full_settlement ? 'settled' : 'partial' as 'settled' | 'partial',
        })),
        newBalance: balance - data.amount,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Payment Failed',
        text2: error?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scrollContent: {
          padding: theme.spacing.lg,
          paddingBottom: 120,
        },
        partyCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
          ...theme.shadows.sm,
        },
        partyAvatar: {
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        partyInfo: {
          flex: 1,
        },
        partyName: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        partyBalance: {
          ...theme.typography.caption,
          color: theme.colors.primary,
          marginTop: 2,
        },
        amountSection: {
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        amountInputContainer: {
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'center',
        },
        currencyPrefix: {
          ...theme.typography.h2,
          color: theme.colors.text.secondary,
          marginRight: theme.spacing.xs,
        },
        amountInput: {
          ...theme.typography.h1,
          fontSize: 48,
          fontWeight: 'bold',
          color: theme.colors.text.primary,
          minWidth: 120,
          textAlign: 'center',
        },
        amountHint: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          marginTop: theme.spacing.xs,
        },
        micButton: {
          position: 'absolute',
          right: 0,
          top: '50%',
          marginTop: -20,
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        errorText: {
          ...theme.typography.caption,
          color: theme.colors.error,
          marginTop: theme.spacing.xs,
          textAlign: 'center',
        },
        allocationSection: {
          marginTop: theme.spacing.lg,
        },
        allocationHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        },
        allocationTitle: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        allocationSubtitle: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
        },
        invoicesList: {
          marginTop: theme.spacing.md,
        },
        invoiceItem: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        invoiceItemSelected: {
          borderColor: theme.colors.primary,
          backgroundColor: theme.colors.primaryLight || `${theme.colors.primary}08`,
        },
        checkbox: {
          width: 24,
          height: 24,
          borderRadius: 6,
          borderWidth: 2,
          marginRight: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        checkboxSelected: {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        },
        checkboxUnselected: {
          borderColor: theme.colors.border,
        },
        invoiceInfo: {
          flex: 1,
        },
        invoiceNumber: {
          ...theme.typography.body,
          fontWeight: '500',
          color: theme.colors.text.primary,
        },
        invoiceMeta: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 2,
        },
        invoiceAmount: {
          ...theme.typography.body,
          fontWeight: '600',
          color: theme.colors.text.primary,
        },
        footer: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.colors.surface,
          padding: theme.spacing.lg,
          paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        },
        footerText: {
          ...theme.typography.caption,
          color: theme.colors.text.tertiary,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
        },
      }),
    [theme]
  );

  const pendingInvoiceItems = pendingInvoices.map((inv) => ({
    id: inv.id,
    invoice_number: inv.invoice_number,
    amount: inv.amount_due,
    due_date: inv.due_date,
    is_overdue: inv.due_date ? new Date(inv.due_date) < new Date() : false,
  }));

  return (
    <Container safeArea style={styles.container}>
      <HeaderNavigation
        title="Make Payment"
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity>
            <MicrophoneIcon size={24} color={theme.colors.primary} weight="fill" />
          </TouchableOpacity>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Party Info Card */}
          <View style={styles.partyCard}>
            <View style={styles.partyAvatar}>
              {partyType === 'customer' ? (
                <UserIcon size={28} color={theme.colors.primary} weight="fill" />
              ) : (
                <StorefrontIcon size={28} color={theme.colors.primary} weight="fill" />
              )}
            </View>
            <View style={styles.partyInfo}>
              <Text style={styles.partyName}>{partyName}</Text>
              <Text style={styles.partyBalance}>
                {partyType === 'customer' ? 'Dena hai' : 'Dena hai'} (Balance): Rs. {balance.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencyPrefix}>Rs.</Text>
              <Controller
                control={control}
                name="amount"
                render={({ field: { value } }) => (
                  <TextInput
                    style={styles.amountInput}
                    value={value > 0 ? value.toLocaleString() : ''}
                    onChangeText={handleAmountChange}
                    placeholder="0"
                    placeholderTextColor={theme.colors.text.tertiary}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
            <Text style={styles.amountHint}>Enter Amount / Raqam likhen</Text>
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}
          </View>

          {/* Quick Amount Selection */}
          <AmountQuickSelect
            selectedValue={selectedQuickAmount}
            onSelect={handleQuickAmountSelect}
            fullBalanceAmount={balance}
          />

          {/* Payment Method */}
          <Controller
            control={control}
            name="method"
            render={({ field: { value, onChange } }) => (
              <PaymentMethodSelector
                selectedMethod={value}
                onSelectMethod={onChange}
              />
            )}
          />

          {/* Bill Allocation */}
          {pendingInvoices.length > 0 && (
            <View style={styles.allocationSection}>
              <View style={styles.allocationHeader}>
                <View>
                  <Text style={styles.allocationTitle}>Bill Allocation</Text>
                  <Text style={styles.allocationSubtitle}>
                    Automatically adjust payments
                  </Text>
                </View>
                <Controller
                  control={control}
                  name="auto_allocate"
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor="#FFFFFF"
                    />
                  )}
                />
              </View>

              {!watchAutoAllocate && (
                <TouchableOpacity
                  onPress={() => setShowAllocateModal(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: theme.colors.primary, fontWeight: '500' }}>
                    Manually allocate →
                  </Text>
                </TouchableOpacity>
              )}

              {/* Show selected invoices */}
              <View style={styles.invoicesList}>
                {pendingInvoices.slice(0, 3).map((invoice) => {
                  const isSelected = allocations.some((a) => a.invoice_id === invoice.id);
                  return (
                    <View
                      key={invoice.id}
                      style={[
                        styles.invoiceItem,
                        isSelected && styles.invoiceItemSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          isSelected ? styles.checkboxSelected : styles.checkboxUnselected,
                        ]}
                      />
                      <View style={styles.invoiceInfo}>
                        <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
                        <Text style={styles.invoiceMeta}>
                          {invoice.due_date
                            ? new Date(invoice.due_date).toLocaleDateString()
                            : 'No due date'}{' '}
                          • {invoice.due_date && new Date(invoice.due_date) < new Date() ? 'Overdue' : 'Pending'}
                        </Text>
                      </View>
                      <Text style={styles.invoiceAmount}>
                        Rs. {invoice.amount_due.toLocaleString()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            title="Confirm Payment"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            size="large"
            loading={isSubmitting}
            icon={<ArrowRightIcon size={20} color="#FFFFFF" weight="bold" />}
            disabled={watchAmount <= 0}
          />
          <Text style={styles.footerText}>Powered by SME Ledger Pro</Text>
        </View>
      </KeyboardAvoidingView>

      {/* Allocate Payment Modal */}
      <AllocatePaymentModal
        visible={showAllocateModal}
        onClose={() => setShowAllocateModal(false)}
        onApply={handleAllocationsApply}
        totalAmount={watchAmount}
        pendingInvoices={pendingInvoiceItems}
        initialAllocations={allocations}
      />
    </Container>
  );
};

export default MakePaymentScreen;

import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  DotsThreeVerticalIcon,
  CalendarIcon,
  FileTextIcon,
  SparkleIcon,
  LinkIcon,
  PlusCircleIcon,
  BookOpenIcon,
  ReceiptIcon,
  XCircleIcon,
  CheckCircleIcon,
  XIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../store/hooks';
import { ROUTES } from '../../constants/routes';
import apiClient from '../../services/api/client';
import { RootStackParamList } from '../../types';
import { customersApi, Customer } from '../../services/api/customers';
import { suppliersApi, Supplier } from '../../services/api/suppliers';

interface PartyItem {
  id: string;
  name: string;
  detail?: string;
}

type ReviewRouteParams = RouteProp<RootStackParamList, 'ReviewTransaction'>;

const API_BASE = '/bank-transactions';

interface MatchSuggestion {
  matchType: 'invoice' | 'payment';
  matchId: number;
  reference: string;
  partyName: string;
  amount: number;
}

interface SuggestedAccount {
  id: number;
  accountCode: string;
  accountName: string;
  accountType: string;
}

interface AISuggestions {
  matchingInvoices: any[];
  matchingPayments: any[];
  suggestedParties: any[];
  suggestedAccounts: SuggestedAccount[];
  recommendedAction: string;
}

const ReviewTransactionScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ReviewRouteParams>();
  const transaction = route.params?.transaction;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestion[]>([]);
  const [enrichedTx, setEnrichedTx] = useState<any>(null);

  // Modal states
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [journalModalVisible, setJournalModalVisible] = useState(false);
  const [saleModalVisible, setSaleModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Match form
  const [matchType, setMatchType] = useState<'invoice' | 'payment'>('invoice');
  const [matchId, setMatchId] = useState('');
  const [matchSelectedParty, setMatchSelectedParty] = useState<PartyItem | null>(null);

  // Payment form
  const [paymentPartyType, setPaymentPartyType] = useState<'customer' | 'supplier'>('customer');
  const [paymentPartyId, setPaymentPartyId] = useState('');
  const [paymentSelectedParty, setPaymentSelectedParty] = useState<PartyItem | null>(null);

  // Shared party list for modals
  const [partyList, setPartyList] = useState<PartyItem[]>([]);
  const [partyLoading, setPartyLoading] = useState(false);
  const [partySearch, setPartySearch] = useState('');

  // Journal form
  const [journalNarration, setJournalNarration] = useState('');
  const [journalDebitAccountId, setJournalDebitAccountId] = useState('');
  const [journalCreditAccountId, setJournalCreditAccountId] = useState('');

  // Sale form
  const [saleCustomerId, setSaleCustomerId] = useState('');
  const [saleItemDescription, setSaleItemDescription] = useState('');
  const [saleItemQuantity, setSaleItemQuantity] = useState('1');
  const [saleItemRate, setSaleItemRate] = useState('');

  // Reject form
  const [rejectReason, setRejectReason] = useState('');

  const txId = transaction?.id;
  const tx = enrichedTx ?? transaction;
  const isCredit =
    tx?.transactionType === 'credit' || tx?.type === 'credit' || (Number(tx?.amount) || 0) > 0;
  const amount = Math.abs(Number(tx?.amount) || 0);

  const rawConfidence = Number(tx?.aiConfidenceScore ?? tx?.matchConfidence ?? 0);
  const aiConfidence = rawConfidence <= 1 ? Math.round(rawConfidence * 100) : Math.round(rawConfidence);
  const recommendedAction = aiSuggestions?.recommendedAction ?? '';
  const suggestedPartyName = tx?.suggestedPartyName ?? '';
  const suggestedCategory = tx?.suggestedCategory ?? '';
  const hasMatchSuggestions = matchSuggestions.length > 0;
  const hasAnyAIData = aiConfidence > 0 || !!recommendedAction || hasMatchSuggestions || !!suggestedPartyName;

  useEffect(() => {
    if (!txId) return;
    fetchSuggestions();
  }, [txId]);

  const fetchSuggestions = useCallback(async () => {
    if (!txId) return;
    setLoadingSuggestions(true);
    try {
      const res = await apiClient.get<any>(`${API_BASE}/${txId}/suggestions`);
      const raw = (res as any)?.data ?? res;

      const txData = raw?.transaction;
      if (txData) setEnrichedTx(txData);

      const sugg = raw?.suggestions;
      if (sugg && typeof sugg === 'object') {
        setAiSuggestions({
          matchingInvoices: Array.isArray(sugg.matchingInvoices) ? sugg.matchingInvoices : [],
          matchingPayments: Array.isArray(sugg.matchingPayments) ? sugg.matchingPayments : [],
          suggestedParties: Array.isArray(sugg.suggestedParties) ? sugg.suggestedParties : [],
          suggestedAccounts: Array.isArray(sugg.suggestedAccounts) ? sugg.suggestedAccounts : [],
          recommendedAction: sugg.recommendedAction ?? '',
        });

        const matches: MatchSuggestion[] = [];
        (sugg.matchingInvoices || []).forEach((inv: any) => {
          matches.push({
            matchType: 'invoice',
            matchId: Number(inv.id ?? inv.invoiceId) || 0,
            reference: inv.invoiceNumber ?? inv.reference ?? `#${inv.id}`,
            partyName: inv.partyName ?? inv.customerName ?? '',
            amount: Number(inv.totalAmount ?? inv.amount ?? inv.grandTotal) || 0,
          });
        });
        (sugg.matchingPayments || []).forEach((pmt: any) => {
          matches.push({
            matchType: 'payment',
            matchId: Number(pmt.id ?? pmt.paymentId) || 0,
            reference: pmt.paymentNumber ?? pmt.reference ?? `#${pmt.id}`,
            partyName: pmt.partyName ?? pmt.customerName ?? '',
            amount: Number(pmt.paidAmount ?? pmt.amount) || 0,
          });
        });
        setMatchSuggestions(matches);
      }

      setSaleItemDescription(txData?.description ?? transaction?.description ?? '');
      setSaleItemRate(String(Math.abs(Number(txData?.amount ?? transaction?.amount) || 0)));
    } catch (error: any) {
      console.log('Suggestions API error:', error.message);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [txId, transaction]);

  const fetchPartyList = useCallback(async (type: 'customer' | 'supplier', search?: string) => {
    setPartyLoading(true);
    try {
      if (type === 'customer') {
        const res = await customersApi.getAll({ search, limit: 50 });
        const data = (res as any)?.data ?? res;
        const list: Customer[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setPartyList(list.map(c => ({
          id: String(c.id),
          name: c.name,
          detail: c.phoneNumber || c.email || '',
        })));
      } else {
        const res = await suppliersApi.getAll({ search, limit: 50 });
        const data = (res as any)?.data ?? res;
        const list: Supplier[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setPartyList(list.map(s => ({
          id: String(s.id),
          name: s.name,
          detail: s.phoneNumber || s.email || '',
        })));
      }
    } catch {
      setPartyList([]);
    } finally {
      setPartyLoading(false);
    }
  }, []);

  const filteredPartyList = useMemo(() => {
    if (!partySearch.trim()) return partyList;
    const q = partySearch.toLowerCase();
    return partyList.filter(p =>
      p.name.toLowerCase().includes(q) || p.id.includes(q),
    );
  }, [partyList, partySearch]);

  const formatCurrency = (val: number | undefined | null) => {
    const safe = Number(val) || 0;
    return `Rs. ${safe.toLocaleString()}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  // ─── API handlers ───────────────────────────────────────────────

  const buildMatchBody = (type: 'invoice' | 'payment', id: number) => ({
    matchType: type,
    matchId: id,
  });

  const handleConfirmMatch = useCallback(async () => {
    const top = matchSuggestions[0];
    if (!top) return;
    setIsProcessing(true);
    try {
      await apiClient.post(`${API_BASE}/${txId}/match`, buildMatchBody(top.matchType, top.matchId));
      Toast.show({ type: 'success', text1: 'Match Confirmed', text2: 'Transaction reconciled successfully.' });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to confirm match' });
    } finally {
      setIsProcessing(false);
    }
  }, [txId, matchSuggestions, navigation]);

  const handleMatchSubmit = useCallback(async () => {
    if (!matchSelectedParty) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please select a customer or supplier' });
      return;
    }
    const id = Number(matchSelectedParty.id);
    if (!id) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Invalid party ID' });
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.post(`${API_BASE}/${txId}/match`, buildMatchBody(matchType, id));
      Toast.show({ type: 'success', text1: 'Matched', text2: `Transaction matched to ${matchSelectedParty.name}` });
      setMatchModalVisible(false);
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to match transaction' });
    } finally {
      setIsProcessing(false);
    }
  }, [txId, matchType, matchSelectedParty, navigation]);

  const handlePaymentSubmit = useCallback(async () => {
    if (!paymentSelectedParty) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please select a customer or supplier' });
      return;
    }
    const partyId = Number(paymentSelectedParty.id);
    if (!partyId) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Invalid party ID' });
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.post(`${API_BASE}/${txId}/create-payment`, {
        partyType: paymentPartyType,
        partyId,
      });
      Toast.show({ type: 'success', text1: 'Payment Created', text2: `Payment linked to ${paymentSelectedParty.name}` });
      setPaymentModalVisible(false);
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to create payment' });
    } finally {
      setIsProcessing(false);
    }
  }, [txId, paymentPartyType, paymentSelectedParty, navigation]);

  const handleJournalSubmit = useCallback(async () => {
    const debitId = Number(journalDebitAccountId);
    const creditId = Number(journalCreditAccountId);
    if (!debitId || !creditId) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter both account IDs' });
      return;
    }
    if (!journalNarration.trim()) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter a narration' });
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.post(`${API_BASE}/${txId}/create-journal`, {
        narration: journalNarration.trim(),
        accounts: [
          { accountId: debitId, debit: amount, credit: 0 },
          { accountId: creditId, debit: 0, credit: amount },
        ],
      });
      Toast.show({ type: 'success', text1: 'Journal Entry Created', text2: 'Double-entry posted successfully.' });
      setJournalModalVisible(false);
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to create journal entry' });
    } finally {
      setIsProcessing(false);
    }
  }, [txId, journalDebitAccountId, journalCreditAccountId, journalNarration, amount, navigation]);

  const handleSaleSubmit = useCallback(async () => {
    const custId = Number(saleCustomerId);
    if (!custId) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter a valid Customer ID' });
      return;
    }
    if (!saleItemDescription.trim()) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter an item description' });
      return;
    }
    const qty = Number(saleItemQuantity) || 1;
    const rate = Number(saleItemRate) || amount;
    setIsProcessing(true);
    try {
      await apiClient.post(`${API_BASE}/${txId}/create-sale`, {
        customerId: custId,
        items: [
          {
            description: saleItemDescription.trim(),
            quantity: qty,
            rate,
            amount: qty * rate,
          },
        ],
      });
      Toast.show({ type: 'success', text1: 'Sales Invoice Created', text2: 'Invoice generated from transaction.' });
      setSaleModalVisible(false);
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to create sales invoice' });
    } finally {
      setIsProcessing(false);
    }
  }, [txId, saleCustomerId, saleItemDescription, saleItemQuantity, saleItemRate, amount, navigation]);

  const handleRejectSubmit = useCallback(async () => {
    if (!rejectReason.trim()) {
      Toast.show({ type: 'error', text1: 'Validation', text2: 'Please enter a reason' });
      return;
    }
    setIsProcessing(true);
    try {
      await apiClient.post(`${API_BASE}/${txId}/reject`, {
        reason: rejectReason.trim(),
      });
      Toast.show({ type: 'info', text1: 'Rejected', text2: 'Transaction flagged and skipped.' });
      setRejectModalVisible(false);
      navigation.goBack();
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'Failed to reject transaction' });
    } finally {
      setIsProcessing(false);
    }
  }, [txId, rejectReason, navigation]);

  // ─── Open modals with pre-fill ──────────────────────────────────

  const openMatchModal = () => {
    setMatchSelectedParty(null);
    setPartySearch('');
    setMatchType('invoice');
    fetchPartyList('customer');
    setMatchModalVisible(true);
  };

  const openPaymentModal = () => {
    const pType = tx?.suggestedPartyType === 'supplier' ? 'supplier' : 'customer';
    setPaymentPartyType(pType as 'customer' | 'supplier');
    setPaymentSelectedParty(null);
    setPartySearch('');
    fetchPartyList(pType as 'customer' | 'supplier');
    setPaymentModalVisible(true);
  };

  const openJournalModal = () => {
    setJournalNarration(tx?.narration || tx?.description || transaction?.description || '');
    const accounts = aiSuggestions?.suggestedAccounts ?? [];
    console.log(aiSuggestions?.suggestedAccounts);
    if (accounts.length >= 1) setJournalDebitAccountId(String(accounts[0].id));
    if (accounts.length >= 2) setJournalCreditAccountId(String(accounts[1].id));
    setJournalModalVisible(true);
  };

  const openSaleModal = () => {
    setSaleItemDescription(transaction?.description || '');
    setSaleItemRate(String(amount));
    setSaleItemQuantity('1');
    setSaleModalVisible(true);
  };

  const openRejectModal = () => {
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // ─── Reusable modal wrapper ─────────────────────────────────────

  const renderModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    onSubmit: () => void,
    submitLabel: string,
    children: React.ReactNode,
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <XIcon size={22} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={onClose}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSubmitBtn, isProcessing && { opacity: 0.6 }]}
              onPress={onSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSubmitText}>{submitLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderToggle = (
    label1: string,
    label2: string,
    value: string,
    val1: string,
    val2: string,
    onChange: (v: any) => void,
  ) => (
    <View style={styles.toggleRow}>
      <TouchableOpacity
        style={[styles.toggleBtn, value === val1 && styles.toggleBtnActive]}
        onPress={() => onChange(val1)}
      >
        <Text style={[styles.toggleText, value === val1 && styles.toggleTextActive]}>
          {label1}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleBtn, value === val2 && styles.toggleBtnActive]}
        onPress={() => onChange(val2)}
      >
        <Text style={[styles.toggleText, value === val2 && styles.toggleTextActive]}>
          {label2}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderField = (label: string, value: string, onChange: (t: string) => void, opts?: { placeholder?: string; keyboardType?: any; multiline?: boolean }) => (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, opts?.multiline && styles.fieldInputMultiline]}
        value={value}
        onChangeText={onChange}
        placeholder={opts?.placeholder || ''}
        placeholderTextColor={theme.colors.text.disabled}
        keyboardType={opts?.keyboardType || 'default'}
        multiline={opts?.multiline}
      />
    </View>
  );

  // ─── Guard ──────────────────────────────────────────────────────

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No transaction data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Main render ────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Transaction</Text>
        <TouchableOpacity style={styles.menuButton}>
          <DotsThreeVerticalIcon size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Transaction Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsLabel}>BANK TRANSACTION DETAILS</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountText}>{formatCurrency(amount)}</Text>
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: isCredit ? `${theme.colors.success}15` : `${theme.colors.error}15` },
              ]}
            >
              <Text
                style={[styles.typeText, { color: isCredit ? theme.colors.success : theme.colors.error }]}
              >
                {isCredit ? 'CREDIT' : 'DEBIT'}
              </Text>
            </View>
          </View>
          <Text style={styles.descriptionText}>
            {tx?.narration || tx?.description || transaction.description}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <CalendarIcon size={14} color={theme.colors.text.secondary} />
              <Text style={styles.metaText}>{formatDate(tx?.transactionDate ?? transaction.transactionDate)}</Text>
            </View>
            {(tx?.referenceNumber || transaction.referenceNumber) && (
              <>
                <Text style={styles.metaDot}>{'\u2022'}</Text>
                <View style={styles.metaItem}>
                  <FileTextIcon size={14} color={theme.colors.text.secondary} />
                  <Text style={styles.metaText}>Ref: {tx?.referenceNumber ?? transaction.referenceNumber}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* AI Suggestion */}
        {loadingSuggestions ? (
          <View style={styles.suggestionsLoading}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.suggestionsLoadingText}>Loading AI suggestions...</Text>
          </View>
        ) : hasAnyAIData ? (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <View style={styles.aiTitleRow}>
                <SparkleIcon size={16} color={theme.colors.primary} weight="fill" />
                <Text style={styles.aiTitle}>AI SUGGESTION</Text>
              </View>
              {aiConfidence > 0 && (
                <View style={styles.confidenceBadge}>
                  <CheckCircleIcon size={14} color={theme.colors.success} weight="fill" />
                  <Text style={styles.confidenceText}>{aiConfidence}% Confidence</Text>
                </View>
              )}
            </View>

            {/* Recommended action card */}
            <View style={styles.suggestionCard}>
              <View style={styles.suggestionIconBg}>
                {recommendedAction === 'create_payment' ? (
                  <PlusCircleIcon size={20} color={theme.colors.primary} weight="fill" />
                ) : (
                  <ReceiptIcon size={20} color={theme.colors.primary} weight="fill" />
                )}
              </View>
              <View style={styles.suggestionInfo}>
                <Text style={styles.suggestionTitle}>
                  {recommendedAction === 'create_payment'
                    ? 'Create Payment Entry'
                    : recommendedAction === 'match_invoice'
                    ? 'Match to Invoice'
                    : recommendedAction === 'create_journal'
                    ? 'Post as Journal Entry'
                    : recommendedAction
                    ? recommendedAction.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                    : 'Review Needed'}
                </Text>
                {suggestedPartyName ? (
                  <Text style={styles.suggestionSubtext}>
                    Party: {suggestedPartyName}
                  </Text>
                ) : null}
                {suggestedCategory ? (
                  <Text style={styles.suggestionHint}>
                    Category: {suggestedCategory}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Matching invoices / payments */}
            {hasMatchSuggestions && (
              <View style={styles.matchListContainer}>
                {matchSuggestions.map((ms, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.matchListItem}
                    onPress={() => {
                      setMatchType(ms.matchType);
                      setMatchId(String(ms.matchId));
                      setMatchModalVisible(true);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.matchListTitle}>
                        {ms.matchType === 'invoice' ? 'Invoice' : 'Payment'} {ms.reference}
                      </Text>
                      <Text style={styles.matchListSub}>
                        {ms.partyName} {'\u2022'} {formatCurrency(ms.amount)}
                      </Text>
                    </View>
                    <LinkIcon size={18} color={theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Suggested accounts preview */}
            {(aiSuggestions?.suggestedAccounts?.length ?? 0) > 0 && (
              // <View style={styles.accountsPreview}>
              //   <Text style={styles.accountsPreviewTitle}>Suggested Accounts</Text>
              //   {aiSuggestions!.suggestedAccounts.slice(0, 3).map(acc => (
              //     <Text key={acc.id} style={styles.accountsPreviewItem}>
              //       {acc.accountCode} - {acc.accountName}
              //     </Text>
              //   ))}
              //   {(aiSuggestions!.suggestedAccounts.length > 3) && (
              //     <Text style={styles.accountsPreviewMore}>
              //       +{aiSuggestions!.suggestedAccounts.length - 3} more
              //     </Text>
              //   )}
              // </View>
<View style={styles.accountsPreview}>
  <Text style={styles.accountsPreviewTitle}>Suggested Accounts</Text>
  {aiSuggestions?.suggestedAccounts?.map(acc => (
    <Text key={acc.id} style={styles.accountsPreviewItem}>
      {acc.accountCode} - {acc.accountName}
    </Text>
  ))}
</View>
            )}
          </View>
        ) : null}

        {/* Reconciliation Options */}
        <Text style={styles.optionsSectionTitle}>RECONCILIATION OPTIONS</Text>

        <TouchableOpacity
          style={[styles.optionCard, recommendedAction !== 'create_payment' && styles.optionCardPrimary]}
          activeOpacity={0.7}
          onPress={openMatchModal}
        >
          <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
            <LinkIcon size={22} color={theme.colors.primary} weight="bold" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.primary }]}>
              Match to Invoice/Payment
            </Text>
            <Text style={styles.optionSubtitle}>Link this entry to existing records</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionCard, recommendedAction === 'create_payment' && styles.optionCardPrimary]}
          activeOpacity={0.7}
          onPress={openPaymentModal}
        >
          <View style={[styles.optionIcon, { backgroundColor: recommendedAction === 'create_payment' ? `${theme.colors.primary}15` : `${theme.colors.text.secondary}10` }]}>
            <PlusCircleIcon size={22} color={recommendedAction === 'create_payment' ? theme.colors.primary : theme.colors.text.primary} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, recommendedAction === 'create_payment' && { color: theme.colors.primary }]}>
              Create New Payment Entry
            </Text>
            <Text style={styles.optionSubtitle}>
              Record as a standalone payment
              {recommendedAction === 'create_payment' ? ' (Recommended)' : ''}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} activeOpacity={0.7} onPress={openJournalModal}>
          <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.text.secondary}10` }]}>
            <BookOpenIcon size={22} color={theme.colors.text.primary} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Post as Journal Entry</Text>
            <Text style={styles.optionSubtitle}>Manual double-entry adjustment</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} activeOpacity={0.7} onPress={openSaleModal}>
          <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.text.secondary}10` }]}>
            <ReceiptIcon size={22} color={theme.colors.text.primary} />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>Create New Sales Invoice</Text>
            <Text style={styles.optionSubtitle}>Generate invoice from this payment</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} activeOpacity={0.7} onPress={openRejectModal}>
          <View style={[styles.optionIcon, { backgroundColor: `${theme.colors.error}10` }]}>
            <XCircleIcon size={22} color={theme.colors.error} weight="fill" />
          </View>
          <View style={styles.optionTextContainer}>
            <Text style={[styles.optionTitle, { color: theme.colors.error }]}>Reject / Skip</Text>
            <Text style={styles.optionSubtitle}>Flag for later review</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom action — Confirm Match if there are matches, or recommended action */}
      {hasMatchSuggestions ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.85}
            onPress={handleConfirmMatch}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <CheckCircleIcon size={22} color="#FFFFFF" weight="fill" />
                <Text style={styles.confirmButtonText}>Confirm Match</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : recommendedAction === 'create_payment' ? (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.confirmButton}
            activeOpacity={0.85}
            onPress={openPaymentModal}
          >
            <PlusCircleIcon size={22} color="#FFFFFF" weight="fill" />
            <Text style={styles.confirmButtonText}>Create Payment Entry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ─── Match to Invoice/Payment Modal ─── */}
      {renderModal(
        matchModalVisible,
        () => setMatchModalVisible(false),
        'Match to Invoice/Payment',
        handleMatchSubmit,
        matchSelectedParty ? `Match to ${matchSelectedParty.name}` : 'Match',
        <>
          <Text style={styles.modalHint}>
            Select a customer to match this bank entry against.
          </Text>
          {matchSelectedParty ? (
            <View style={styles.selectedPartyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedPartyName}>{matchSelectedParty.name}</Text>
                <Text style={styles.selectedPartyDetail}>ID: {matchSelectedParty.id}{matchSelectedParty.detail ? ` \u2022 ${matchSelectedParty.detail}` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => setMatchSelectedParty(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <XCircleIcon size={22} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.partySearchInput}
                placeholder="Search customers..."
                placeholderTextColor={theme.colors.textSecondary}
                value={partySearch}
                onChangeText={setPartySearch}
              />
              {partyLoading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} color={theme.colors.primary} />
              ) : filteredPartyList.length === 0 ? (
                <Text style={styles.noPartyText}>No customers found</Text>
              ) : (
                <FlatList
                  data={filteredPartyList}
                  keyExtractor={item => item.id}
                  style={styles.partyListContainer}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.partyListItem}
                      onPress={() => {
                        setMatchSelectedParty(item);
                        setMatchId(item.id);
                      }}
                    >
                      <View style={styles.partyListItemLeft}>
                        <View style={styles.partyAvatar}>
                          <Text style={styles.partyAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={styles.partyListName}>{item.name}</Text>
                          {item.detail ? <Text style={styles.partyListDetail}>{item.detail}</Text> : null}
                        </View>
                      </View>
                      <Text style={styles.partyListId}>#{item.id}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}
        </>,
      )}

      {/* ─── Create Payment Modal ─── */}
      {renderModal(
        paymentModalVisible,
        () => setPaymentModalVisible(false),
        'Create Payment Entry',
        handlePaymentSubmit,
        paymentSelectedParty ? `Pay ${paymentSelectedParty.name}` : 'Create Payment',
        <>
          <Text style={styles.modalHint}>
            Record a new payment of {formatCurrency(amount)} as a standalone entry.
          </Text>
          <Text style={styles.fieldLabel}>Party Type</Text>
          {renderToggle('Customer', 'Supplier', paymentPartyType, 'customer', 'supplier', (val: any) => {
            setPaymentPartyType(val);
            setPaymentSelectedParty(null);
            setPartySearch('');
            fetchPartyList(val);
          })}
          {paymentSelectedParty ? (
            <View style={styles.selectedPartyCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedPartyName}>{paymentSelectedParty.name}</Text>
                <Text style={styles.selectedPartyDetail}>ID: {paymentSelectedParty.id}{paymentSelectedParty.detail ? ` \u2022 ${paymentSelectedParty.detail}` : ''}</Text>
              </View>
              <TouchableOpacity onPress={() => setPaymentSelectedParty(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <XCircleIcon size={22} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TextInput
                style={styles.partySearchInput}
                placeholder={`Search ${paymentPartyType}s...`}
                placeholderTextColor={theme.colors.textSecondary}
                value={partySearch}
                onChangeText={setPartySearch}
              />
              {partyLoading ? (
                <ActivityIndicator style={{ marginVertical: 16 }} color={theme.colors.primary} />
              ) : filteredPartyList.length === 0 ? (
                <Text style={styles.noPartyText}>No {paymentPartyType}s found</Text>
              ) : (
                <FlatList
                  data={filteredPartyList}
                  keyExtractor={item => item.id}
                  style={styles.partyListContainer}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.partyListItem}
                      onPress={() => {
                        setPaymentSelectedParty(item);
                        setPaymentPartyId(item.id);
                      }}
                    >
                      <View style={styles.partyListItemLeft}>
                        <View style={styles.partyAvatar}>
                          <Text style={styles.partyAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                          <Text style={styles.partyListName}>{item.name}</Text>
                          {item.detail ? <Text style={styles.partyListDetail}>{item.detail}</Text> : null}
                        </View>
                      </View>
                      <Text style={styles.partyListId}>#{item.id}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}
        </>,
      )}

      {/* ─── Journal Entry Modal ─── */}
      {renderModal(
        journalModalVisible,
        () => setJournalModalVisible(false),
        'Post as Journal Entry',
        handleJournalSubmit,
        'Post Entry',
        <>
          <Text style={styles.modalHint}>
            Create a double-entry for {formatCurrency(amount)}. Enter the debit and credit account IDs.
          </Text>
          {renderField('Narration', journalNarration, setJournalNarration, {
            placeholder: 'e.g. Bank receipt from client',
            multiline: true,
          })}
          {renderField('Debit Account ID', journalDebitAccountId, setJournalDebitAccountId, {
            placeholder: 'Account to debit',
            keyboardType: 'numeric',
          })}
          {renderField('Credit Account ID', journalCreditAccountId, setJournalCreditAccountId, {
            placeholder: 'Account to credit',
            keyboardType: 'numeric',
          })}
          <View style={styles.journalPreview}>
            <Text style={styles.journalPreviewTitle}>Preview</Text>
            <View style={styles.journalPreviewRow}>
              <Text style={styles.journalPreviewLabel}>
                Debit (Acc #{journalDebitAccountId || '?'})
              </Text>
              <Text style={[styles.journalPreviewAmount, { color: theme.colors.success }]}>
                {formatCurrency(amount)}
              </Text>
            </View>
            <View style={styles.journalPreviewRow}>
              <Text style={styles.journalPreviewLabel}>
                Credit (Acc #{journalCreditAccountId || '?'})
              </Text>
              <Text style={[styles.journalPreviewAmount, { color: theme.colors.error }]}>
                {formatCurrency(amount)}
              </Text>
            </View>
          </View>
        </>,
      )}

      {/* ─── Create Sale Modal ─── */}
      {renderModal(
        saleModalVisible,
        () => setSaleModalVisible(false),
        'Create Sales Invoice',
        handleSaleSubmit,
        'Create Invoice',
        <>
          <Text style={styles.modalHint}>
            Generate a sales invoice from this {formatCurrency(amount)} transaction.
          </Text>
          {renderField('Customer ID', saleCustomerId, setSaleCustomerId, {
            placeholder: 'Enter customer ID',
            keyboardType: 'numeric',
          })}
          {renderField('Item Description', saleItemDescription, setSaleItemDescription, {
            placeholder: 'e.g. Consulting services',
          })}
          <View style={styles.rowFields}>
            <View style={{ flex: 1 }}>
              {renderField('Quantity', saleItemQuantity, setSaleItemQuantity, {
                placeholder: '1',
                keyboardType: 'numeric',
              })}
            </View>
            <View style={{ flex: 1 }}>
              {renderField('Rate', saleItemRate, setSaleItemRate, {
                placeholder: String(amount),
                keyboardType: 'numeric',
              })}
            </View>
          </View>
          <View style={styles.saleTotalRow}>
            <Text style={styles.saleTotalLabel}>Total</Text>
            <Text style={styles.saleTotalValue}>
              {formatCurrency(
                (Number(saleItemQuantity) || 1) * (Number(saleItemRate) || amount),
              )}
            </Text>
          </View>
        </>,
      )}

      {/* ─── Reject Modal ─── */}
      {renderModal(
        rejectModalVisible,
        () => setRejectModalVisible(false),
        'Reject / Skip Transaction',
        handleRejectSubmit,
        'Reject',
        <>
          <Text style={styles.modalHint}>
            This transaction will be flagged and skipped. You can review it later.
          </Text>
          {renderField('Reason', rejectReason, setRejectReason, {
            placeholder: 'Why are you rejecting this transaction?',
            multiline: true,
          })}
        </>,
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    backButton: { padding: theme.spacing.xs },
    headerTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text.primary },
    menuButton: { padding: theme.spacing.xs },
    scrollView: { flex: 1 },
    scrollContent: { padding: theme.spacing.md, paddingBottom: 120 },

    // Details card
    detailsCard: {
      backgroundColor: '#FFF5F0',
      borderRadius: 16,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    detailsLabel: { fontSize: 10, fontWeight: '700', color: '#FF6B35', letterSpacing: 0.5, marginBottom: theme.spacing.sm },
    amountRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    amountText: { fontSize: 28, fontWeight: '800', color: theme.colors.text.primary },
    typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    descriptionText: { fontSize: 15, color: theme.colors.text.secondary, marginBottom: theme.spacing.md },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: theme.colors.text.secondary },
    metaDot: { fontSize: 10, color: theme.colors.text.secondary },

    // Suggestions loading
    suggestionsLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    suggestionsLoadingText: { fontSize: 13, color: theme.colors.text.secondary },

    // AI Suggestion
    aiSection: { marginBottom: theme.spacing.lg },
    aiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm },
    aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    aiTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: theme.colors.text.primary },
    confidenceBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: `${theme.colors.success}12`,
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    confidenceText: { fontSize: 12, fontWeight: '700', color: theme.colors.success },
    suggestionCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.surface, borderRadius: 14,
      padding: theme.spacing.md, borderWidth: 1.5,
      borderColor: `${theme.colors.primary}30`, gap: theme.spacing.md,
    },
    suggestionIconBg: {
      width: 44, height: 44, borderRadius: 12,
      backgroundColor: `${theme.colors.primary}12`,
      justifyContent: 'center', alignItems: 'center',
    },
    suggestionInfo: { flex: 1 },
    suggestionTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary },
    suggestionSubtext: { fontSize: 13, color: theme.colors.text.secondary, marginTop: 2 },
    suggestionHint: { fontSize: 12, color: theme.colors.success, fontStyle: 'italic', marginTop: 4 },

    matchListContainer: { marginTop: theme.spacing.sm },
    matchListItem: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.surface, borderRadius: 10,
      padding: theme.spacing.md, marginBottom: theme.spacing.xs,
      borderWidth: 1, borderColor: `${theme.colors.primary}25`, gap: theme.spacing.sm,
    },
    matchListTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text.primary },
    matchListSub: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },

    accountsPreview: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.surface, borderRadius: 10,
      padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
    },
    accountsPreviewTitle: { fontSize: 11, fontWeight: '700', color: theme.colors.text.secondary, letterSpacing: 0.5, marginBottom: 6 },
    accountsPreviewItem: { fontSize: 13, color: theme.colors.text.primary, paddingVertical: 3 },
    accountsPreviewMore: { fontSize: 12, color: theme.colors.primary, fontWeight: '600', marginTop: 4 },

    // Options
    optionsSectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, color: theme.colors.text.secondary, marginBottom: theme.spacing.md },
    optionCard: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.surface, borderRadius: 14,
      padding: theme.spacing.md, marginBottom: theme.spacing.sm,
      borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.md,
    },
    optionCardPrimary: { borderColor: `${theme.colors.primary}30`, backgroundColor: `${theme.colors.primary}06` },
    optionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    optionTextContainer: { flex: 1 },
    optionTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary },
    optionSubtitle: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },

    // Bottom bar
    bottomBar: {
      paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
      paddingBottom: theme.spacing.xl, backgroundColor: theme.colors.background,
      borderTopWidth: 1, borderTopColor: theme.colors.border,
    },
    confirmButton: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 16, gap: theme.spacing.sm,
    },
    confirmButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

    // Empty
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { fontSize: 16, color: theme.colors.text.secondary },

    // ─── Modal styles ─────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text.primary },
    modalCloseBtn: { padding: 4 },
    modalBody: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md },
    modalHint: { fontSize: 13, color: theme.colors.text.secondary, marginBottom: theme.spacing.lg, lineHeight: 19 },
    modalFooter: {
      flexDirection: 'row', gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    modalCancelBtn: {
      flex: 1, alignItems: 'center', justifyContent: 'center',
      paddingVertical: 14, borderRadius: 12,
      backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    },
    modalCancelText: { fontSize: 15, fontWeight: '600', color: theme.colors.text.primary },
    modalSubmitBtn: {
      flex: 2, alignItems: 'center', justifyContent: 'center',
      paddingVertical: 14, borderRadius: 12,
      backgroundColor: '#FF6B35',
    },
    modalSubmitText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

    // ─── Form elements ────────────────────────────────────────────
    toggleRow: {
      flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md,
    },
    toggleBtn: {
      flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 10,
      backgroundColor: theme.colors.surface, borderWidth: 1.5, borderColor: theme.colors.border,
    },
    toggleBtnActive: {
      borderColor: '#FF6B35', backgroundColor: '#FF6B3510',
    },
    toggleText: { fontSize: 14, fontWeight: '600', color: theme.colors.text.secondary },
    toggleTextActive: { color: '#FF6B35' },

    fieldGroup: { marginBottom: theme.spacing.md },
    fieldLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text.primary, marginBottom: 6 },
    fieldInput: {
      backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
      borderRadius: 10, paddingHorizontal: theme.spacing.md, paddingVertical: 12,
      fontSize: 15, color: theme.colors.text.primary,
    },
    fieldInputMultiline: { minHeight: 80, textAlignVertical: 'top' },

    rowFields: { flexDirection: 'row', gap: theme.spacing.sm },

    // Suggestions in match modal
    suggestionsInModal: { marginTop: theme.spacing.sm },
    suggestionsInModalTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.text.secondary, letterSpacing: 0.5, marginBottom: theme.spacing.sm },
    suggestionRow: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: theme.colors.surface, borderRadius: 10,
      padding: theme.spacing.md, marginBottom: theme.spacing.xs,
      borderWidth: 1.5, borderColor: theme.colors.border,
    },
    suggestionRowActive: { borderColor: '#FF6B35', backgroundColor: '#FF6B3508' },
    suggestionRowTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.text.primary },
    suggestionRowSub: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
    suggestionRowBadge: {
      backgroundColor: `${theme.colors.success}15`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    },
    suggestionRowBadgeText: { fontSize: 11, fontWeight: '700', color: theme.colors.success },

    // Journal preview
    journalPreview: {
      backgroundColor: theme.colors.surface, borderRadius: 10,
      padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
    },
    journalPreviewTitle: { fontSize: 12, fontWeight: '700', color: theme.colors.text.secondary, marginBottom: theme.spacing.sm },
    journalPreviewRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 6,
    },
    journalPreviewLabel: { fontSize: 14, color: theme.colors.text.primary },
    journalPreviewAmount: { fontSize: 14, fontWeight: '700' },

    // Sale total
    saleTotalRow: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      backgroundColor: theme.colors.surface, borderRadius: 10,
      padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border,
    },
    saleTotalLabel: { fontSize: 14, fontWeight: '700', color: theme.colors.text.primary },
    saleTotalValue: { fontSize: 18, fontWeight: '700', color: '#FF6B35' },

    // Party picker
    selectedPartyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.primary}08`,
      borderRadius: 12,
      padding: theme.spacing.md,
      borderWidth: 1.5,
      borderColor: `${theme.colors.primary}30`,
      marginBottom: theme.spacing.md,
    },
    selectedPartyName: { fontSize: 15, fontWeight: '700', color: theme.colors.text.primary },
    selectedPartyDetail: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 2 },
    partySearchInput: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 10,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    noPartyText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    partyListContainer: {
      maxHeight: 260,
    },
    partyListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    partyListItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    partyAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    partyAvatarText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    partyListName: { fontSize: 14, fontWeight: '600', color: theme.colors.text.primary },
    partyListDetail: { fontSize: 12, color: theme.colors.text.secondary, marginTop: 1 },
    partyListId: { fontSize: 12, color: theme.colors.text.secondary, fontWeight: '600' },
  });

export default ReviewTransactionScreen;

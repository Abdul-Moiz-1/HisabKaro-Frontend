import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  EnvelopeIcon,
  ArrowClockwiseIcon,
  ChartBarIcon,
  ClockCounterClockwiseIcon,
  WifiHighIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  TrashIcon,
  HourglassIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation } from '../../components/common';
import { useTheme } from '../../store/hooks';
import {
  emailAccountsApi,
  EmailAccount,
  EmailAccountStats,
  EmailProcessingLog,
  EmailProvider,
  LogStatus,
} from '../../services/api/emailAccounts';

// ─── Types ────────────────────────────────────────────────────────────────────

type RouteParams = { accountId: number };

// ─── Provider colors ──────────────────────────────────────────────────────────

const PROVIDER_COLOR: Record<EmailProvider, string> = {
  gmail: '#EA4335',
  outlook: '#0078D4',
};

// ─── Log status rendering ────────────────────────────────────────────────────

const renderLogIcon = (status: LogStatus, theme: any) => {
  switch (status) {
    case 'success':
      return (
        <CheckCircleIcon size={16} color={theme.colors.success} weight="fill" />
      );
    case 'failed':
      return (
        <XCircleIcon size={16} color={theme.colors.error} weight="fill" />
      );
    case 'pending':
    default:
      return <HourglassIcon size={16} color="#F59E0B" weight="fill" />;
  }
};

const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  accent: string;
  icon: React.ReactNode;
  style?: object;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  accent,
  icon,
  style,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStatCardStyles(theme, accent), [theme, accent]);
  return (
    <View style={[styles.card, style]}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const createStatCardStyles = (theme: ReturnType<typeof useTheme>, accent: string) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'flex-start',
      ...theme.shadows.sm,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: `${accent}18`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    value: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    label: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      lineHeight: 15,
    },
  });

// ─── Main Screen ──────────────────────────────────────────────────────────────

const EmailAccountDetailScreen: React.FC<
  NavigationProps<'EmailAccountDetail'>
> = ({ navigation, route }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const accountId = (route.params as RouteParams)?.accountId;

  const [account, setAccount] = useState<EmailAccount | null>(null);
  const [stats, setStats] = useState<EmailAccountStats | null>(null);
  const [logs, setLogs] = useState<EmailProcessingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logFilter, setLogFilter] = useState<LogStatus | undefined>(undefined);
  const [polling, setPolling] = useState(false);

  // ── Fetch Data ────────────────────────────────────────────────────────────────

  const fetchAll = useCallback(
    async (isRefresh = false) => {
      if (!accountId) {
        return;
      }
      try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        const [accRes, statsRes, logsRes] = await Promise.all([
          emailAccountsApi.getById(accountId),
          emailAccountsApi.getStats(accountId),
          emailAccountsApi.getLogs(accountId, { status: logFilter, limit: 50 }),
        ]);
        setAccount(accRes.data);
        setStats(statsRes.data);
        setLogs(logsRes.data ?? []);
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: 'Failed to load account details',
          text2: err?.message || 'Please try again',
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accountId, logFilter],
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Refresh (Poll) ────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    if (!accountId) {
      return;
    }
    try {
      setPolling(true);
      await emailAccountsApi.poll(accountId);
      Toast.show({
        type: 'success',
        text1: 'Refresh complete',
        text2: 'Inbox has been scanned for new transactions',
      });
      fetchAll(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Refresh failed',
        text2: err?.message || 'Please try again',
      });
    } finally {
      setPolling(false);
    }
  }, [accountId, fetchAll]);

  // ── Disconnect ────────────────────────────────────────────────────────────────

  const handleDisconnect = useCallback(() => {
    if (!account) {
      return;
    }
    Alert.alert(
      'Disconnect Account',
      `Are you sure you want to disconnect ${account.email}?\n\nExisting transactions will be preserved.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await emailAccountsApi.disconnect(account.id);
              Toast.show({
                type: 'success',
                text1: 'Account disconnected',
                text2: `${account.email} has been removed`,
              });
              navigation.goBack();
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: 'Failed to disconnect',
                text2: err?.message || 'Please try again',
              });
            }
          },
        },
      ],
    );
  }, [account, navigation]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <HeaderNavigation
          title="Account Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Loading account details…</Text>
        </View>
      </Container>
    );
  }

  if (!account) {
    return (
      <Container safeArea edges={['top']}>
        <HeaderNavigation
          title="Account Details"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loaderContainer}>
          <XCircleIcon size={48} color={theme.colors.error} weight="light" />
          <Text style={styles.loaderText}>Account not found</Text>
        </View>
      </Container>
    );
  }

  const providerColor =
    PROVIDER_COLOR[account.provider] || theme.colors.primary;

  const LOG_FILTERS: Array<{ label: string; value: LogStatus | undefined }> = [
    { label: 'All', value: undefined },
    { label: 'Success', value: 'success' },
    { label: 'Failed', value: 'failed' },
    { label: 'Pending', value: 'pending' },
  ];

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Account Details"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAll(true)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }>

        {/* ── Account Identity Card ── */}
        <View style={[styles.identityCard, { borderLeftColor: providerColor }]}>
          <View
            style={[
              styles.identityIcon,
              { backgroundColor: `${providerColor}18` },
            ]}>
            <EnvelopeIcon size={28} color={providerColor} weight="fill" />
          </View>
          <View style={styles.identityInfo}>
            <View
              style={[
                styles.providerPill,
                { backgroundColor: providerColor },
              ]}>
              <Text style={styles.providerPillText}>
                Gmail
              </Text>
            </View>
            <Text style={styles.identityEmail}>{account.email}</Text>
            <Text style={styles.identityMeta}>
              Connected:{' '}
              {new Date(account.createdAt).toLocaleDateString('en-PK', {
                dateStyle: 'medium',
              })}
            </Text>
          </View>
        </View>

        {/* ── Stats Row ── */}
        {stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsRow}>
              <StatCard
                label={'Emails\nProcessed'}
                value={stats.totalEmails}
                accent={theme.colors.primary}
                icon={
                  <EnvelopeIcon
                    size={18}
                    color={theme.colors.primary}
                    weight="fill"
                  />
                }
              />
              <StatCard
                label={'Matched\nTransactions'}
                value={stats.matchedTransactions}
                accent={theme.colors.success}
                icon={
                  <CheckCircleIcon
                    size={18}
                    color={theme.colors.success}
                    weight="fill"
                  />
                }
                style={{ marginHorizontal: theme.spacing.sm }}
              />
              <StatCard
                label={'Unmatched\nTransactions'}
                value={stats.unmatchedTransactions}
                accent={theme.colors.error}
                icon={
                  <WarningCircleIcon
                    size={18}
                    color={theme.colors.error}
                    weight="fill"
                  />
                }
              />
            </View>

            <View style={[styles.statsRow, { marginTop: theme.spacing.sm }]}>
              <StatCard
                label={'Parsed\nEmails'}
                value={stats.parsedCount}
                accent={theme.colors.secondary}
                icon={
                  <ChartBarIcon
                    size={18}
                    color={theme.colors.secondary}
                    weight="fill"
                  />
                }
              />
              <StatCard
                label={'Pending\nEmails'}
                value={stats.pendingCount}
                accent="#F59E0B"
                icon={
                  <HourglassIcon
                    size={18}
                    color="#F59E0B"
                    weight="fill"
                  />
                }
                style={{ marginHorizontal: theme.spacing.sm }}
              />
              <StatCard
                label={'Success\nRate'}
                value={`${stats.successRate}%`}
                accent={theme.colors.success}
                icon={
                  <WifiHighIcon
                    size={18}
                    color={theme.colors.success}
                    weight="fill"
                  />
                }
              />
            </View>
          </View>
        )}

        {/* ── Action Buttons ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsRow}>
            {/* Refresh */}
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: theme.colors.primary }]}
              onPress={handleRefresh}
              disabled={polling}
              activeOpacity={0.8}>
              {polling ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                />
              ) : (
                <ArrowClockwiseIcon
                  size={20}
                  color={theme.colors.primary}
                  weight="fill"
                />
              )}
              <Text
                style={[
                  styles.actionBtnText,
                  { color: theme.colors.primary },
                ]}>
                {polling ? 'Refreshing…' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Processing Logs ── */}
        <View style={styles.section}>
          <View style={styles.logsSectionHeader}>
            <View style={styles.sectionTitleRow}>
              <ClockCounterClockwiseIcon
                size={18}
                color={theme.colors.text.secondary}
                weight="fill"
              />
              <Text style={styles.sectionTitle}>Processing Logs</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{logs.length}</Text>
            </View>
          </View>

          {/* Log filter tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterTabsScroll}
            contentContainerStyle={styles.filterTabsContent}>
            {LOG_FILTERS.map(f => (
              <TouchableOpacity
                key={String(f.value)}
                style={[
                  styles.filterTab,
                  logFilter === f.value && styles.filterTabActive,
                ]}
                onPress={() => setLogFilter(f.value)}>
                <Text
                  style={[
                    styles.filterTabText,
                    logFilter === f.value && styles.filterTabTextActive,
                  ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Log items */}
          {logs.length === 0 ? (
            <View style={styles.emptyLogs}>
              <ChartBarIcon
                size={36}
                color={theme.colors.text.disabled}
                weight="light"
              />
              <Text style={styles.emptyLogsText}>No logs yet</Text>
            </View>
          ) : (
            logs.map((log, idx) => (
              <View key={log.id} style={[styles.logItem, idx === 0 && { marginTop: 0 }]}>
                <View style={styles.logStatus}>
                  {renderLogIcon(log.status, theme)}
                </View>
                <View style={styles.logBody}>
                  {log.emailSubject ? (
                    <Text style={styles.logSubject} numberOfLines={1}>
                      {log.emailSubject}
                    </Text>
                  ) : null}
                  <Text style={styles.logMessage} numberOfLines={2}>
                    {log.message}
                  </Text>
                  <Text style={styles.logTime}>
                    {formatDateTime(log.createdAt)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ── Danger Zone ── */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <Text style={styles.dangerSubtitle}>
            Disconnecting will stop inbox monitoring. Your existing transaction
            data will not be affected.
          </Text>
          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={handleDisconnect}
            activeOpacity={0.85}>
            <TrashIcon size={18} color={theme.colors.error} weight="fill" />
            <Text style={styles.disconnectBtnText}>Disconnect Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    loaderText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: 48,
      paddingTop: theme.spacing.sm,
    },
    // Identity card
    identityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      borderLeftWidth: 4,
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.md,
      ...theme.shadows.sm,
    },
    identityIcon: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identityInfo: {
      flex: 1,
      gap: 4,
    },
    providerPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 2,
    },
    providerPillText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    identityEmail: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    identityMeta: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    // Section
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    // Stats
    statsRow: {
      flexDirection: 'row',
    },
    // Actions
    actionsRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      borderWidth: 1.5,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 13,
      backgroundColor: theme.colors.surface,
    },
    actionBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },
    // Logs
    logsSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    countBadge: {
      backgroundColor: `${theme.colors.primary}18`,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.sm,
    },
    countText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    filterTabsScroll: {
      marginBottom: theme.spacing.md,
    },
    filterTabsContent: {
      gap: theme.spacing.sm,
      paddingRight: theme.spacing.md,
    },
    filterTab: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    filterTabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterTabText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    logItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      ...theme.shadows.xs,
    },
    logStatus: {
      marginTop: 2,
    },
    logBody: {
      flex: 1,
    },
    logSubject: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    logMessage: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      lineHeight: 17,
    },
    logTime: {
      fontSize: 11,
      color: theme.colors.text.disabled,
      marginTop: 4,
    },
    emptyLogs: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    emptyLogsText: {
      fontSize: 14,
      color: theme.colors.text.disabled,
    },
    // Danger zone
    dangerZone: {
      backgroundColor: `${theme.colors.error}08`,
      borderRadius: theme.borderRadius.xl,
      borderWidth: 1,
      borderColor: `${theme.colors.error}25`,
      padding: theme.spacing.lg,
    },
    dangerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.error,
      marginBottom: 6,
    },
    dangerSubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      lineHeight: 18,
      marginBottom: theme.spacing.md,
    },
    disconnectBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.error,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 13,
    },
    disconnectBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.error,
    },
  });

export default EmailAccountDetailScreen;

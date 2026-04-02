import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import {
  EnvelopeIcon,
  PlusCircleIcon,
  ArrowClockwiseIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  XCircleIcon,
  CaretRightIcon,
  CloudSlashIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation } from '../../components/common';
import { useTheme } from '../../store/hooks';
import {
  emailAccountsApi,
  EmailAccount,
  EmailProvider,
  EmailAccountStatus,
} from '../../services/api/emailAccounts';
import { ROUTES } from '../../constants/routes';

// ─── Provider Config ──────────────────────────────────────────────────────────

const PROVIDER_CONFIG: Record<
  EmailProvider,
  { label: string; color: string; textColor: string }
> = {
  gmail: {
    label: 'Gmail',
    color: '#EA4335',
    textColor: '#FFFFFF',
  },
  outlook: {
    label: '',
    color: '',
    textColor: ''
  }
};

const DEFAULT_PROVIDER_CONFIG = {
  label: 'Email',
  color: '#6366F1',
  textColor: '#FFFFFF',
};

const getProviderConfig = (provider: string) => {
  return (PROVIDER_CONFIG as any)[provider] || DEFAULT_PROVIDER_CONFIG;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusConfig = (
  status: EmailAccountStatus,
  theme: any,
): { icon: React.ReactNode; label: string; color: string } => {
  switch (status) {
    case 'active':
      return {
        icon: (
          <CheckCircleIcon size={14} color={theme.colors.success} weight="fill" />
        ),
        label: 'Active',
        color: theme.colors.success,
      };
    case 'expired':
      return {
        icon: (
          <WarningCircleIcon size={14} color="#F59E0B" weight="fill" />
        ),
        label: 'Token Expired',
        color: '#F59E0B',
      };
    case 'error':
    default:
      return {
        icon: <XCircleIcon size={14} color={theme.colors.error} weight="fill" />,
        label: 'Error',
        color: theme.colors.error,
      };
  }
};

const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) {
    return 'Never synced';
  }
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return 'Just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const EmailAccountsListScreen: React.FC<NavigationProps<'EmailAccountsList'>> = ({
  navigation,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<EmailProvider | null>(
    null,
  );

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchAccounts = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const response = await emailAccountsApi.getAll();
      setAccounts(response.data ?? []);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load email accounts',
        text2: err?.message || 'Please try again',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // ── Connect via OAuth ────────────────────────────────────────────────────────

  const handleConnect = useCallback(
    async (provider: EmailProvider) => {
      try {
        setConnectingProvider(provider);
        const { data: { authUrl } } = await emailAccountsApi.getOAuthUrl(provider);
        console.log('Opening OAuth URL:', authUrl);

        await Linking.openURL(authUrl);
        // After OAuth, the backend redirects to hisabkaro://email-connected
        // We refresh the list when the user returns
        setTimeout(() => fetchAccounts(), 2000);
      } catch (err: any) {
        Toast.show({
          type: 'error',
          text1: `Failed to connect ${getProviderConfig(provider).label}`,
          text2: err?.message || 'Please try again',
        });
      } finally {
        setConnectingProvider(null);
      }
    },
    [fetchAccounts],
  );

  // ── Disconnect ────────────────────────────────────────────────────────────────

  const handleDisconnect = useCallback((account: EmailAccount) => {
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
              setAccounts(prev => prev.filter(a => a.id !== account.id));
              Toast.show({
                type: 'success',
                text1: 'Account disconnected',
                text2: `${account.email} has been removed`,
              });
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
  }, []);

  // ── Navigate to Detail ────────────────────────────────────────────────────────

  const handleAccountPress = useCallback(
    (account: EmailAccount) => {
      navigation.navigate(ROUTES.EMAIL_ACCOUNT_DETAIL as any, {
        accountId: account.id,
      });
    },
    [navigation],
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  const renderProviderBadge = (provider: EmailProvider) => {
    const cfg = getProviderConfig(provider);
    return (
      <View style={[styles.providerBadge, { backgroundColor: cfg.color }]}>
        <EnvelopeIcon size={12} color={cfg.textColor} weight="bold" />
        <Text style={[styles.providerBadgeText, { color: cfg.textColor }]}>
          {cfg.label}
        </Text>
      </View>
    );
  };

  const renderAccountCard = (account: EmailAccount) => {
    const statusCfg = getStatusConfig(account.status, theme);
    const provCfg = getProviderConfig(account.provider);

    return (
      <TouchableOpacity
        key={account.id}
        style={styles.accountCard}
        onPress={() => handleAccountPress(account)}
        onLongPress={() => handleDisconnect(account)}
        activeOpacity={0.75}>
        {/* Provider stripe */}
        <View
          style={[styles.providerStripe, { backgroundColor: provCfg.color }]}
        />

        <View style={styles.accountCardBody}>
          {/* Icon + info */}
          <View style={styles.cardLeft}>
            <View
              style={[
                styles.providerIcon,
                { backgroundColor: `${provCfg.color}18` },
              ]}>
              <EnvelopeIcon size={22} color={provCfg.color} weight="fill" />
            </View>
            <View style={styles.accountInfo}>
              {renderProviderBadge(account.provider)}
              <Text style={styles.emailText} numberOfLines={1}>
                {account.email}
              </Text>
              <View style={styles.statusRow}>
                {statusCfg.icon}
                <Text style={[styles.statusText, { color: statusCfg.color }]}>
                  {statusCfg.label}
                </Text>
                <Text style={styles.dotSeparator}>·</Text>
                <Text style={styles.syncText}>
                  {formatRelativeTime(account.lastSyncedAt)}
                </Text>
              </View>
            </View>
          </View>
          <CaretRightIcon size={16} color={theme.colors.text.disabled} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderConnectButton = (provider: EmailProvider) => {
    const cfg = getProviderConfig(provider);
    const isConnecting = connectingProvider === provider;

    return (
      <TouchableOpacity
        key={provider}
        style={[styles.connectButton, { borderColor: cfg.color }]}
        onPress={() => handleConnect(provider)}
        disabled={!!connectingProvider}
        activeOpacity={0.8}>
        {isConnecting ? (
          <ActivityIndicator size="small" color={cfg.color} />
        ) : (
          <EnvelopeIcon size={18} color={cfg.color} weight="fill" />
        )}
        <Text style={[styles.connectButtonText, { color: cfg.color }]}>
          {isConnecting ? 'Opening browser…' : `Connect ${cfg.label}`}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <CloudSlashIcon size={52} color={theme.colors.text.disabled} weight="light" />
      </View>
      <Text style={styles.emptyTitle}>No Email Accounts</Text>
      <Text style={styles.emptySubtitle}>
        Connect your Gmail  inbox so HisabKaro can automatically
        extract bank transaction emails.
      </Text>
    </View>
  );

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Email Accounts"
        onBackPress={() => navigation.goBack()}
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loaderText}>Loading accounts…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAccounts(true)}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }>
          {/* ── Info Banner ── */}
          <View style={styles.infoBanner}>
            <EnvelopeIcon size={20} color={theme.colors.primary} weight="fill" />
            <Text style={styles.infoBannerText}>
              Connected inboxes are monitored for bank transaction emails to
              auto-match with your records.
            </Text>
          </View>

          {/* ── Connected Accounts ── */}
          {accounts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Connected Accounts</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{accounts.length}</Text>
                </View>
              </View>

              {accounts.map(renderAccountCard)}

              <Text style={styles.longPressHint}>
                Long-press an account to disconnect it
              </Text>
            </View>
          )}

          {/* ── Empty state (no accounts) ── */}
          {accounts.length === 0 && renderEmptyState()}

          {/* ── Connect New Account ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {accounts.length > 0 ? 'Add Another Account' : 'Connect an Account'}
            </Text>
            <View style={styles.connectButtonsRow}>
              {renderConnectButton('gmail')}
            </View>
          </View>

          {/* ── Security Note ── */}
          <View style={styles.securityNote}>
            <CheckCircleIcon
              size={14}
              color={theme.colors.success}
              weight="fill"
            />
            <Text style={styles.securityNoteText}>
              We only read transaction-related emails. No emails are stored on
              our servers.
            </Text>
          </View>
        </ScrollView>
      )}
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
    // Banner
    infoBanner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: `${theme.colors.primary}12`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    infoBannerText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 19,
      color: theme.colors.text.secondary,
    },
    // Section
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 4,
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
    // Account card
    accountCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    providerStripe: {
      width: 4,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderBottomLeftRadius: theme.borderRadius.lg,
    },
    accountCardBody: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    cardLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    providerIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    accountInfo: {
      flex: 1,
      gap: 3,
    },
    providerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      marginBottom: 2,
    },
    providerBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    emailText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 1,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    dotSeparator: {
      color: theme.colors.text.disabled,
      fontSize: 12,
    },
    syncText: {
      fontSize: 12,
      color: theme.colors.text.disabled,
    },
    longPressHint: {
      fontSize: 11,
      color: theme.colors.text.disabled,
      textAlign: 'center',
      marginTop: 4,
    },
    // Connect buttons
    connectButtonsRow: {
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    connectButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      borderWidth: 1.5,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: 14,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
    },
    connectButtonText: {
      fontSize: 15,
      fontWeight: '600',
    },
    // Empty state
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    emptyIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: `${theme.colors.text.disabled}12`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    emptyTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: theme.spacing.lg,
    },
    // Security note
    securityNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      backgroundColor: `${theme.colors.success}10`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    securityNoteText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.text.secondary,
      lineHeight: 18,
    },
  });

export default EmailAccountsListScreen;

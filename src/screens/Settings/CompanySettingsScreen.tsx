import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  BuildingsIcon,
  GearIcon,
  UsersIcon,
  CurrencyCircleDollarIcon,
  FileTextIcon,
  PlusIcon,
  CaretRightIcon,
  TrashIcon,
  PencilIcon,
} from 'phosphor-react-native';
import Toast from 'react-native-toast-message';
import { NavigationProps } from '../../types';
import { Container, HeaderNavigation, Button } from '../../components/common';
import { Input } from '../../components/forms';
import { useTheme, useAppSelector } from '../../store/hooks';
import { companyApi, Company, CompanySettings, CompanyUser } from '../../services/api';

const CompanySettingsScreen: React.FC<NavigationProps<'CompanySettings'>> = ({ navigation }) => {
  const theme = useTheme();
  const user = useAppSelector((state) => state.user.user);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editedSettings, setEditedSettings] = useState<Partial<CompanySettings>>({});

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Fetch company data
  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch companies
      const companiesList = await companyApi.getAll();
      setCompanies(companiesList);

      if (companiesList.length > 0) {
        // Get first active company
        const active = companiesList.find(c => c.isActive) || companiesList[0];
        setActiveCompany(active);

        // Fetch settings and users
        const [settingsResponse, users] = await Promise.all([
          companyApi.getSettings(active.id),
          companyApi.getUsers(active.id),
        ]);

        setSettings(settingsResponse.data);
        setEditedSettings(settingsResponse.data);
        setCompanyUsers(users);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to fetch company data',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle save settings
  const handleSaveSettings = async () => {
    if (!activeCompany || !editedSettings) return;

    try {
      setSaving(true);
      await companyApi.updateSettings(activeCompany.id, editedSettings);
      setSettings({ ...settings, ...editedSettings } as CompanySettings);
      setEditMode(false);
      Toast.show({
        type: 'success',
        text1: 'Saved',
        text2: 'Company settings updated successfully',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle switch company
  const handleSwitchCompany = async (company: Company) => {
    try {
      await companyApi.setActive(company.id);
      setActiveCompany(company);
      
      // Fetch new company settings
      const [settingsResponse, users] = await Promise.all([
        companyApi.getSettings(company.id),
        companyApi.getUsers(company.id),
      ]);

      setSettings(settingsResponse.data);
      setEditedSettings(settingsResponse.data);
      setCompanyUsers(users);

      Toast.show({
        type: 'success',
        text1: 'Switched',
        text2: `Now using ${company.name}`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to switch company',
      });
    }
  };

  // Handle invite user
  const handleInviteUser = () => {
    Alert.prompt(
      'Invite User',
      'Enter email address to invite:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Invite',
          onPress: async (email) => {
            if (!email || !activeCompany) return;
            try {
              await companyApi.inviteUser(activeCompany.id, { email, role: 'staff' });
              Toast.show({
                type: 'success',
                text1: 'Invitation Sent',
                text2: `Invite sent to ${email}`,
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to send invitation',
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  // Handle remove user
  const handleRemoveUser = (companyUser: CompanyUser) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${companyUser.firstName} ${companyUser.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await companyApi.removeUser(activeCompany!.id, companyUser.userId);
              setCompanyUsers(prev => prev.filter(u => u.userId !== companyUser.userId));
              Toast.show({
                type: 'success',
                text1: 'Removed',
                text2: 'User has been removed from the company',
              });
            } catch (error: any) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to remove user',
              });
            }
          },
        },
      ]
    );
  };

  // Render company selector
  const renderCompanySelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Companies</Text>
      {companies.map((company) => (
        <TouchableOpacity
          key={company.id}
          style={[
            styles.companyCard,
            activeCompany?.id === company.id && styles.companyCardActive,
          ]}
          onPress={() => handleSwitchCompany(company)}
          activeOpacity={0.7}
        >
          <View style={styles.companyIcon}>
            <BuildingsIcon
              size={24}
              color={activeCompany?.id === company.id ? '#FFFFFF' : theme.colors.primary}
              weight="fill"
            />
          </View>
          <View style={styles.companyInfo}>
            <Text style={[
              styles.companyName,
              activeCompany?.id === company.id && styles.companyNameActive,
            ]}>
              {company.name}
            </Text>
            <Text style={[
              styles.companyMeta,
              activeCompany?.id === company.id && styles.companyMetaActive,
            ]}>
              {company.currency} • {company.city || 'No location'}
            </Text>
          </View>
          {activeCompany?.id === company.id && (
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={styles.addCompanyButton}
        onPress={() => navigation.navigate('AddCompany')}
        activeOpacity={0.7}
      >
        <PlusIcon size={20} color={theme.colors.primary} />
        <Text style={styles.addCompanyText}>Add Another Company</Text>
      </TouchableOpacity>
    </View>
  );

  // Render settings
  const renderSettings = () => {
    if (!settings) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Business Settings</Text>
          <TouchableOpacity onPress={() => setEditMode(!editMode)}>
            <PencilIcon size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Default Currency</Text>
            {editMode ? (
              <Input
                value={editedSettings.defaultCurrency}
                onChangeText={(val) => setEditedSettings({ ...editedSettings, defaultCurrency: val })}
                style={styles.settingInput}
              />
            ) : (
              <Text style={styles.settingValue}>{settings.defaultCurrency}</Text>
            )}
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Payment Terms (Days)</Text>
            {editMode ? (
              <Input
                value={String(editedSettings.defaultPaymentTerms)}
                onChangeText={(val) => setEditedSettings({ ...editedSettings, defaultPaymentTerms: Number(val) })}
                keyboardType="number-pad"
                style={styles.settingInput}
              />
            ) : (
              <Text style={styles.settingValue}>{settings.defaultPaymentTerms} days</Text>
            )}
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Sales Tax Rate</Text>
            {editMode ? (
              <Input
                value={String(editedSettings.salesTaxRate)}
                onChangeText={(val) => setEditedSettings({ ...editedSettings, salesTaxRate: Number(val) })}
                keyboardType="decimal-pad"
                style={styles.settingInput}
              />
            ) : (
              <Text style={styles.settingValue}>{settings.salesTaxRate}%</Text>
            )}
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Invoice Prefix</Text>
            {editMode ? (
              <Input
                value={editedSettings.invoicePrefix}
                onChangeText={(val) => setEditedSettings({ ...editedSettings, invoicePrefix: val })}
                style={styles.settingInput}
              />
            ) : (
              <Text style={styles.settingValue}>{settings.invoicePrefix}</Text>
            )}
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Generate Invoice Numbers</Text>
            <TouchableOpacity
              onPress={() => editMode && setEditedSettings({
                ...editedSettings,
                autoGenerateInvoiceNumbers: !editedSettings.autoGenerateInvoiceNumbers,
              })}
            >
              <Text style={[styles.settingValue, { color: theme.colors.primary }]}>
                {editMode ? (editedSettings.autoGenerateInvoiceNumbers ? 'Yes' : 'No') : (settings.autoGenerateInvoiceNumbers ? 'Yes' : 'No')}
              </Text>
            </TouchableOpacity>
          </View>

          {editMode && (
            <View style={styles.editActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setEditMode(false);
                  setEditedSettings(settings);
                }}
                variant="secondary"
                style={styles.editButton}
              />
              <Button
                title="Save"
                onPress={handleSaveSettings}
                loading={saving}
                style={styles.editButton}
              />
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render team members
  const renderTeamMembers = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        <TouchableOpacity onPress={handleInviteUser}>
          <PlusIcon size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {companyUsers.map((companyUser) => (
        <View key={companyUser.id} style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {companyUser.firstName.charAt(0)}{companyUser.lastName.charAt(0)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {companyUser.firstName} {companyUser.lastName}
            </Text>
            <Text style={styles.userEmail}>{companyUser.email}</Text>
          </View>
          <View style={styles.userRole}>
            <Text style={styles.userRoleText}>{companyUser.role}</Text>
          </View>
          {companyUser.role !== 'owner' && (
            <TouchableOpacity onPress={() => handleRemoveUser(companyUser)}>
              <TrashIcon size={18} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <Container safeArea edges={['top']}>
        <HeaderNavigation
          title="Company Settings"
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading company settings...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container safeArea edges={['top']}>
      <HeaderNavigation
        title="Company Settings"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {renderCompanySelector()}
        {renderSettings()}
        {renderTeamMembers()}
      </ScrollView>
    </Container>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    section: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    companyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    companyCardActive: {
      backgroundColor: theme.colors.primary,
    },
    companyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: `${theme.colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    companyInfo: {
      flex: 1,
    },
    companyName: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    companyNameActive: {
      color: '#FFFFFF',
    },
    companyMeta: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    companyMetaActive: {
      color: 'rgba(255,255,255,0.8)',
    },
    activeBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    activeBadgeText: {
      fontSize: 11,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    addCompanyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    addCompanyText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    settingsCard: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    },
    settingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    settingLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      flex: 1,
    },
    settingValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    settingInput: {
      width: 100,
      textAlign: 'right',
    },
    editActions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    editButton: {
      flex: 1,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.sm,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${theme.colors.info}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    userAvatarText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.info,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    userEmail: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    userRole: {
      backgroundColor: `${theme.colors.primary}15`,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
    },
    userRoleText: {
      fontSize: 11,
      color: theme.colors.primary,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
    },
  });

export default CompanySettingsScreen;

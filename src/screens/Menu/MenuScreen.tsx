import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {
  BuildingsIcon,
  FileTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  ListBulletsIcon,
  BookOpenIcon,
  ScalesIcon,
  ChartLineUpIcon,
  ChartBarIcon,
  BookBookmarkIcon,
  ExportIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  SignOutIcon,
  EnvelopeIcon,
  ClockCounterClockwiseIcon,
} from 'phosphor-react-native';
import { NavigationProps, RootStackParamList } from '../../types';
import { ROUTES } from '../../constants/routes';
import { Container, HeaderNavigation } from '../../components/common';
import { useTheme, useAppDispatch } from '../../store/hooks';
import { authApi } from '../../services/api/auth';
import { logout } from '../../store/slices/userSlice';

interface SettingsItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  route?: keyof RootStackParamList;
  onPress?: () => void;
}

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

const MenuScreen: React.FC<NavigationProps<'Menu'>> = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = useCallback(async () => {
    Alert.alert('Logout', 'Kya aap logout karna chahte hain?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout();
            dispatch(logout());
            navigation.replace(ROUTES.LOGIN);
          } catch {
            dispatch(logout());
            navigation.replace(ROUTES.LOGIN);
          }
        },
      },
    ]);
  }, [dispatch, navigation]);

  const iconColor = theme.colors.primary;
  const iconSize = 22;

  const sections: SettingsSection[] = useMemo(
    () => [
      {
        title: 'BUSINESS SETTINGS',
        items: [
          {
            id: 'business_profile',
            title: 'Business Profile',
            subtitle: 'Karobari Profile',
            icon: <BuildingsIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.PROFILE,
          },
          {
            id: 'tax_ntn',
            title: 'Tax & NTN',
            subtitle: 'Tax ki Tafseelat',
            icon: <FileTextIcon size={iconSize} color={iconColor} weight="fill" />,
            onPress: () => console.log('Tax & NTN pressed'),
          },
          {
            id: 'email_accounts',
            title: 'Email Accounts',
            subtitle: 'Email se Transaction nikalna',
            icon: <EnvelopeIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.EMAIL_ACCOUNTS_LIST,
          },
        ],
      },
      {
        title: 'USER MANAGEMENT',
        items: [
          {
            id: 'staff_access',
            title: 'Staff Access',
            subtitle: 'Staff ki Pohanch',
            icon: <UsersIcon size={iconSize} color={iconColor} weight="fill" />,
            onPress: () => console.log('Staff Access pressed'),
          },
          {
            id: 'permissions',
            title: 'Permissions',
            subtitle: 'Ikhtiyarat',
            icon: <ShieldCheckIcon size={iconSize} color={iconColor} weight="fill" />,
            onPress: () => console.log('Permissions pressed'),
          },
        ],
      },
      {
        title: 'ACCOUNTING TOOLS',
        items: [
          {
            id: 'chart_of_accounts',
            title: 'Chart of Accounts',
            subtitle: 'Hisab Kitab ki List',
            icon: <ListBulletsIcon size={iconSize} color={iconColor} weight="bold" />,
            onPress: () => console.log('Chart of Accounts pressed'),
          },
          {
            id: 'journal_entries',
            title: 'Journal Entries',
            subtitle: 'Roznamcha',
            icon: <BookOpenIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.GENERAL_JOURNAL,
          },
          {
            id: 'trial_balance',
            title: 'Trial Balance',
            subtitle: 'Mizania Aazmaaishi',
            icon: <ScalesIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.TRIAL_BALANCE,
          },
          {
            id: 'profit_loss',
            title: 'Profit / Loss',
            subtitle: 'Nafa Nuqsan',
            icon: <ChartLineUpIcon size={iconSize} color={iconColor} weight="bold" />,
            route: ROUTES.PROFIT_LOSS,
          },
          {
            id: 'balance_sheet',
            title: 'Balance Sheet',
            subtitle: 'Mizania',
            icon: <ChartBarIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.BALANCE_SHEET,
          },
          {
            id: 'general_ledger',
            title: 'General Ledger',
            subtitle: 'Khaata Bahi',
            icon: <BookBookmarkIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.GENERAL_LEDGER,
          },
          {
            id: 'pending_transactions',
            title: 'Pending Transactions',
            subtitle: 'Zayr e Ghour Lein Dein',
            icon: <ClockCounterClockwiseIcon size={iconSize} color={iconColor} weight="fill" />,
            route: ROUTES.BANK_FEED,
          },
        ],
      },
      {
        title: 'DATA MANAGEMENT',
        items: [
          {
            id: 'export_excel',
            title: 'Export to Excel',
            subtitle: 'Excel mein export karein',
            icon: <ExportIcon size={iconSize} color={iconColor} weight="bold" />,
            onPress: () => console.log('Export to Excel pressed'),
          },
        ],
      },
    ],
    [iconColor],
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(
          item =>
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q),
        ),
      }))
      .filter(section => section.items.length > 0);
  }, [sections, searchQuery]);

  const handleItemPress = useCallback(
    (item: SettingsItem) => {
      if (item.route) {
        navigation.navigate(item.route);
      } else if (item.onPress) {
        item.onPress();
      }
    },
    [navigation],
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        scrollView: {
          flex: 1,
        },
        scrollContent: {
          paddingHorizontal: theme.spacing.md,
          paddingBottom: 100,
        },
        searchContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          height: 44,
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
        sectionTitle: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          fontWeight: '600',
          letterSpacing: 0.5,
          marginTop: theme.spacing.lg,
          marginBottom: theme.spacing.sm,
          paddingHorizontal: theme.spacing.xs,
        },
        sectionCard: {
          backgroundColor: theme.colors.surface,
          borderRadius: 14,
          overflow: 'hidden',
        },
        itemRow: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 14,
          paddingHorizontal: theme.spacing.md,
        },
        itemDivider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: theme.colors.divider,
          marginLeft: 52,
        },
        iconWrapper: {
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: theme.colors.primary + '18',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: theme.spacing.md,
        },
        itemTextContainer: {
          flex: 1,
        },
        itemTitle: {
          ...theme.typography.body,
          color: theme.colors.text.primary,
          fontWeight: '500',
          fontSize: 15,
        },
        itemSubtitle: {
          ...theme.typography.caption,
          color: theme.colors.text.secondary,
          marginTop: 2,
          fontSize: 12,
        },
        logoutContainer: {
          marginTop: theme.spacing.xl,
          paddingHorizontal: theme.spacing.xs,
        },
        logoutButton: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.text.primary,
          borderRadius: 14,
          paddingVertical: 14,
          gap: theme.spacing.sm,
        },
        logoutText: {
          ...theme.typography.body,
          color: theme.colors.background,
          fontWeight: '600',
          fontSize: 15,
        },
        logoutSubtext: {
          ...theme.typography.caption,
          color: theme.colors.background + 'AA',
          fontSize: 12,
        },
      }),
    [theme],
  );

  const renderItem = (item: SettingsItem, isLast: boolean) => (
    <View key={item.id}>
      <TouchableOpacity
        style={styles.itemRow}
        activeOpacity={0.6}
        onPress={() => handleItemPress(item)}
      >
        <View style={styles.iconWrapper}>{item.icon}</View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
        <CaretRightIcon size={18} color={theme.colors.text.secondary} weight="bold" />
      </TouchableOpacity>
      {!isLast && <View style={styles.itemDivider} />}
    </View>
  );

  return (
    <Container safeArea edges={['top']} style={styles.container}>
      <HeaderNavigation
        title="Settings & Tools"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.searchContainer}>
        <MagnifyingGlassIcon
          size={18}
          color={theme.colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search settings & tools"
          placeholderTextColor={theme.colors.text.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filteredSections.map(section => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, idx) =>
                renderItem(item, idx === section.items.length - 1),
              )}
            </View>
          </View>
        ))}

        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <SignOutIcon size={20} color={theme.colors.background} weight="bold" />
            <Text style={styles.logoutText}>
              Logout{'  '}
              <Text style={styles.logoutSubtext}>(Log out Karein)</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

export default MenuScreen;

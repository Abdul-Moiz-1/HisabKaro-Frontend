// flows/editTransaction/screens/SelectPartyScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../theme';
import { useFlowNavigation } from '../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import SearchableList from '../../../components/common/SearchableList';
import ActionButton from '../../../components/common/ActionButton';
import { Theme } from '../../../constants/theme';

interface Party {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  outstanding?: number;
  dueDate?: string;
}

// Mock data
const mockCustomers: Party[] = [
  {
    id: '1',
    name: 'Ahmed Electronics',
    phone: '+923001234567',
    outstanding: 25000,
    dueDate: '2025-11-20',
  },
  {
    id: '2',
    name: 'Bilal Store',
    phone: '+923009876543',
    outstanding: 18000,
    dueDate: '2025-11-15',
  },
  {
    id: '3',
    name: 'Hassan Traders',
    phone: '+923007654321',
    outstanding: 0,
  },
];

const mockSuppliers: Party[] = [
  {
    id: '1',
    name: 'Al-Rehman Traders',
    outstanding: 250000,
    dueDate: '2025-11-20',
    phone: '+923001234567',
  },
  {
    id: '2',
    name: 'Bismillah Wholesale',
    outstanding: 180000,
    dueDate: '2025-11-15',
    phone: '+923009876543',
  },
  {
    id: '3',
    name: 'Metro Cash & Carry',
    outstanding: 95000,
    dueDate: '2025-11-25',
    phone: '+923007654321',
  },
];

const SelectPartyScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen, goBack } = useFlowNavigation();

  // @ts-ignore
  const { currentParty, partyType } = route.params?.flowData || {};

  const [parties] = useState<Party[]>(
    partyType === 'Customer' ? mockCustomers : mockSuppliers,
  );
  const [selectedParty, setSelectedParty] = useState<Party | null>(
    currentParty,
  );

  const handlePartySelect = (party: Party) => {
    setSelectedParty(party);
  };

  const handleConfirm = () => {
    // Navigate back with selected party
    goBack();
    // goBack({ party: selectedParty });
  };

  const handleAddNew = () => {
    navigateToScreen(partyType === 'Customer' ? 'AddCustomer' : 'AddSupplier');
  };

  const renderPartyItem = (party: Party) => {
    const isSelected = selectedParty?.id === party.id;
    const isOverdue = party.dueDate && new Date(party.dueDate) < new Date();

    return (
      <View style={[styles.partyCard, isSelected && styles.partyCardSelected]}>
        <View style={styles.partyInfo}>
          <Text style={styles.partyName}>{party.name}</Text>
          {party.phone && (
            <Text style={styles.partyPhone}>📞 {party.phone}</Text>
          )}
          {party.outstanding && party.outstanding > 0 ? (
            <View style={styles.outstandingContainer}>
              <Text style={styles.outstandingLabel}>Outstanding:</Text>
              <Text
                style={[
                  styles.outstandingAmount,
                  isOverdue && styles.overdueAmount,
                ]}
              >
                PKR {party.outstanding.toLocaleString()}
              </Text>
              {isOverdue && (
                <Text style={styles.overdueIndicator}>⚠️ Overdue</Text>
              )}
            </View>
          ) : (
            <Text style={styles.noOutstanding}>✅ No outstanding</Text>
          )}
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            Select a new {partyType.toLowerCase()} for this transaction
          </Text>
        </View>

        <SearchableList
          data={parties}
          searchPlaceholder={`🔍 Search ${partyType.toLowerCase()}s...`}
          searchKey="name"
          onItemPress={handlePartySelect}
          renderItem={renderPartyItem}
          sectionHeader={`Available ${partyType}s:`}
          emptyMessage={`No ${partyType.toLowerCase()}s found`}
        />
      </View>

      <View style={styles.footer}>
        <ActionButton
          title={`+ Add New ${partyType}`}
          onPress={handleAddNew}
          variant="outline"
        />
        <View style={styles.footerSpacer} />
        <ActionButton
          title="Confirm Selection"
          onPress={handleConfirm}
          disabled={!selectedParty}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    backgroundColor: theme.colors.primary + '15',
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  infoBannerText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
  },
  partyCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  partyCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  partyInfo: {
    flex: 1,
  },
  partyName: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  partyPhone: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  outstandingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing.xs,
  },
  outstandingLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
  },
  outstandingAmount: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: '700' as const,
  },
  overdueAmount: {
    color: '#FF3B30',
  },
  overdueIndicator: {
    ...theme.typography.caption,
    fontSize: 10,
    color: '#FF3B30',
  },
  noOutstanding: {
    ...theme.typography.caption,
    color: '#34C759',
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: theme.spacing.sm,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  footer: {
    flexDirection: 'row' as const,
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.sm,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default SelectPartyScreen;

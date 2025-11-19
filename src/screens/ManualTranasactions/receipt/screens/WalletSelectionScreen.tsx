// flows/receipt/screens/WalletSelectionScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import {
  DateField,
  RadioField,
  TextInputField,
} from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';

const walletOptions = [
  { label: 'JazzCash', value: 'jazzcash' },
  { label: 'Easypaisa', value: 'easypaisa' },
  { label: 'NayaPay', value: 'nayapay' },
  { label: 'SadaPay', value: 'sadapay' },
  { label: 'Other', value: 'other' },
];

const WalletSelectionScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen } = useFlowNavigation();

  const [walletType, setWalletType] = useState('');
  const [customWalletName, setCustomWalletName] = useState('');
  const [walletAccount, setWalletAccount] = useState('');
  const [walletDate, setWalletDate] = useState(new Date());

  const handleContinue = () => {
    navigateToScreen('Confirmation', {
      walletType: walletType === 'other' ? customWalletName : walletType,
      walletAccount,
      walletDate: walletDate.toISOString(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Wallet Type Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Which wallet received payment?
          </Text>

          <RadioField
            field={{
              id: 'customWalletName',
              name: 'customWalletName',
              label: '',
              type: FieldType.RADIO, // or your FieldType enum
              required: true,
              options: walletOptions,
            }}
            value={walletType}
            onChange={setWalletType}
            onBlur={() => {}}
          />
        </View>

        {/* Custom Wallet Name (if Other selected) */}
        {walletType === 'other' && (
          <View style={styles.section}>
            <TextInputField
              field={{
                id: 'customWalletName',
                name: 'customWalletName',
                label: 'Wallet Name',
                type: FieldType.TEXT, // or your FieldType enum
                required: true,
                placeholder: 'Enter wallet name',
              }}
              value={customWalletName}
              onChange={setCustomWalletName} // Make sure this matches onChange signature
              onBlur={() => {}}
            />
          </View>
        )}

        {/* Wallet Account */}
        <View style={styles.section}>
          <TextInputField
            field={{
              id: 'walletAccount',
              name: 'walletAccount',
              label: 'Wallet Account Number/Phone',
              type: FieldType.TEXT,
              placeholder: 'Enter wallet account or phone',
            }}
            value={walletAccount}
            onChange={setWalletAccount}
            onBlur={() => {}}
          />
        </View>

        {/* Date Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            When did you receive the payment?
          </Text>

          <DateField
            field={{
              id: 'walletDate',
              name: 'walletDate',
              label: 'Payment Date',
              type: FieldType.DATE,
            }}
            value={walletDate.toISOString()}
            onChange={(val: string) => setWalletDate(new Date(val))}
            onBlur={() => {}}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton
          title="Continue →"
          onPress={handleContinue}
          disabled={!walletType}
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
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default WalletSelectionScreen;

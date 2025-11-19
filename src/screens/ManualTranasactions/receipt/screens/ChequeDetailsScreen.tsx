// flows/receipt/screens/ChequeDetailsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import {
  DateField,
  DropdownField,
  FileUploadField,
  NumberInputField,
  RadioField,
} from '../../../../components/DynamicForm';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';
import { FieldType } from '../../../../types/forms';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChequeDetailsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const { navigateToScreen, goBack } = useFlowNavigation();

  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeDate, setChequeDate] = useState(new Date());
  const [chequeBankName, setChequeBankName] = useState('');
  const [chequeStatus, setChequeStatus] = useState('received');
  const [chequePhoto, setChequePhoto] = useState<any>(null);

  const handleContinue = () => {
    const chequeDetails = {
      chequeNumber,
      chequeDate: chequeDate.toISOString(),
      chequeBankName,
      chequeStatus,
      chequePhoto,
    };

    // Navigate based on cheque status
    if (chequeStatus === 'cleared') {
      navigateToScreen('ChequeBankSelection', { chequeDetails });
    } else {
      navigateToScreen('Confirmation', { chequeDetails });
    }
  };

  const bankOptions = [
    { label: 'HBL', value: 'hbl' },
    { label: 'Meezan Bank', value: 'meezan' },
    { label: 'Bank Alfalah', value: 'alfalah' },
    { label: 'UBL', value: 'ubl' },
    { label: 'MCB', value: 'mcb' },
    { label: 'Other', value: 'other' },
  ];

  const statusOptions = [
    { label: 'Received (not cleared)', value: 'received' },
    { label: 'Cleared', value: 'cleared' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <NumberInputField
            field={{
              id: 'chequeNumber',
              name: 'chequeNumber',
              label: 'Cheque Number',
              type: FieldType.NUMBER,
              maxLength: 10,
              required: true,
            }}
            value={chequeNumber}
            onChange={setChequeNumber} // matches (value: string) => void
            onBlur={() => {}}
          />

          <DateField
            field={{
              id: 'chequeDate',
              name: 'chequeDate',
              label: 'Cheque Date',
              type: FieldType.DATE,
              required: true,
            }}
            value={chequeDate.toISOString()} // ensure DateFieldProps.value type matches your state (string or Date)
            onChange={(value: string) => setChequeDate(new Date(value))} // (value: Date) => void if value is Date
            onBlur={() => {}}
          />

          <DropdownField
            field={{
              id: 'chequeBankName',
              name: 'chequeBankName',
              label: 'Bank Name',
              type: FieldType.DROPDOWN,
              placeholder: 'Select bank',
              options: bankOptions, // DropdownOption[]
            }}
            value={chequeBankName}
            onChange={setChequeBankName}
            onBlur={() => {}}
          />

          <RadioField
            field={{
              id: 'chequeStatus',
              name: 'chequeStatus',
              label: 'Status',
              type: FieldType.RADIO,
              options: statusOptions,
              required: true,
            }}
            value={chequeStatus}
            onChange={setChequeStatus} // (value: string) => void
            onBlur={() => {}}
          />

          <FileUploadField
            field={{
              id: 'chequePhoto',
              name: 'chequePhoto',
              label: 'Attach cheque photo (optional)',
              type: FieldType.FILE,
              placeholder: '📸 Attach cheque photo',
              hint: 'Max size 5MB, formats: JPG, PNG',
            }}
            value={chequePhoto}
            onChange={setChequePhoto} // (value: File | null) => void depending on your implementation
            onBlur={() => {}}
          />
        </ScrollView>

        <View style={styles.footer}>
          <ActionButton
            title="Continue"
            onPress={handleContinue}
            variant="primary"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  footerButtons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
  },
  footerSpacer: {
    width: theme.spacing.sm,
  },
});

export default ChequeDetailsScreen;

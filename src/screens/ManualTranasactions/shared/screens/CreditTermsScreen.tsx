// flows/purchase/screens/CreditTermsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useThemedStyles } from '../../../../theme';
import { useFlowNavigation } from '../../../../hooks/useFlowNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DateField, TextAreaField } from '../../../../components/DynamicForm';
import { FieldType } from '../../../../types/forms';
import ActionButton from '../../../../components/common/ActionButton';
import { Theme } from '../../../../constants/theme';

const CreditTermsScreen: React.FC = () => {
  const styles = useThemedStyles(createStyles);
  const route = useRoute();
  const { navigateToScreen } = useFlowNavigation();

  // @ts-ignore
  const { totalAmount, supplier } = route.params?.flowData || {};

  const defaultDays = supplier?.creditPeriod || 30;
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + defaultDays * 24 * 60 * 60 * 1000),
  );
  const [notes, setNotes] = useState('');

  const handleContinue = () => {
    navigateToScreen('Confirmation', {
      paymentStatus: 'pending',
      dueDate: dueDate.toISOString(),
      notes,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount on credit:</Text>
          <Text style={styles.amountValue}>
            PKR {totalAmount?.toLocaleString()}
          </Text>
        </View>

        {/* Due Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Due Date</Text>

          <DateField
            field={{
              id: 'dueDate',
              name: 'dueDate',
              label: '',
              type: FieldType.DATE,
              required: true,
            }}
            value={dueDate.toISOString()}
            onChange={(value: string) => setDueDate(new Date(value))}
            onBlur={() => {}}
          />

          <View style={styles.dueDateInfo}>
            <Text style={styles.dueDateInfoText}>
              Payment due in{' '}
              {Math.ceil(
                (dueDate.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              )}{' '}
              days
            </Text>
          </View>

          {/* Quick Due Date Options */}
          <View style={styles.quickDueDates}>
            <TouchableOpacity
              style={styles.quickDueDateButton}
              onPress={() =>
                setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
              }
            >
              <Text style={styles.quickDueDateText}>7 days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDueDateButton}
              onPress={() =>
                setDueDate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
              }
            >
              <Text style={styles.quickDueDateText}>15 days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickDueDateButton}
              onPress={() =>
                setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
              }
            >
              <Text style={styles.quickDueDateText}>30 days</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <TextAreaField
            field={{
              id: 'notes',
              name: 'notes',
              label: 'Notes (optional)',
              type: FieldType.TEXTAREA,
              placeholder: 'Add any notes about this purchase...',
              numberOfLines: 3,
              required: true,
            }}
            value={notes}
            onChange={setNotes}
            onBlur={() => {}}
          />
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⏰</Text>
          <Text style={styles.warningText}>
            You'll be reminded before the due date to make this payment
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <ActionButton title="Complete Purchase ✓" onPress={handleContinue} />
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
  amountCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    alignItems: 'center' as const,
  },
  amountLabel: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  amountValue: {
    ...theme.typography.h2,
    color: theme.colors.error,
    fontWeight: 'bold' as const,
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
  dueDateInfo: {
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  dueDateInfoText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    textAlign: 'center' as const,
  },
  quickDueDates: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  quickDueDateButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  quickDueDateText: {
    ...theme.typography.caption,
    color: theme.colors.text.primary,
    fontWeight: '600' as const,
  },
  notesSection: {
    marginBottom: theme.spacing.lg,
  },
  warningCard: {
    flexDirection: 'row' as const,
    backgroundColor: '#FF9500' + '15',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  warningIcon: {
    fontSize: 20,
  },
  warningText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
});

export default CreditTermsScreen;

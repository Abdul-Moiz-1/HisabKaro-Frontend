import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  XIcon,
  CalendarIcon,
  BellIcon,
  SparkleIcon,
  QuestionIcon,
  FileTextIcon,
} from 'phosphor-react-native';
import { useTheme } from '../../../../../store/hooks';
import ActionButton from '../../../../../components/common/ActionButton';
import {
  RecurringFrequency,
  ExecutionMode,
  RecurringEntryFormValues,
} from '../../schema';

interface RecurringEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: RecurringEntryFormValues) => void;
  entryTitle?: string;
  entryAmount?: number;
  initialSettings?: RecurringEntryFormValues;
}

const FREQUENCY_OPTIONS: { value: RecurringFrequency; label: string }[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
];

const RecurringEntryModal: React.FC<RecurringEntryModalProps> = ({
  visible,
  onClose,
  onSave,
  entryTitle = 'Journal Entry',
  entryAmount = 0,
  initialSettings,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Local state for form
  const [frequency, setFrequency] = useState<RecurringFrequency>(
    initialSettings?.frequency || 'monthly'
  );
  const [endDate, setEndDate] = useState<string>(
    initialSettings?.endDate || getDefaultEndDate()
  );
  const [occurrences, setOccurrences] = useState<number>(
    initialSettings?.occurrences || 12
  );
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(
    initialSettings?.executionMode || 'remind'
  );

  function getDefaultEndDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const handleSave = useCallback(() => {
    onSave({
      isRecurring: true,
      frequency,
      endDate,
      occurrences,
      executionMode,
    });
  }, [frequency, endDate, occurrences, executionMode, onSave]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <XIcon size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recurring Entry Setup</Text>
          <TouchableOpacity style={styles.helpButton}>
            <QuestionIcon size={24} color={theme.colors.primary} weight="fill" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Transaction Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Selected Transaction / Kya repeat karna hai?
            </Text>
            <View style={styles.transactionCard}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionLabel}>JOURNAL ENTRY #402</Text>
                <Text style={styles.transactionTitle}>{entryTitle}</Text>
                <Text style={styles.transactionAmount}>
                  {formatCurrency(entryAmount)}
                </Text>
              </View>
              <View style={styles.transactionIcon}>
                <FileTextIcon size={32} color={theme.colors.primary} weight="fill" />
              </View>
            </View>
          </View>

          {/* Frequency Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequency / Kab Kab?</Text>
            <View style={styles.frequencyContainer}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    frequency === option.value && styles.frequencyOptionActive,
                  ]}
                  onPress={() => setFrequency(option.value)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequency === option.value && styles.frequencyTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Repeat Until Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat Until / Kab tak?</Text>
            <View style={styles.repeatUntilContainer}>
              {/* End Date Card */}
              <TouchableOpacity style={styles.repeatCard}>
                <Text style={styles.repeatLabel}>END DATE</Text>
                <Text style={styles.repeatValue}>{formatDate(endDate)}</Text>
              </TouchableOpacity>

              {/* Occurrences Card */}
              <TouchableOpacity style={styles.repeatCard}>
                <Text style={styles.repeatLabel}>OCCURRENCES</Text>
                <Text style={styles.repeatValue}>{occurrences} Times</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Execution Mode Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Execution Mode / Kaise post ho?
            </Text>
            <View style={styles.executionContainer}>
              {/* Remind Me Option */}
              <TouchableOpacity
                style={[
                  styles.executionOption,
                  executionMode === 'remind' && styles.executionOptionActive,
                ]}
                onPress={() => setExecutionMode('remind')}
              >
                <View
                  style={[
                    styles.executionIconContainer,
                    executionMode === 'remind' &&
                      styles.executionIconContainerActive,
                  ]}
                >
                  <BellIcon
                    size={28}
                    color={
                      executionMode === 'remind'
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary
                    }
                    weight={executionMode === 'remind' ? 'fill' : 'regular'}
                  />
                </View>
                <Text
                  style={[
                    styles.executionTitle,
                    executionMode === 'remind' && styles.executionTitleActive,
                  ]}
                >
                  Remind Me
                </Text>
                <Text style={styles.executionSubtitle}>Mujhe batayein</Text>
              </TouchableOpacity>

              {/* Auto-Post Option */}
              <TouchableOpacity
                style={[
                  styles.executionOption,
                  executionMode === 'auto' && styles.executionOptionActive,
                ]}
                onPress={() => setExecutionMode('auto')}
              >
                <View
                  style={[
                    styles.executionIconContainer,
                    executionMode === 'auto' &&
                      styles.executionIconContainerActive,
                  ]}
                >
                  <SparkleIcon
                    size={28}
                    color={
                      executionMode === 'auto'
                        ? theme.colors.text.primary
                        : theme.colors.text.secondary
                    }
                    weight={executionMode === 'auto' ? 'fill' : 'regular'}
                  />
                </View>
                <Text
                  style={[
                    styles.executionTitle,
                    executionMode === 'auto' && styles.executionTitleActive,
                  ]}
                >
                  Auto-Post
                </Text>
                <Text style={styles.executionSubtitle}>Khud ba khud</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <ActionButton
            title="Set Recurring Entry"
            onPress={handleSave}
            variant="primary"
          />
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: theme.spacing.xs,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    helpButton: {
      padding: theme.spacing.xs,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    transactionCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    transactionInfo: {
      flex: 1,
    },
    transactionLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    transactionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xs,
    },
    transactionAmount: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
      marginTop: theme.spacing.xs,
    },
    transactionIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.md,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    frequencyContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    frequencyOption: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.sm,
    },
    frequencyOptionActive: {
      backgroundColor: theme.colors.background,
      ...theme.shadows.sm,
    },
    frequencyText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    frequencyTextActive: {
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    repeatUntilContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    repeatCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    repeatLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      letterSpacing: 0.5,
    },
    repeatValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xs,
    },
    executionContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    executionOption: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    executionOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}08`,
    },
    executionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    executionIconContainerActive: {
      backgroundColor: `${theme.colors.primary}15`,
    },
    executionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    executionTitleActive: {
      color: theme.colors.text.primary,
    },
    executionSubtitle: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    footer: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
  });

export default RecurringEntryModal;

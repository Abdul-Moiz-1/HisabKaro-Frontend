import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import {
  XIcon,
  CalendarIcon,
  BellIcon,
  SparkleIcon,
  QuestionIcon,
  FileTextIcon,
  ClockIcon,
  RepeatIcon,
} from 'phosphor-react-native';
import { useTheme } from '../../../../../store/hooks';
import ActionButton from '../../../../../components/common/ActionButton';
import { DateField } from '../../../../../components/DynamicForm';
import { FieldType } from '../../../../../types/forms';
import {
  RecurringOptionsFormValues,
  FrequencyType,
  defaultRecurringOptions,
} from '../../schema';

interface RecurringEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: RecurringOptionsFormValues) => void;
  entryTitle?: string;
  entryAmount?: number;
  initialSettings?: RecurringOptionsFormValues;
}

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string; urdu: string }[] = [
  { value: 'daily', label: 'Daily', urdu: 'Rozana' },
  { value: 'weekly', label: 'Weekly', urdu: 'Hafta War' },
  { value: 'monthly', label: 'Monthly', urdu: 'Mahana' },
  { value: 'quarterly', label: 'Quarterly', urdu: 'Teen Mah' },
  { value: 'yearly', label: 'Yearly', urdu: 'Salana' },
];

const DAY_OF_MONTH_OPTIONS = Array.from({ length: 28 }, (_, i) => i + 1);

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
  const [entryName, setEntryName] = useState(initialSettings?.entryName || '');
  const [description, setDescription] = useState(initialSettings?.description || '');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    initialSettings?.frequencyType || 'monthly'
  );
  const [frequencyInterval, setFrequencyInterval] = useState(
    initialSettings?.frequencyInterval || 1
  );
  const [dayOfMonth, setDayOfMonth] = useState(initialSettings?.dayOfMonth || 1);
  const [startDate, setStartDate] = useState(
    initialSettings?.startDate || new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(initialSettings?.endDate || '');
  const [autoGenerate, setAutoGenerate] = useState(initialSettings?.autoGenerate || false);
  const [autoPost, setAutoPost] = useState(initialSettings?.autoPost || false);
  const [generateDaysBefore, setGenerateDaysBefore] = useState(
    initialSettings?.generateDaysBefore || 0
  );

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      if (initialSettings) {
        setEntryName(initialSettings.entryName);
        setDescription(initialSettings.description || '');
        setFrequencyType(initialSettings.frequencyType);
        setFrequencyInterval(initialSettings.frequencyInterval);
        setDayOfMonth(initialSettings.dayOfMonth || 1);
        setStartDate(initialSettings.startDate);
        setEndDate(initialSettings.endDate || '');
        setAutoGenerate(initialSettings.autoGenerate);
        setAutoPost(initialSettings.autoPost);
        setGenerateDaysBefore(initialSettings.generateDaysBefore);
      } else {
        setEntryName(entryTitle);
        setDescription('');
        setFrequencyType('monthly');
        setFrequencyInterval(1);
        setDayOfMonth(1);
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate('');
        setAutoGenerate(false);
        setAutoPost(false);
        setGenerateDaysBefore(0);
      }
    }
  }, [visible, initialSettings, entryTitle]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
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
    const settings: RecurringOptionsFormValues = {
      entryName: entryName || entryTitle,
      description,
      frequencyType,
      frequencyInterval,
      dayOfMonth: frequencyType === 'monthly' || frequencyType === 'yearly' ? dayOfMonth : undefined,
      startDate,
      endDate: endDate || undefined,
      autoGenerate,
      autoPost,
      generateDaysBefore,
    };
    onSave(settings);
  }, [
    entryName,
    entryTitle,
    description,
    frequencyType,
    frequencyInterval,
    dayOfMonth,
    startDate,
    endDate,
    autoGenerate,
    autoPost,
    generateDaysBefore,
    onSave,
  ]);

  const isFormValid = entryName.trim().length > 0 && startDate.length > 0;

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
          keyboardShouldPersistTaps="handled"
        >
          {/* Entry Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Entry Name / Naam</Text>
            <TextInput
              style={styles.textInput}
              value={entryName}
              onChangeText={setEntryName}
              placeholder="e.g., Monthly Rent Payment"
              placeholderTextColor={theme.colors.text.secondary}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description / Wazehat (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add description for this recurring entry"
              placeholderTextColor={theme.colors.text.secondary}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Amount Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount / Raqam</Text>
            <View style={styles.amountCard}>
              <View style={styles.amountInfo}>
                <Text style={styles.amountLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.amountValue}>{formatCurrency(entryAmount)}</Text>
              </View>
              <View style={styles.amountIcon}>
                <FileTextIcon size={32} color={theme.colors.primary} weight="fill" />
              </View>
            </View>
          </View>

          {/* Frequency Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequency / Kab Kab?</Text>
            <View style={styles.frequencyContainer}>
              {FREQUENCY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.frequencyOption,
                    frequencyType === option.value && styles.frequencyOptionActive,
                  ]}
                  onPress={() => setFrequencyType(option.value)}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      frequencyType === option.value && styles.frequencyTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Frequency Interval */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Repeat Every / Har Kitne?</Text>
            <View style={styles.intervalContainer}>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => setFrequencyInterval(Math.max(1, frequencyInterval - 1))}
              >
                <Text style={styles.intervalButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.intervalValue}>
                <Text style={styles.intervalNumber}>{frequencyInterval}</Text>
                <Text style={styles.intervalLabel}>
                  {frequencyType === 'daily' ? 'Day(s)' :
                   frequencyType === 'weekly' ? 'Week(s)' :
                   frequencyType === 'monthly' ? 'Month(s)' :
                   frequencyType === 'quarterly' ? 'Quarter(s)' : 'Year(s)'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.intervalButton}
                onPress={() => setFrequencyInterval(Math.min(99, frequencyInterval + 1))}
              >
                <Text style={styles.intervalButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Day of Month (for monthly/yearly) */}
          {(frequencyType === 'monthly' || frequencyType === 'yearly') && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Day of Month / Mahine Ka Din</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayOfMonthContainer}
              >
                {DAY_OF_MONTH_OPTIONS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayOption,
                      dayOfMonth === day && styles.dayOptionActive,
                    ]}
                    onPress={() => setDayOfMonth(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        dayOfMonth === day && styles.dayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Start Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Date / Shuru Tareekh</Text>
            <DateField
              field={{
                id: 'startDate',
                label: '',
                name: 'startDate',
                type: FieldType.DATE,
              }}
              value={startDate}
              onChange={setStartDate}
              onBlur={() => {}}
            />
          </View>

          {/* End Date */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>End Date / Khatam Tareekh (Optional)</Text>
            <DateField
              field={{
                id: 'endDate',
                label: '',
                name: 'endDate',
                type: FieldType.DATE,
              }}
              value={endDate}
              onChange={setEndDate}
              onBlur={() => {}}
            />
            {!endDate && (
              <Text style={styles.helperText}>Leave empty for no end date</Text>
            )}
          </View>

          {/* Automation Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Automation / Khud Ba Khud</Text>
            
            {/* Auto Generate */}
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <View style={styles.switchIconContainer}>
                  <ClockIcon size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.switchLabel}>Auto Generate</Text>
                  <Text style={styles.switchDescription}>
                    Automatically create entry before due date
                  </Text>
                </View>
              </View>
              <Switch
                value={autoGenerate}
                onValueChange={setAutoGenerate}
                trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}50` }}
                thumbColor={autoGenerate ? theme.colors.primary : theme.colors.surface}
              />
            </View>

            {/* Generate Days Before */}
            {autoGenerate && (
              <View style={styles.daysBeforeContainer}>
                <Text style={styles.daysBeforeLabel}>Generate</Text>
                <TextInput
                  style={styles.daysBeforeInput}
                  value={generateDaysBefore.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 0;
                    setGenerateDaysBefore(Math.max(0, Math.min(30, num)));
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.daysBeforeLabel}>days before due date</Text>
              </View>
            )}

            {/* Auto Post */}
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <View style={styles.switchIconContainer}>
                  <SparkleIcon size={20} color={theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.switchLabel}>Auto Post</Text>
                  <Text style={styles.switchDescription}>
                    Automatically post entry without review
                  </Text>
                </View>
              </View>
              <Switch
                value={autoPost}
                onValueChange={(value) => {
                  setAutoPost(value);
                  if (value) setAutoGenerate(true);
                }}
                trackColor={{ false: theme.colors.border, true: `${theme.colors.primary}50` }}
                thumbColor={autoPost ? theme.colors.primary : theme.colors.surface}
              />
            </View>

            {autoPost && (
              <View style={styles.warningBanner}>
                <BellIcon size={16} color={theme.colors.warning} />
                <Text style={styles.warningText}>
                  Entries will be posted automatically. You can still review in the journal.
                </Text>
              </View>
            )}
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary / Khulasa</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <RepeatIcon size={16} color={theme.colors.text.secondary} />
                <Text style={styles.summaryText}>
                  Repeats every {frequencyInterval}{' '}
                  {frequencyType === 'daily' ? 'day(s)' :
                   frequencyType === 'weekly' ? 'week(s)' :
                   frequencyType === 'monthly' ? 'month(s)' :
                   frequencyType === 'quarterly' ? 'quarter(s)' : 'year(s)'}
                  {(frequencyType === 'monthly' || frequencyType === 'yearly') && 
                    ` on day ${dayOfMonth}`}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <CalendarIcon size={16} color={theme.colors.text.secondary} />
                <Text style={styles.summaryText}>
                  Starting {formatDate(startDate)}
                  {endDate ? ` until ${formatDate(endDate)}` : ' (no end date)'}
                </Text>
              </View>
              {autoGenerate && (
                <View style={styles.summaryRow}>
                  <ClockIcon size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.summaryText}>
                    Auto-generates {generateDaysBefore} days before
                  </Text>
                </View>
              )}
              {autoPost && (
                <View style={styles.summaryRow}>
                  <SparkleIcon size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.summaryText}>Auto-posts without review</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <ActionButton
            title="Set Recurring Entry"
            onPress={handleSave}
            variant="primary"
            disabled={!isFormValid}
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
      paddingBottom: theme.spacing.xxl,
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
    textInput: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      minHeight: 70,
      textAlignVertical: 'top',
    },
    amountCard: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    amountInfo: {
      flex: 1,
    },
    amountLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.5,
    },
    amountValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.xs,
    },
    amountIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.md,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    frequencyContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    frequencyOption: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    frequencyOptionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    frequencyText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    frequencyTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    intervalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    intervalButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    intervalButtonText: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    intervalValue: {
      flex: 1,
      alignItems: 'center',
    },
    intervalNumber: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    intervalLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    dayOfMonthContainer: {
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    dayOption: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dayOptionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dayText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
    },
    dayTextActive: {
      color: '#FFFFFF',
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
      fontStyle: 'italic',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    switchInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.sm,
    },
    switchIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    switchLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    switchDescription: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    daysBeforeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    daysBeforeLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    daysBeforeInput: {
      width: 50,
      height: 40,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.sm,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${theme.colors.warning}15`,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: theme.colors.warning,
    },
    summaryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    summaryText: {
      fontSize: 13,
      color: theme.colors.text.primary,
      flex: 1,
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

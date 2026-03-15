import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CalendarBlank, X } from 'phosphor-react-native';
import { useTheme } from '../../../store/hooks';

interface CustomDateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (fromDate: string, toDate: string) => void;
  initialFromDate?: string;
  initialToDate?: string;
}

const CustomDateRangeModal: React.FC<CustomDateRangeModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFromDate,
  initialToDate,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [fromDate, setFromDate] = useState<Date>(
    initialFromDate ? new Date(initialFromDate) : new Date(),
  );
  const [toDate, setToDate] = useState<Date>(
    initialToDate ? new Date(initialToDate) : new Date(),
  );
  const [activePicker, setActivePicker] = useState<'from' | 'to' | null>(null);

  const resetAndOpen = useCallback(() => {
    if (initialFromDate) setFromDate(new Date(initialFromDate));
    if (initialToDate) setToDate(new Date(initialToDate));
    setActivePicker(null);
  }, [initialFromDate, initialToDate]);

  React.useEffect(() => {
    if (visible) resetAndOpen();
  }, [visible, resetAndOpen]);

  const formatDisplayDate = (date: Date) =>
    date.toLocaleDateString('en-PK', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const toISODate = (date: Date) => date.toISOString().split('T')[0];

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      setActivePicker(null);
    }

    if (event.type === 'dismissed') {
      setActivePicker(null);
      return;
    }

    if (!selectedDate) return;

    if (activePicker === 'from') {
      setFromDate(selectedDate);
      if (selectedDate > toDate) {
        setToDate(selectedDate);
      }
    } else if (activePicker === 'to') {
      setToDate(selectedDate);
      if (selectedDate < fromDate) {
        setFromDate(selectedDate);
      }
    }

    if (Platform.OS === 'android') {
      setActivePicker(null);
    }
  };

  const handleApply = () => {
    onApply(toISODate(fromDate), toISODate(toDate));
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={e => e.stopPropagation()}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Date Range</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* From Date */}
          <TouchableOpacity
            style={[
              styles.dateField,
              activePicker === 'from' && styles.dateFieldActive,
            ]}
            onPress={() => setActivePicker('from')}>
            <CalendarBlank size={20} color={theme.colors.primary} />
            <View style={styles.dateFieldContent}>
              <Text style={styles.dateFieldLabel}>From Date</Text>
              <Text style={styles.dateFieldValue}>
                {formatDisplayDate(fromDate)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* To Date */}
          <TouchableOpacity
            style={[
              styles.dateField,
              activePicker === 'to' && styles.dateFieldActive,
            ]}
            onPress={() => setActivePicker('to')}>
            <CalendarBlank size={20} color={theme.colors.primary} />
            <View style={styles.dateFieldContent}>
              <Text style={styles.dateFieldLabel}>To Date</Text>
              <Text style={styles.dateFieldValue}>
                {formatDisplayDate(toDate)}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Inline Picker (iOS) or triggered picker (Android) */}
          {activePicker !== null && (
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={activePicker === 'from' ? fromDate : toDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                themeVariant="light"
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.donePickerButton}
                  onPress={() => setActivePicker(null)}>
                  <Text style={styles.donePickerText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}>
            <Text style={styles.applyButtonText}>Apply Range</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl + 20,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateField: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    dateFieldActive: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}08`,
    },
    dateFieldContent: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    dateFieldLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      letterSpacing: 0.3,
    },
    dateFieldValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 2,
    },
    pickerContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      marginVertical: theme.spacing.sm,
      overflow: 'hidden',
    },
    donePickerButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    donePickerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });

export default CustomDateRangeModal;

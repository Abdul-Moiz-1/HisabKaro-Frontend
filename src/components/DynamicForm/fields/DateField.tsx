// components/DynamicForm/fields/DateField.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FormField } from '../../../types/forms';
import { Theme } from '../../../theme/types';
import { useThemedStyles } from '../../../theme';

interface DateFieldProps {
  field: FormField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const DateField: React.FC<DateFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);
  const [show, setShow] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate.toISOString());
      onBlur();
    }
  };

  const quickDateButtons = [
    {
      label: 'Today',
      getValue: () => new Date().toISOString(),
    },
    {
      label: 'Yesterday',
      getValue: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString();
      },
    },
  ];

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View style={styles.quickButtons}>
        {quickDateButtons.map(btn => (
          <TouchableOpacity
            key={btn.label}
            style={[
              styles.quickButton,
              value === btn.getValue() && styles.quickButtonSelected,
            ]}
            onPress={() => {
              onChange(btn.getValue());
              onBlur();
            }}
          >
            <Text
              style={[
                styles.quickButtonText,
                value === btn.getValue() && styles.quickButtonTextSelected,
              ]}
            >
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => setShow(true)}
        >
          <Text style={styles.quickButtonText}>Pick date</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.dateDisplay, error && styles.dateDisplayError]}
        onPress={() => setShow(true)}
      >
        <Text style={styles.dateIcon}>📅</Text>
        <Text style={styles.dateText}>
          {value ? formatDate(value) : field.placeholder || 'Select date'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontWeight: '500' as const,
  },
  required: {
    color: theme.colors.error,
  },
  quickButtons: {
    flexDirection: 'row' as const,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  quickButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
  },
  quickButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  quickButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    fontWeight: '600' as const,
  },
  quickButtonTextSelected: {
    color: theme.colors.text.inverse,
  },
  dateDisplay: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  dateDisplayError: {
    borderColor: theme.colors.error,
  },
  dateIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  dateText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default DateField;

// components/DynamicForm/fields/DropdownField.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { FormField } from '../../../types/forms';
import { Theme } from '../../../constants/theme';
import { useThemedStyles } from '../../../theme';

interface DropdownFieldProps {
  field: FormField;
  value: any;
  error?: string;
  onChange: (value: any) => void;
  onBlur: () => void;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  field,
  value,
  error,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = field.options?.find(opt => opt.value === value);

  const handleSelect = (optionValue: any) => {
    onChange(optionValue);
    setIsOpen(false);
    onBlur();
  };

  return (
    <View style={styles.container}>
      {field.label && (
        <Text style={styles.label}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[styles.dropdown, error && styles.dropdownError]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
        disabled={field.disabled}
      >
        {field.icon && <Text style={styles.icon}>{field.icon}</Text>}

        <Text
          style={[styles.dropdownText, !selectedOption && styles.placeholder]}
        >
          {selectedOption?.label || field.placeholder || 'Select an option'}
        </Text>

        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {field.label || 'Select Option'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={field.options || []}
              keyExtractor={item => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                    item.disabled && styles.optionDisabled,
                  ]}
                  onPress={() => !item.disabled && handleSelect(item.value)}
                  disabled={item.disabled}
                >
                  {item.icon && (
                    <Text style={styles.optionIcon}>{item.icon}</Text>
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
  dropdown: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  dropdownError: {
    borderColor: theme.colors.error,
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  dropdownText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  placeholder: {
    color: theme.colors.text.disabled,
  },
  arrow: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)' as const,
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%' as const,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: theme.colors.text.secondary,
  },
  option: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  optionSelected: {
    backgroundColor: theme.colors.primary + '10',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  optionText: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600' as const,
  },
  checkmark: {
    fontSize: 20,
    color: theme.colors.primary,
  },
});

export default DropdownField;

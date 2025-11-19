// components/DynamicForm/DynamicForm.tsx
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FormConfig } from '../../types/forms';
import { useDynamicForm } from '../../hooks/useDynamicForm';
import { Theme } from '../../constants/theme';
import DynamicFormField from './DynamicFormField';
import { useThemedStyles } from '../../theme';

interface DynamicFormProps {
  config: FormConfig;
  initialData?: any;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  config,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const styles = useThemedStyles(createStyles);
  const { formData, errors, touched, handleChange, handleBlur, handleSubmit } =
    useDynamicForm(
      {
        ...config,
        onSubmit: onSubmit || config.onSubmit,
        onCancel: onCancel || config.onCancel,
      },
      initialData,
    );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {config.subtitle && (
          <Text style={styles.subtitle}>{config.subtitle}</Text>
        )}

        {config.sections.map(section => {
          // Check if section should be shown
          if (section.showWhen && !section.showWhen(formData)) {
            return null;
          }

          return (
            <View key={section.id} style={styles.section}>
              {section.title && (
                <View style={styles.sectionHeader}>
                  {section.icon && (
                    <Text style={styles.sectionIcon}>{section.icon}</Text>
                  )}
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
              )}

              {section.subtitle && (
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              )}

              {section.fields.map(field => {
                // Check if field should be shown
                if (field.showWhen && !field.showWhen(formData)) {
                  return null;
                }

                return (
                  <DynamicFormField
                    key={field.id}
                    field={field}
                    value={formData[field.id]}
                    error={errors[field.id]}
                    touched={touched[field.id]}
                    onChange={value => handleChange(field.id, value)}
                    onBlur={() => handleBlur(field.id)}
                  />
                );
              })}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {config.cancelButtonText && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => config.onCancel?.()}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>
              {config.cancelButtonText}
            </Text>
          </TouchableOpacity>
        )}

        {config.submitButtonText && (
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {config.submitButtonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center' as const,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row' as const,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.secondary,
  },
});

export default DynamicForm;

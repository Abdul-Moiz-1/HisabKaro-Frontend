// hooks/useDynamicForm.ts
import { useState, useCallback, useEffect } from 'react';
import {
  FormConfig,
  FormData,
  FormErrors,
  FormField,
  ValidationRule,
} from '../types/forms';

export const useDynamicForm = (config: FormConfig, initialData?: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Initialize default values
  useEffect(() => {
    const defaultValues: FormData = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultValues[field.id] = field.defaultValue;
        }
      });
    });
    setFormData(prev => ({ ...defaultValues, ...prev }));
  }, [config]);

  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
      if (!field.validations) return null;

      for (const rule of field.validations) {
        switch (rule.type) {
          case 'required':
            if (!value || (typeof value === 'string' && value.trim() === '')) {
              return rule.message;
            }
            break;

          case 'min':
            if (typeof value === 'number' && value < rule.value) {
              return rule.message;
            }
            if (typeof value === 'string' && value.length < rule.value) {
              return rule.message;
            }
            break;

          case 'max':
            if (typeof value === 'number' && value > rule.value) {
              return rule.message;
            }
            if (typeof value === 'string' && value.length > rule.value) {
              return rule.message;
            }
            break;

          case 'pattern':
            if (value && !rule.value.test(value)) {
              return rule.message;
            }
            break;

          case 'custom':
            if (rule.validator && !rule.validator(value, formData)) {
              return rule.message;
            }
            break;
        }
      }

      return null;
    },
    [formData],
  );

  const handleChange = useCallback(
    (fieldId: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        [fieldId]: value,
      }));

      // Clear error when user starts typing
      if (errors[fieldId]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldId];
          return newErrors;
        });
      }
    },
    [errors],
  );

  const handleBlur = useCallback(
    (fieldId: string) => {
      setTouched(prev => ({ ...prev, [fieldId]: true }));

      // Find field configuration
      const field = config.sections
        .flatMap(s => s.fields)
        .find(f => f.id === fieldId);

      if (field) {
        const error = validateField(field, formData[fieldId]);
        if (error) {
          setErrors(prev => ({ ...prev, [fieldId]: error }));
        }
      }
    },
    [config, formData, validateField],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    config.sections.forEach(section => {
      // Check if section should be shown
      if (section.showWhen && !section.showWhen(formData)) {
        return;
      }

      section.fields.forEach(field => {
        // Check if field should be shown
        if (field.showWhen && !field.showWhen(formData)) {
          return;
        }

        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  }, [config, formData, validateField]);

  const handleSubmit = useCallback(() => {
    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        allTouched[field.id] = true;
      });
    });
    setTouched(allTouched);

    // Validate
    if (validateForm()) {
      config.onSubmit?.(formData);
      return true;
    }
    return false;
  }, [config, formData, validateForm]);

  const reset = useCallback(() => {
    setFormData({});
    setErrors({});
    setTouched({});
  }, []);

  const setFieldValue = useCallback(
    (fieldId: string, value: any) => {
      handleChange(fieldId, value);
    },
    [handleChange],
  );

  const setFieldError = useCallback((fieldId: string, error: string) => {
    setErrors(prev => ({ ...prev, [fieldId]: error }));
  }, []);

  return {
    formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    reset,
    setFieldValue,
    setFieldError,
  };
};

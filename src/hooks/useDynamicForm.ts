// hooks/useDynamicForm.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { FormConfig, FormData, FormErrors, FormField } from '../types/forms';

export const useDynamicForm = (config: FormConfig, initialData?: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize default values to prevent recreation on every render
  const defaultValues = useMemo(() => {
    const defaults: FormData = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
    });
    return defaults;
  }, [config.sections]);

  // Initialize default values only once
  useEffect(() => {
    if (!isInitialized) {
      setFormData(prev => ({ ...defaultValues, ...prev }));
      setIsInitialized(true);
    }
  }, [defaultValues, isInitialized]);

  // Rest of the hook remains the same...
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

          case 'pattern': {
            const cleaned = rule.value.replace(/\s+/g, '');
            const regex = new RegExp(cleaned);

            if (value && !regex.test(value)) {
              return rule.message;
            }
            break;
          }

          case 'custom': {
            if (rule.validator) {
              const validatorFn = new Function('formData', rule.validator);
              if (!validatorFn(formData)) return rule.message;
            }
            break;
          }
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
    [config.sections, formData, validateField],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    config.sections.forEach(section => {
      if (section.showWhen && !section.showWhen(formData)) {
        return;
      }

      section.fields.forEach(field => {
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
  }, [config.sections, formData, validateField]);

  const handleSubmit = useCallback(() => {
    const allTouched: { [key: string]: boolean } = {};
    config.sections.forEach(section => {
      section.fields.forEach(field => {
        allTouched[field.id] = true;
      });
    });
    setTouched(allTouched);

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
    setIsInitialized(false);
  }, []);

  const setFieldValue = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);

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

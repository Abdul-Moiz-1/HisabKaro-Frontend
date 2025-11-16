// hooks/useFormConfig.ts
import { useState, useEffect } from 'react';
import { FormConfig } from '../types/forms';
import { FormService } from '../services/formService';

/**
 * Custom hook to load form configuration from API
 */
export const useFormConfig = (
  formId: string,
  optionsEndpoints?: { [fieldId: string]: string },
) => {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadFormConfig();
  }, [formId]);

  const loadFormConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const config = optionsEndpoints
        ? await FormService.getFormConfigWithOptions(formId, optionsEndpoints)
        : await FormService.getFormConfig(formId);

      setFormConfig(config);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading form config:', err);
    } finally {
      setLoading(false);
    }
  };

  const reload = () => {
    loadFormConfig();
  };

  return {
    formConfig,
    loading,
    error,
    reload,
  };
};

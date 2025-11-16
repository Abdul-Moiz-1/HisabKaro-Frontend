// services/formService.ts
import { FormConfig } from '../types/forms';

/**
 * Service for loading dynamic forms from API
 */
export class FormService {
  private static baseUrl = 'YOUR_API_BASE_URL';

  /**
   * Fetch form configuration from API
   */
  static async getFormConfig(formId: string): Promise<FormConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/forms/${formId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch form: ${response.statusText}`);
      }

      const formConfig: FormConfig = await response.json();
      return formConfig;
    } catch (error) {
      console.error('Error fetching form config:', error);
      throw error;
    }
  }

  /**
   * Fetch form configuration with field options populated from API
   */
  static async getFormConfigWithOptions(
    formId: string,
    optionsEndpoints?: { [fieldId: string]: string },
  ): Promise<FormConfig> {
    try {
      const formConfig = await this.getFormConfig(formId);

      // Populate options for fields that have API endpoints
      if (optionsEndpoints) {
        for (const section of formConfig.sections) {
          for (const field of section.fields) {
            if (optionsEndpoints[field.id]) {
              const options = await this.fetchFieldOptions(
                optionsEndpoints[field.id],
              );
              field.options = options;
            }
          }
        }
      }

      return formConfig;
    } catch (error) {
      console.error('Error fetching form config with options:', error);
      throw error;
    }
  }

  /**
   * Fetch options for a specific field
   */
  static async fetchFieldOptions(endpoint: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch options: ${response.statusText}`);
      }

      const options = await response.json();
      return options;
    } catch (error) {
      console.error('Error fetching field options:', error);
      throw error;
    }
  }

  /**
   * Submit form data to API
   */
  static async submitForm(formId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/forms/${formId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit form: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
      throw error;
    }
  }
}

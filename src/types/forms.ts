// types/form.types.ts
export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  DROPDOWN = 'DROPDOWN',
  DATE = 'DATE',
  TEXTAREA = 'TEXTAREA',
  SEARCH = 'SEARCH',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  AMOUNT = 'AMOUNT',
  FILE = 'FILE',
}

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any, formData?: any) => boolean;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  defaultValue?: any;
  required?: boolean;
  disabled?: boolean;
  validations?: ValidationRule[];
  options?: DropdownOption[]; // For dropdown, radio, checkbox
  icon?: string;
  prefix?: string; // e.g., "+92" for phone
  suffix?: string; // e.g., "PKR" for amount
  hint?: string;
  maxLength?: number;
  minLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  dependsOn?: string; // Field ID that this field depends on
  showWhen?: (formData: any) => boolean; // Conditional visibility
  format?: (value: any) => string; // Custom formatting
  parse?: (value: string) => any; // Custom parsing
}

export interface FormSection {
  id: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  fields: FormField[];
  showWhen?: (formData: any) => boolean;
}

export interface FormConfig {
  id: string;
  title: string;
  subtitle?: string;
  sections: FormSection[];
  submitButtonText?: string;
  cancelButtonText?: string;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export interface FormErrors {
  [fieldId: string]: string;
}

export interface FormData {
  [fieldId: string]: any;
}

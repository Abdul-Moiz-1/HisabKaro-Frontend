// components/DynamicForm/DynamicFormField.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormField, FieldType } from '../../types/forms';

import { Theme } from '../../constants/theme';

import { useThemedStyles } from '../../theme';
import {
  AmountInputField,
  CheckboxField,
  DateField,
  DropdownField,
  EmailInputField,
  FileUploadField,
  NumberInputField,
  PhoneInputField,
  RadioField,
  SearchField,
  TextAreaField,
  TextInputField,
} from './fields';

interface DynamicFormFieldProps {
  field: FormField;
  value: any;
  error?: string;
  touched?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  error,
  touched,
  onChange,
  onBlur,
}) => {
  const styles = useThemedStyles(createStyles);

  const renderField = () => {
    const commonProps = {
      field,
      value,
      error: touched ? error : undefined,
      onChange,
      onBlur,
    };

    switch (field.type) {
      case FieldType.TEXT:
        return <TextInputField {...commonProps} />;

      case FieldType.NUMBER:
        return <NumberInputField {...commonProps} />;

      case FieldType.EMAIL:
        return <EmailInputField {...commonProps} />;

      case FieldType.PHONE:
        return <PhoneInputField {...commonProps} />;

      case FieldType.DROPDOWN:
        return <DropdownField {...commonProps} />;

      case FieldType.DATE:
        return <DateField {...commonProps} />;

      case FieldType.TEXTAREA:
        return <TextAreaField {...commonProps} />;

      case FieldType.SEARCH:
        return <SearchField {...commonProps} />;

      case FieldType.CHECKBOX:
        return <CheckboxField {...commonProps} />;

      case FieldType.RADIO:
        return <RadioField {...commonProps} />;

      case FieldType.AMOUNT:
        return <AmountInputField {...commonProps} />;

      case FieldType.FILE:
        return <FileUploadField {...commonProps} />;

      default:
        return <Text>Unsupported field type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderField()}
      {field.hint && !error && <Text style={styles.hint}>{field.hint}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  hint: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

export default DynamicFormField;

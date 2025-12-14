// config/forms/bankSelection.config.ts
import { FormConfig, FieldType } from '../../types/forms';

export const bankSelectionConfig: FormConfig = {
  id: 'bank-selection',
  title: 'Which bank account?',
  sections: [
    {
      id: 'bank-section',
      fields: [
        {
          id: 'bankAccount',
          name: 'bankAccount',
          label: '',
          type: FieldType.RADIO,
          required: true,
          options: [], // Will be populated from API
        },
      ],
    },
    {
      id: 'date-section',
      title: 'When did money arrive?',
      fields: [
        {
          id: 'transferDate',
          name: 'transferDate',
          label: '',
          type: FieldType.DATE,
          defaultValue: new Date().toISOString(),
          required: true,
          validations: [
            {
              type: 'custom',
              message: 'Date cannot be in future',
              validator: (value: string) => new Date(value) <= new Date(),
            },
          ],
        },
      ],
    },
  ],
};

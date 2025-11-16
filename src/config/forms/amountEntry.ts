// config/forms/amountEntry.config.ts
import { FormConfig, FieldType } from '../../types/forms';

export const getAmountEntryConfig = (
  customerName: string,
  outstanding: number,
): FormConfig => ({
  id: 'amount-entry',
  title: `How much did ${customerName} pay?`,
  subtitle: `${customerName} owes you: PKR ${outstanding.toLocaleString()}`,
  sections: [
    {
      id: 'amount-section',
      fields: [
        {
          id: 'amount',
          name: 'amount',
          label: '',
          type: FieldType.AMOUNT,
          placeholder: '0',
          required: true,
          validations: [
            {
              type: 'required',
              message: 'Amount is required',
            },
            {
              type: 'min',
              value: 0.01,
              message: 'Amount must be greater than 0',
            },
            {
              type: 'max',
              value: 99999999.99,
              message: 'Amount too large',
            },
            {
              type: 'custom',
              message: 'Amount exceeds outstanding. Excess will be advance.',
              validator: (value: number) => value <= outstanding * 1.1,
            },
          ],
        },
      ],
    },
  ],
});

import { FormConfig, FieldType } from '../../types/forms';

export const paymentMethodConfig: FormConfig = {
  id: 'payment-method',
  title: 'How did customer pay?',
  sections: [
    {
      id: 'method-section',
      fields: [
        {
          id: 'paymentMethod',
          name: 'paymentMethod',
          label: '',
          type: FieldType.RADIO,
          required: true,
          options: [
            {
              label: 'Cash',
              value: 'cash',
              icon: '💵',
            },
            {
              label: 'Bank Transfer',
              value: 'bank',
              icon: '🏦',
            },
            {
              label: 'Mobile Wallet',
              value: 'wallet',
              icon: '📱',
            },
            {
              label: 'Cheque',
              value: 'cheque',
              icon: '📝',
            },
            {
              label: 'Card/POS',
              value: 'card',
              icon: '💳',
            },
          ],
        },
      ],
    },
  ],
};

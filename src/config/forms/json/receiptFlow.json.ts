export const receiptFlowJSON = {
  flow: {
    id: 'receipt-flow',
    name: 'Customer Payment Receipt Flow',
    startScreen: 'customer-selection',
    screens: [
      {
        id: 'customer-selection',
        screenId: 'RCPT-001',
        route: '/receipt/select-customer',
        type: 'LIST_WITH_SEARCH',
        title: 'Customer paid me',
        config: {
          question: 'Who paid you?',
          searchPlaceholder: '🔍 Search customer name...',
          sectionHeader: 'Customers with pending payments:',
          addNewButtonText: '+ Add new customer',
          listConfig: {
            apiEndpoint: '/api/customers?hasPendingPayments=true',
            sortBy: 'dueDate',
            sortOrder: 'asc',
            colorCoding: {
              field: 'dueDate',
              rules: [
                {
                  condition: 'overdue',
                  color: '#FF3B30',
                  indicator: '🔴',
                  label: 'Overdue',
                },
                {
                  condition: 'dueSoon',
                  days: 7,
                  color: '#FF9500',
                  indicator: '🟡',
                  label: 'Due soon',
                },
                {
                  condition: 'notDue',
                  color: '#34C759',
                  indicator: '🟢',
                  label: 'Not due',
                },
              ],
            },
            itemTemplate: {
              fields: [
                {
                  id: 'name',
                  type: 'text',
                  style: 'title',
                },
                {
                  id: 'outstanding',
                  type: 'currency',
                  prefix: 'PKR',
                  style: 'amount',
                },
                {
                  id: 'dueDate',
                  type: 'date',
                  format: 'MMM DD, YYYY',
                  prefix: 'Due:',
                  style: 'caption',
                },
              ],
            },
          },
          actions: {
            onItemSelect: {
              navigate: 'amount-entry',
              params: ['customer'],
            },
            onAddNew: {
              navigate: 'add-customer',
            },
          },
        },
      },
      {
        id: 'add-customer',
        screenId: 'CUST-001',
        route: '/customer/add',
        type: 'FORM',
        title: 'Add Customer',
        config: {
          formId: 'add-customer-form',
          submitButtonText: '✓ Save Customer',
          cancelButtonText: 'Cancel',
          sections: [
            {
              id: 'basic-info',
              title: 'Basic Information',
              icon: '👤',
              fields: [
                {
                  id: 'name',
                  name: 'name',
                  label: 'Customer Name',
                  type: 'TEXT',
                  placeholder: 'Enter customer name',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Customer name is required',
                    },
                    {
                      type: 'min',
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                    {
                      type: 'max',
                      value: 100,
                      message: 'Name must not exceed 100 characters',
                    },
                  ],
                },
                {
                  id: 'phone',
                  name: 'phone',
                  label: 'Phone Number',
                  type: 'PHONE',
                  placeholder: '3001234567',
                  prefix: '+92',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Phone number is required',
                    },
                    {
                      type: 'pattern',
                      value:
                        '^3[\r\n                                                0-9\r\n                                            ]{\r\n                                                9\r\n                                            }$',
                      message: 'Invalid phone number format (03XXXXXXXXX)',
                    },
                  ],
                },
                {
                  id: 'email',
                  name: 'email',
                  label: 'Email',
                  type: 'EMAIL',
                  placeholder: 'customer@example.com',
                  required: false,
                  validations: [
                    {
                      type: 'pattern',
                      value:
                        '^[^\\s@\r\n                                            ]+@[^\\s@\r\n                                            ]+\\.[^\\s@\r\n                                            ]+$',
                      message: 'Invalid email format',
                    },
                  ],
                },
                {
                  id: 'address',
                  name: 'address',
                  label: 'Address',
                  type: 'TEXTAREA',
                  placeholder: 'Enter customer address',
                  multiline: true,
                  numberOfLines: 3,
                  required: false,
                },
              ],
            },
            {
              id: 'credit-info',
              title: 'Credit Terms',
              icon: '💳',
              fields: [
                {
                  id: 'openingBalance',
                  name: 'openingBalance',
                  label: 'Opening Balance',
                  type: 'AMOUNT',
                  placeholder: '0',
                  defaultValue: '0',
                  suffix: 'PKR',
                  required: false,
                  validations: [
                    {
                      type: 'min',
                      value: 0,
                      message: 'Opening balance cannot be negative',
                    },
                  ],
                },
                {
                  id: 'creditPeriod',
                  name: 'creditPeriod',
                  label: 'Credit Period',
                  type: 'DROPDOWN',
                  placeholder: 'Select credit period',
                  defaultValue: '30',
                  required: true,
                  options: [
                    {
                      label: 'Cash (0 days)',
                      value: '0',
                    },
                    {
                      label: '7 days',
                      value: '7',
                    },
                    {
                      label: '15 days',
                      value: '15',
                    },
                    {
                      label: '30 days',
                      value: '30',
                    },
                    {
                      label: '45 days',
                      value: '45',
                    },
                    {
                      label: '60 days',
                      value: '60',
                    },
                    {
                      label: '90 days',
                      value: '90',
                    },
                  ],
                },
                {
                  id: 'creditLimit',
                  name: 'creditLimit',
                  label: 'Credit Limit',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: 'PKR',
                  hint: 'Maximum credit allowed for this customer',
                  required: false,
                  validations: [
                    {
                      type: 'min',
                      value: 0,
                      message: 'Credit limit cannot be negative',
                    },
                  ],
                },
              ],
            },
          ],
          actions: {
            onSubmit: {
              apiEndpoint: '/api/customers',
              method: 'POST',
              onSuccess: {
                navigate: 'customer-selection',
                params: ['newCustomer'],
              },
            },
            onCancel: {
              navigate: 'customer-selection',
            },
          },
        },
      },
      {
        id: 'amount-entry',
        screenId: 'RCPT-002',
        route: '/receipt/amount',
        type: 'AMOUNT_INPUT',
        title: 'How much did {customerName} pay?',
        config: {
          displayInfo: {
            label: '{customerName} owes you:',
            field: 'outstanding',
            format: 'currency',
            prefix: 'PKR',
            style: 'bold',
          },
          amountField: {
            id: 'amount',
            name: 'amount',
            type: 'AMOUNT',
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
            ],
          },
          quickAmounts: [
            {
              id: 'full',
              label: 'Full {outstanding\r\n                            }',
              value: '{outstanding\r\n                            }',
              condition: 'always',
            },
            {
              id: 'half',
              label: 'Half {outstanding/2\r\n                            }',
              value: '{outstanding/2\r\n                            }',
              condition: 'always',
            },
            {
              id: '25k',
              label: '25k',
              value: '25000',
              condition: 'outstanding >= 25000',
            },
            {
              id: '10k',
              label: '10k',
              value: '10000',
              condition: 'outstanding >= 10000',
            },
            {
              id: '5k',
              label: '5k',
              value: '5000',
              condition: 'outstanding >= 5000',
            },
          ],
          realTimeCalculation: {
            field: 'remaining',
            formula:
              '{outstanding\r\n                        } - {amount\r\n                        }',
            label: 'Remaining:',
            colorRules: [
              {
                condition: 'value > 0',
                color: '#34C759',
                label: 'Still owed',
              },
              {
                condition: 'value === 0',
                color: '#007AFF',
                label: 'Fully paid',
              },
              {
                condition: 'value < 0',
                color: '#FF9500',
                label: 'Overpayment/Advance',
              },
            ],
          },
          warnings: [
            {
              condition: 'amount > outstanding * 1.1',
              icon: '⚠️',
              message: 'Amount exceeds outstanding. Excess will be advance.',
              style: 'warning',
            },
          ],
          actions: {
            onContinue: {
              navigate: 'payment-method',
              params: ['customer', 'amount', 'remaining'],
            },
          },
        },
      },
      {
        id: 'payment-method',
        screenId: 'RCPT-003',
        route: '/receipt/payment-method',
        type: 'SELECTION',
        title: 'How did {customerName} pay?',
        config: {
          selectionType: 'single',
          displayType: 'cards',
          field: {
            id: 'paymentMethod',
            name: 'paymentMethod',
            type: 'RADIO',
            required: true,
            options: [
              {
                value: 'cash',
                label: 'Cash',
                icon: '💵',
                description: 'Received in hand',
                navigateTo: 'confirmation',
              },
              {
                value: 'bank',
                label: 'Bank Transfer',
                icon: '🏦',
                description: 'Direct to your account',
                navigateTo: 'bank-selection',
              },
              {
                value: 'wallet',
                label: 'Mobile Wallet',
                icon: '📱',
                description: 'JazzCash, Easypaisa, etc.',
                navigateTo: 'wallet-selection',
              },
              {
                value: 'cheque',
                label: 'Cheque',
                icon: '📝',
                description: 'Post-dated or cleared',
                navigateTo: 'cheque-details',
              },
              {
                value: 'card',
                label: 'Card/POS',
                icon: '💳',
                description: 'Credit/Debit card payment',
                navigateTo: 'confirmation',
              },
            ],
          },
          actions: {
            onSelect: {
              navigate: '{option.navigateTo\r\n                            }',
              params: ['customer', 'amount', 'remaining', 'paymentMethod'],
            },
          },
        },
      },
      {
        id: 'bank-selection',
        screenId: 'RCPT-004',
        route: '/receipt/bank-selection',
        type: 'COMPOUND',
        title: 'Bank Transfer',
        config: {
          sections: [
            {
              id: 'bank-account-section',
              title: 'Which bank account?',
              type: 'LIST_SELECTION',
              field: {
                id: 'bankAccount',
                name: 'bankAccount',
                type: 'RADIO',
                required: true,
                apiEndpoint: '/api/bank-accounts',
                itemTemplate: {
                  fields: [
                    {
                      id: 'bankName',
                      type: 'text',
                      style: 'title',
                      icon: '🏦',
                    },
                    {
                      id: 'accountTitle',
                      type: 'text',
                      style: 'subtitle',
                    },
                    {
                      id: 'accountNumber',
                      type: 'text',
                      style: 'caption',
                      mask: '****{last4\r\n                                            }',
                    },
                    {
                      id: 'balance',
                      type: 'currency',
                      prefix: 'Balance: PKR',
                      style: 'amount',
                    },
                  ],
                },
              },
              addNewButton: {
                text: '+ Add bank account',
                navigate: 'add-bank-account',
              },
            },
            {
              id: 'date-section',
              title: 'When did money arrive?',
              type: 'DATE_SELECTION',
              field: {
                id: 'transferDate',
                name: 'transferDate',
                type: 'DATE',
                required: true,
                defaultValue: 'today',
                quickOptions: [
                  {
                    label: 'Today',
                    value: 'today',
                  },
                  {
                    label: 'Yesterday',
                    value: 'yesterday',
                  },
                  {
                    label: 'Pick date',
                    value: 'custom',
                  },
                  {
                    label: 'Pending',
                    value: null,
                    tooltip: "Select 'Pending' if not yet received in account",
                  },
                ],
                validations: [
                  {
                    type: 'custom',
                    message: 'Date cannot be in future',
                    // validator: 'date <= today',
                    validator: `const date = new Date(formData.chequeDate);
                      const today = new Date();
                      return date <= today;`,
                  },
                ],
              },
            },
          ],
          actions: {
            onComplete: {
              navigate: 'confirmation',
              params: [
                'customer',
                'amount',
                'remaining',
                'paymentMethod',
                'bankAccount',
                'transferDate',
              ],
            },
          },
        },
      },
      {
        id: 'add-bank-account',
        screenId: 'BANK-001',
        route: '/bank/add',
        type: 'FORM',
        title: 'Add Bank Account',
        config: {
          formId: 'add-bank-account-form',
          submitButtonText: '✓ Save Account',
          cancelButtonText: 'Cancel',
          sections: [
            {
              id: 'bank-details',
              fields: [
                {
                  id: 'bankName',
                  name: 'bankName',
                  label: 'Bank Name',
                  type: 'DROPDOWN',
                  placeholder: 'Select bank',
                  required: true,
                  apiEndpoint: '/api/banks/list',
                  validations: [
                    {
                      type: 'required',
                      message: 'Bank name is required',
                    },
                  ],
                },
                {
                  id: 'accountTitle',
                  name: 'accountTitle',
                  label: 'Account Title',
                  type: 'TEXT',
                  placeholder: 'Enter account title',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Account title is required',
                    },
                    {
                      type: 'min',
                      value: 3,
                      message: 'Account title must be at least 3 characters',
                    },
                  ],
                },
                {
                  id: 'accountNumber',
                  name: 'accountNumber',
                  label: 'Account Number',
                  type: 'NUMBER',
                  placeholder: 'Enter account number',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Account number is required',
                    },
                    {
                      type: 'min',
                      value: 10,
                      message: 'Account number must be at least 10 digits',
                    },
                    {
                      type: 'max',
                      value: 20,
                      message: 'Account number must not exceed 20 digits',
                    },
                  ],
                },
                {
                  id: 'accountType',
                  name: 'accountType',
                  label: 'Account Type',
                  type: 'DROPDOWN',
                  placeholder: 'Select account type',
                  required: true,
                  options: [
                    {
                      label: 'Current Account',
                      value: 'current',
                    },
                    {
                      label: 'Savings Account',
                      value: 'savings',
                    },
                    {
                      label: 'Other',
                      value: 'other',
                    },
                  ],
                  validations: [
                    {
                      type: 'required',
                      message: 'Account type is required',
                    },
                  ],
                },
                {
                  id: 'openingBalance',
                  name: 'openingBalance',
                  label: 'Opening Balance',
                  type: 'AMOUNT',
                  placeholder: '0',
                  defaultValue: '0',
                  suffix: 'PKR',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Opening balance is required',
                    },
                    {
                      type: 'min',
                      value: 0,
                      message: 'Opening balance cannot be negative',
                    },
                  ],
                },
                {
                  id: 'branchName',
                  name: 'branchName',
                  label: 'Branch Name/Code',
                  type: 'TEXT',
                  placeholder: 'Enter branch name or code',
                  required: false,
                },
              ],
            },
          ],
          actions: {
            onSubmit: {
              apiEndpoint: '/api/bank-accounts',
              method: 'POST',
              onSuccess: {
                navigate: 'bank-selection',
                params: ['newBankAccount'],
              },
            },
            onCancel: {
              navigate: 'bank-selection',
            },
          },
        },
      },
      {
        id: 'wallet-selection',
        screenId: 'RCPT-005',
        route: '/receipt/wallet-selection',
        type: 'COMPOUND',
        title: 'Mobile Wallet',
        config: {
          sections: [
            {
              id: 'wallet-type-section',
              title: 'Which wallet received payment?',
              type: 'SELECTION',
              field: {
                id: 'walletType',
                name: 'walletType',
                type: 'RADIO',
                required: true,
                options: [
                  {
                    value: 'jazzcash',
                    label: 'JazzCash',
                    icon: '📱',
                  },
                  {
                    value: 'easypaisa',
                    label: 'Easypaisa',
                    icon: '📱',
                  },
                  {
                    value: 'nayapay',
                    label: 'NayaPay',
                    icon: '📱',
                  },
                  {
                    value: 'sadapay',
                    label: 'SadaPay',
                    icon: '📱',
                  },
                  {
                    value: 'other',
                    label: 'Other',
                    icon: '📱',
                  },
                ],
              },
            },
            {
              id: 'wallet-custom-section',
              showWhen: 'walletType === "other"',
              fields: [
                {
                  id: 'customWalletName',
                  name: 'customWalletName',
                  label: 'Wallet Name',
                  type: 'TEXT',
                  placeholder: 'Enter wallet name',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Wallet name is required',
                    },
                  ],
                },
              ],
            },
            {
              id: 'wallet-account-section',
              fields: [
                {
                  id: 'walletAccount',
                  name: 'walletAccount',
                  label: 'Wallet Account Number/Phone',
                  type: 'TEXT',
                  placeholder: 'Enter wallet account or phone',
                  required: false,
                },
              ],
            },
            {
              id: 'wallet-date-section',
              title: 'When did you receive the payment?',
              type: 'DATE_SELECTION',
              field: {
                id: 'walletDate',
                name: 'walletDate',
                type: 'DATE',
                required: true,
                defaultValue: 'today',
                quickOptions: [
                  {
                    label: 'Today',
                    value: 'today',
                  },
                  {
                    label: 'Yesterday',
                    value: 'yesterday',
                  },
                  {
                    label: 'Pick date',
                    value: 'custom',
                  },
                ],
              },
            },
          ],
          actions: {
            onComplete: {
              navigate: 'confirmation',
              params: [
                'customer',
                'amount',
                'remaining',
                'paymentMethod',
                'walletType',
                'walletAccount',
                'walletDate',
              ],
            },
          },
        },
      },
      {
        id: 'cheque-details',
        screenId: 'RCPT-006',
        route: '/receipt/cheque-details',
        type: 'FORM',
        title: 'Cheque Payment',
        config: {
          formId: 'cheque-details-form',
          submitButtonText: 'Continue',
          cancelButtonText: 'Back',
          sections: [
            {
              id: 'cheque-info',
              fields: [
                {
                  id: 'chequeNumber',
                  name: 'chequeNumber',
                  label: 'Cheque Number',
                  type: 'NUMBER',
                  placeholder: 'Enter cheque number',
                  required: false,
                  maxLength: 10,
                },
                {
                  id: 'chequeDate',
                  name: 'chequeDate',
                  label: 'Cheque Date',
                  type: 'DATE',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Cheque date is required',
                    },
                    {
                      type: 'custom',
                      message: 'Cheque date cannot be in future',
                      // validator: 'date <= today',
                      validator: `const date = new Date(formData.chequeDate);
                      const today = new Date();
                      return date <= today;`,
                    },
                  ],
                },
                {
                  id: 'chequeBankName',
                  name: 'chequeBankName',
                  label: 'Bank Name',
                  type: 'DROPDOWN',
                  placeholder: 'Select bank',
                  required: false,
                  apiEndpoint: '/api/banks/list',
                },
                {
                  id: 'chequeStatus',
                  name: 'chequeStatus',
                  label: 'Status',
                  type: 'RADIO',
                  required: true,
                  defaultValue: 'received',
                  options: [
                    {
                      value: 'received',
                      label: 'Received (not cleared)',
                      icon: '📝',
                    },
                    {
                      value: 'cleared',
                      label: 'Cleared',
                      icon: '✅',
                    },
                  ],
                },
                {
                  id: 'chequePhoto',
                  name: 'chequePhoto',
                  label: 'Attach cheque photo (optional)',
                  type: 'FILE',
                  placeholder: '📸 Attach cheque photo',
                  required: false,
                  hint: 'Max size 5MB, formats: JPG, PNG',
                },
              ],
            },
          ],
          actions: {
            onSubmit: {
              conditionalNavigation: [
                {
                  condition: 'chequeStatus === "cleared"',
                  navigate: 'cheque-bank-selection',
                  params: [
                    'customer',
                    'amount',
                    'remaining',
                    'paymentMethod',
                    'chequeDetails',
                  ],
                },
                {
                  condition: 'chequeStatus === "received"',
                  navigate: 'confirmation',
                  params: [
                    'customer',
                    'amount',
                    'remaining',
                    'paymentMethod',
                    'chequeDetails',
                  ],
                },
              ],
            },
            onCancel: {
              navigate: 'payment-method',
            },
          },
        },
      },
      {
        id: 'cheque-bank-selection',
        screenId: 'RCPT-007',
        route: '/receipt/cheque-bank-selection',
        type: 'LIST_SELECTION',
        title: 'Select Bank Account',
        config: {
          infoText: 'Cheque has cleared. Which account received the money?',
          field: {
            id: 'chequeBankAccount',
            name: 'chequeBankAccount',
            type: 'RADIO',
            required: true,
            apiEndpoint: '/api/bank-accounts',
            itemTemplate: {
              fields: [
                {
                  id: 'bankName',
                  type: 'text',
                  style: 'title',
                },
                {
                  id: 'accountTitle',
                  type: 'text',
                  style: 'subtitle',
                },
                {
                  id: 'accountNumber',
                  type: 'text',
                  style: 'caption',
                  mask: '****{last4\r\n                                    }',
                },
              ],
            },
          },
          addNewButton: {
            text: '+ Add bank account',
            navigate: 'add-bank-account',
          },
          actions: {
            onSelect: {
              navigate: 'confirmation',
              params: [
                'customer',
                'amount',
                'remaining',
                'paymentMethod',
                'chequeDetails',
                'chequeBankAccount',
              ],
            },
          },
        },
      },
      {
        id: 'confirmation',
        screenId: 'RCPT-008',
        route: '/receipt/confirmation',
        type: 'CONFIRMATION',
        title: 'Payment Recorded',
        config: {
          successHeader: {
            icon: '✅',
            title: 'Payment Recorded',
            style: 'success',
          },
          summaryCard: {
            fields: [
              {
                label: 'Customer',
                field: 'customer.name',
                type: 'text',
                style: 'bold',
              },
              {
                label: 'Amount Received',
                field: 'amount',
                type: 'currency',
                prefix: 'PKR',
                style: 'large',
              },
              {
                label: 'Payment Method',
                field: 'paymentMethod',
                type: 'text',
                transform: 'capitalize',
              },
              {
                label: 'Date',
                field: 'date',
                type: 'date',
                format: 'MMMM DD, YYYY',
              },
              {
                type: 'divider',
              },
              {
                label: 'Remaining Balance',
                field: 'remaining',
                type: 'currency',
                prefix: 'PKR',
                style: 'bold',
                colorRule: {
                  field: 'remaining',
                  rules: [
                    {
                      condition: 'value > 0',
                      color: '#FF9500',
                    },
                    {
                      condition: 'value === 0',
                      color: '#34C759',
                    },
                    {
                      condition: 'value < 0',
                      color: '#007AFF',
                    },
                  ],
                },
              },
              {
                label: 'Due Date',
                field: 'dueDate',
                type: 'date',
                format: 'MMMM DD, YYYY',
                showWhen: 'remaining > 0',
              },
            ],
          },
          actionsSection: {
            title: "What's next?",
            actions: [
              {
                id: 'send-receipt',
                label:
                  'Send Receipt to {customer.name\r\n                                }',
                icon: '📲',
                description: 'WhatsApp / SMS / Email',
                navigate: 'share-receipt',
                params: ['transactionId'],
              },
              {
                id: 'remind-customer',
                label:
                  'Remind {customer.name\r\n                                } for remaining',
                icon: '🔔',
                description:
                  'Set reminder for PKR {remaining\r\n                                }',
                navigate: 'set-reminder',
                params: ['customer', 'remaining'],
                showWhen: 'remaining > 0',
              },
              {
                id: 'add-note',
                label: 'Add Note',
                icon: '📝',
                description: 'Optional memo',
                navigate: 'add-note',
                params: ['transactionId'],
              },
            ],
          },
          bottomActions: {
            primary: {
              text: '✓ Done',
              action: {
                navigate: 'dashboard',
                saveTransaction: true,
              },
            },
            secondary: [
              {
                text: '↩️ Undo',
                action: {
                  confirmDialog: {
                    title: 'Undo Transaction',
                    message: 'Are you sure you want to undo this transaction?',
                    confirmText: 'Yes, Undo',
                    cancelText: 'Cancel',
                  },
                  onConfirm: {
                    deleteTransaction: true,
                    navigate: 'dashboard',
                  },
                },
              },
              {
                text: '➕ Add Another',
                action: {
                  saveTransaction: true,
                  navigate: 'customer-selection',
                },
              },
            ],
          },
          transactionData: {
            endpoint: '/api/transactions/receipt',
            method: 'POST',
            payload: {
              transaction_type: 'receipt',
              customer_id: '{customer.id\r\n                            }',
              amount: '{amount\r\n                            }',
              payment_method: '{paymentMethod\r\n                            }',
              payment_date: '{date\r\n                            }',
              status: '{status\r\n                            }',
              bank_account_id:
                '{bankAccount.id\r\n                            }',
              wallet_type: '{walletType\r\n                            }',
              wallet_account: '{walletAccount\r\n                            }',
              cheque_details: {
                cheque_number:
                  '{chequeNumber\r\n                                }',
                cheque_date: '{chequeDate\r\n                                }',
                bank_name:
                  '{chequeBankName\r\n                                }',
                status: '{chequeStatus\r\n                                }',
                photo_path: '{chequePhoto\r\n                                }',
              },
              created_at: '{timestamp\r\n                            }',
              created_by: '{userId\r\n                            }',
            },
          },
        },
      },
      {
        id: 'share-receipt',
        screenId: 'RCPT-009',
        route: '/receipt/share',
        type: 'MODAL',
        title: 'Send Receipt to {customer.name\r\n                }',
        config: {
          modalType: 'bottom-sheet',
          customerInfo: {
            fields: [
              {
                label: 'Phone',
                field: 'customer.phone',
              },
              {
                label: 'Email',
                field: 'customer.email',
              },
            ],
          },
          shareOptions: [
            {
              id: 'whatsapp',
              label: 'WhatsApp',
              icon: '📱',
              description: 'Send via WhatsApp Business',
              action: 'share-whatsapp',
              requiresField: 'customer.phone',
              messageTemplate: {
                text: 'Dear {customer.name\r\n                                },\n\nThank you for your payment!\n\nAmount Received: PKR {amount\r\n                                }\nDate: {date\r\n                                }\nRemaining Balance: PKR {remaining\r\n                                }\n\nView your receipt: {receiptLink\r\n                                }\n\n{businessName\r\n                                }',
              },
            },
            {
              id: 'sms',
              label: 'SMS',
              icon: '💬',
              description: 'Send as text message',
              action: 'share-sms',
              requiresField: 'customer.phone',
              messageTemplate: {
                text: 'Dear {customer.name\r\n                                }, Thank you for payment of PKR {amount\r\n                                }. Remaining: PKR {remaining\r\n                                }. {businessName\r\n                                }',
              },
            },
            {
              id: 'email',
              label: 'Email',
              icon: '📧',
              description:
                'Send to {customer.email\r\n                            }',
              action: 'share-email',
              requiresField: 'customer.email',
              disabledMessage: 'No email address',
              emailTemplate: {
                subject:
                  'Payment Receipt - {businessName\r\n                                }',
                body: 'Dear {customer.name\r\n                                },\n\nThank you for your payment.\n\nAmount Received: PKR {amount\r\n                                }\nDate: {date\r\n                                }\nRemaining Balance: PKR {remaining\r\n                                }\n\nPlease find your receipt attached.\n\nBest regards,\n{businessName\r\n                                }',
                attachment: '{receiptPDF\r\n                                }',
              },
            },
            {
              id: 'download',
              label: 'Download PDF',
              icon: '📄',
              description: 'Save and share manually',
              action: 'download-pdf',
            },
          ],
          receiptFormat: {
            template: 'receipt-standard',
            fields: [
              'businessLogo',
              'businessName',
              'businessContact',
              'receiptNumber',
              'date',
              'customerName',
              'amountReceived',
              'paymentMethod',
              'previousBalance',
              'amountPaid',
              'remainingBalance',
              'thankYouMessage',
            ],
          },
          actions: {
            onClose: {
              navigate: 'confirmation',
            },
          },
        },
      },
      {
        id: 'set-reminder',
        screenId: 'RCPT-010',
        route: '/receipt/set-reminder',
        type: 'MODAL',
        title: 'Remind {customer.name\r\n                } for Payment',
        config: {
          modalType: 'bottom-sheet',
          infoDisplay: {
            label: 'Remaining amount:',
            field: 'remaining',
            format: 'currency',
            prefix: 'PKR',
          },
          sections: [
            {
              id: 'reminder-date-section',
              title: 'When should we remind?',
              field: {
                id: 'reminderDate',
                name: 'reminderDate',
                type: 'DATE',
                required: true,
                defaultValue:
                  '{dueDate - 3 days\r\n                                }',
                quickOptions: [
                  {
                    label: '3 days before due',
                    value:
                      '{dueDate - 3\r\n                                        }',
                  },
                  {
                    label: 'On due date',
                    value:
                      '{dueDate\r\n                                        }',
                  },
                  {
                    label: 'Custom date',
                    value: 'custom',
                  },
                ],
                validations: [
                  {
                    type: 'custom',
                    message: 'Reminder date must be today or future',
                    validator: 'date >= today',
                  },
                ],
              },
            },
            {
              id: 'reminder-methods-section',
              title: 'Reminder Method',
              field: {
                id: 'reminderMethods',
                name: 'reminderMethods',
                type: 'CHECKBOX',
                required: true,
                defaultValue: ['in_app'],
                options: [
                  {
                    value: 'in_app',
                    label: 'In-app notification',
                    icon: '🔔',
                  },
                  {
                    value: 'sms',
                    label: 'SMS to customer',
                    icon: '💬',
                    requiresField: 'customer.phone',
                  },
                  {
                    value: 'whatsapp',
                    label: 'WhatsApp message',
                    icon: '📱',
                    requiresField: 'customer.phone',
                  },
                  {
                    value: 'email',
                    label: 'Email',
                    icon: '📧',
                    requiresField: 'customer.email',
                  },
                ],
                validations: [
                  {
                    type: 'custom',
                    message: 'Select at least one reminder method',
                    validator: 'value.length > 0',
                  },
                ],
              },
            },
          ],
          messageTemplates: {
            sms: 'Dear {customer.name\r\n                        }, Friendly reminder: Payment of PKR {remaining\r\n                        } is due on {dueDate\r\n                        }. Thank you! {businessName\r\n                        } {phone\r\n                        }',
            whatsapp:
              'Dear {customer.name\r\n                        },\n\nFriendly reminder:\nPayment of PKR {remaining\r\n                        } is due on {dueDate\r\n                        }.\n\nThank you!\n{businessName\r\n                        }\n{phone\r\n                        }',
            email: {
              subject:
                'Payment Reminder - {businessName\r\n                            }',
              body: 'Dear {customer.name\r\n                            },\n\nThis is a friendly reminder that a payment of PKR {remaining\r\n                            } is due on {dueDate\r\n                            }.\n\nCurrent outstanding balance: PKR {totalBalance\r\n                            }\n\nFor any questions, please contact us.\n\nBest regards,\n{businessName\r\n                            }',
            },
          },
          actions: {
            onSubmit: {
              endpoint: '/api/reminders',
              method: 'POST',
              payload: {
                reminder_type: 'payment_due',
                customer_id:
                  '{customer.id\r\n                                }',
                amount: '{remaining\r\n                                }',
                due_date: '{dueDate\r\n                                }',
                reminder_date:
                  '{reminderDate\r\n                                }',
                methods:
                  '{reminderMethods\r\n                                }',
                status: 'pending',
              },
              onSuccess: {
                navigate: 'confirmation',
                showToast: 'Reminder set successfully',
              },
            },
            onCancel: {
              navigate: 'confirmation',
            },
          },
        },
      },
      {
        id: 'add-note',
        screenId: 'RCPT-011',
        route: '/receipt/add-note',
        type: 'MODAL',
        title: 'Add Note',
        config: {
          modalType: 'bottom-sheet',
          field: {
            id: 'note',
            name: 'note',
            type: 'TEXTAREA',
            placeholder: 'Add any details about this payment...',
            multiline: true,
            numberOfLines: 5,
            maxLength: 500,
            showCharacterCount: true,
          },
          quickTemplates: [
            {
              label: 'Partial payment',
              value: 'Partial payment',
            },
            {
              label: 'Advance payment',
              value: 'Advance payment',
            },
            {
              label: 'Settlement',
              value: 'Settlement',
            },
            {
              label: 'Regular payment',
              value: 'Regular payment',
            },
          ],
          actions: {
            onSubmit: {
              endpoint:
                '/api/transactions/{transactionId\r\n                            }/note',
              method: 'POST',
              payload: {
                note_text: '{note\r\n                                }',
              },
              onSuccess: {
                navigate: 'confirmation',
                showToast: 'Note added successfully',
              },
            },
            onCancel: {
              navigate: 'confirmation',
            },
          },
        },
      },
    ],
  },
};

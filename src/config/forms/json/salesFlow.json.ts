export const salesFlowJSON = {
  flow: {
    id: 'sales-flow',
    name: 'Sales & Invoice Management Flow',
    startScreen: 'customer-selection-sale',
    screens: [
      {
        id: 'customer-selection-sale',
        screenId: 'SALE-001',
        route: '/sale/select-customer',
        type: 'LIST_WITH_SEARCH',
        title: 'Sold something',
        config: {
          question: 'Who did you sell to?',
          searchPlaceholder: '🔍 Search or add customer...',
          sectionHeader: 'Recent customers:',
          addNewButtonText: '+ Add new customer',
          specialButton: {
            text: 'Skip - Walk-in customer',
            infoText: '💡 Or skip if cash sale to unknown',
            params: {
              customerId: 'walk-in',
              customerName: 'Walk-in Customer',
              isWalkIn: true,
            },
          },
          listConfig: {
            apiEndpoint: '/api/customers/recent?type=sales&days=60',
            sortBy: 'lastSaleDate',
            sortOrder: 'desc',
            itemTemplate: {
              fields: [
                {
                  id: 'name',
                  type: 'text',
                  style: 'title',
                },
                {
                  id: 'lastSaleDate',
                  type: 'date',
                  format: 'MMM DD, YYYY',
                  prefix: 'Last sale:',
                  style: 'caption',
                },
                {
                  id: 'lastSaleAmount',
                  type: 'currency',
                  prefix: 'PKR',
                  style: 'amount',
                },
              ],
            },
          },
          actions: {
            onItemSelect: {
              navigate: 'product-selection',
              params: ['customer'],
            },
            onAddNew: {
              navigate: 'add-customer',
            },
            onSpecialButton: {
              navigate: 'product-selection',
              params: ['walkInCustomer'],
            },
          },
        },
      },
      {
        id: 'product-selection',
        screenId: 'SALE-002',
        route: '/sale/select-products',
        type: 'PRODUCT_LIST_WITH_SEARCH',
        title: 'What did you sell?',
        config: {
          question: 'What did you sell?',
          searchPlaceholder: '🔍 Search products...',
          sections: [
            {
              id: 'frequently-sold',
              title: 'Frequently sold to {customerName}',
              showWhen: 'customer && !customer.isWalkIn',
              apiEndpoint:
                '/api/products/frequent?customerId={customerId}&limit=5',
            },
            {
              id: 'recently-sold',
              title: 'Recently sold items:',
              apiEndpoint: '/api/products/recent-sold?limit=10',
            },
            {
              id: 'all-products',
              title: 'All Products',
              apiEndpoint: '/api/products',
              collapsible: true,
              defaultCollapsed: true,
            },
          ],
          productCard: {
            fields: [
              {
                id: 'name',
                type: 'text',
                style: 'title',
              },
              {
                id: 'stockQuantity',
                type: 'stock',
                label: 'Stock:',
                suffix: '{unit}',
                colorRules: [
                  {
                    condition: 'value > 50',
                    color: '#34C759',
                    label: 'In Stock',
                  },
                  {
                    condition: 'value >= 10 && value <= 50',
                    color: '#FF9500',
                    label: 'Low',
                  },
                  {
                    condition: 'value < 10 && value > 0',
                    color: '#FF3B30',
                    label: 'Very Low',
                  },
                  {
                    condition: 'value === 0',
                    color: '#8E8E93',
                    label: 'Out of Stock',
                  },
                ],
              },
              {
                id: 'lastSoldPrice',
                type: 'currency',
                prefix: 'Last sold: PKR',
                style: 'caption',
              },
            ],
          },
          addNewButton: {
            text: '+ Add new product',
            navigate: 'add-product',
          },
          skipButton: {
            text: 'Skip items - Just enter total',
            infoText: '💡 Use this for quick sales without item details',
            dividerText: '───── OR ─────',
            navigate: 'direct-total-entry',
          },
          actions: {
            onItemSelect: {
              navigate: 'product-quantity-price',
              params: ['product'],
            },
            onAddNew: {
              navigate: 'add-product',
            },
            onSkip: {
              navigate: 'direct-total-entry',
            },
          },
        },
      },
      {
        id: 'add-product',
        screenId: 'PROD-001',
        route: '/product/add',
        type: 'FORM',
        title: 'Add Product',
        config: {
          formId: 'add-product-form',
          submitButtonText: '✓ Save Product',
          cancelButtonText: 'Cancel',
          sections: [
            {
              id: 'basic-info',
              title: 'Product Information',
              fields: [
                {
                  id: 'name',
                  name: 'name',
                  label: 'Product Name',
                  type: 'TEXT',
                  placeholder: 'Enter product name',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Product name is required',
                    },
                    {
                      type: 'min',
                      value: 2,
                      message: 'Product name must be at least 2 characters',
                    },
                    {
                      type: 'max',
                      value: 100,
                      message: 'Product name must not exceed 100 characters',
                    },
                  ],
                },
                {
                  id: 'category',
                  name: 'category',
                  label: 'Category',
                  type: 'DROPDOWN',
                  placeholder: 'Select category',
                  required: true,
                  options: [
                    { label: 'Electronics', value: 'electronics' },
                    { label: 'Furniture', value: 'furniture' },
                    { label: 'Clothing', value: 'clothing' },
                    { label: 'Food & Beverages', value: 'food' },
                    { label: 'Services', value: 'services' },
                    { label: 'Other', value: 'other' },
                  ],
                  validations: [
                    {
                      type: 'required',
                      message: 'Category is required',
                    },
                  ],
                },
                {
                  id: 'sku',
                  name: 'sku',
                  label: 'Product Code/SKU',
                  type: 'TEXT',
                  placeholder: 'Enter SKU (optional)',
                  required: false,
                  maxLength: 50,
                },
              ],
            },
            {
              id: 'pricing-info',
              title: 'Pricing & Inventory',
              fields: [
                {
                  id: 'salePrice',
                  name: 'salePrice',
                  label: 'Sale Price (per unit)',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: 'PKR',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Sale price is required',
                    },
                    {
                      type: 'min',
                      value: 0.01,
                      message: 'Sale price must be greater than 0',
                    },
                  ],
                },
                {
                  id: 'purchasePrice',
                  name: 'purchasePrice',
                  label: 'Purchase Price (per unit)',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: 'PKR',
                  hint: 'For profit margin tracking',
                  required: false,
                  validations: [
                    {
                      type: 'min',
                      value: 0,
                      message: 'Purchase price cannot be negative',
                    },
                  ],
                },
                {
                  id: 'unit',
                  name: 'unit',
                  label: 'Unit of Measurement',
                  type: 'DROPDOWN',
                  placeholder: 'Select unit',
                  required: true,
                  options: [
                    { label: 'Piece(s)', value: 'piece' },
                    { label: 'Kilogram (KG)', value: 'kg' },
                    { label: 'Liter (L)', value: 'liter' },
                    { label: 'Meter (M)', value: 'meter' },
                    { label: 'Box(es)', value: 'box' },
                    { label: 'Dozen', value: 'dozen' },
                    { label: 'Other', value: 'other' },
                  ],
                  validations: [
                    {
                      type: 'required',
                      message: 'Unit of measurement is required',
                    },
                  ],
                },
                {
                  id: 'stockQuantity',
                  name: 'stockQuantity',
                  label: 'Current Stock Quantity',
                  type: 'NUMBER',
                  placeholder: '0',
                  defaultValue: '0',
                  required: true,
                  validations: [
                    {
                      type: 'required',
                      message: 'Stock quantity is required',
                    },
                    {
                      type: 'min',
                      value: 0,
                      message: 'Stock quantity cannot be negative',
                    },
                  ],
                },
                {
                  id: 'lowStockAlert',
                  name: 'lowStockAlert',
                  label: 'Low Stock Alert Level',
                  type: 'NUMBER',
                  placeholder: '10',
                  hint: 'Get notified when stock falls below this level',
                  required: false,
                  validations: [
                    {
                      type: 'min',
                      value: 1,
                      message: 'Alert level must be at least 1',
                    },
                  ],
                },
              ],
            },
            {
              id: 'additional-info',
              title: 'Additional Details',
              fields: [
                {
                  id: 'description',
                  name: 'description',
                  label: 'Description',
                  type: 'TEXTAREA',
                  placeholder: 'Enter product description',
                  multiline: true,
                  numberOfLines: 4,
                  maxLength: 500,
                  required: false,
                },
                {
                  id: 'productImage',
                  name: 'productImage',
                  label: 'Product Image',
                  type: 'FILE',
                  placeholder: '📸 Add product image',
                  hint: 'Max size 5MB, formats: JPG, PNG',
                  required: false,
                },
              ],
            },
          ],
          actions: {
            onSubmit: {
              apiEndpoint: '/api/products',
              method: 'POST',
              onSuccess: {
                navigate: 'product-selection',
                params: ['newProduct'],
              },
            },
            onCancel: {
              navigate: 'product-selection',
            },
          },
        },
      },
      {
        id: 'product-quantity-price',
        screenId: 'SALE-003',
        route: '/sale/product-details',
        type: 'PRODUCT_QUANTITY_PRICE',
        title: '{productName}',
        config: {
          productDisplay: {
            showImage: true,
            showStock: true,
            fields: [
              {
                id: 'name',
                label: 'Product',
                style: 'title',
              },
              {
                id: 'stockQuantity',
                label: 'Available stock:',
                suffix: '{unit}',
                style: 'stock',
              },
            ],
          },
          quantitySection: {
            question: 'How many units?',
            field: {
              id: 'quantity',
              name: 'quantity',
              type: 'AMOUNT',
              allowDecimals: true,
              maxDecimals: 2,
              required: true,
              validations: [
                {
                  type: 'required',
                  message: 'Quantity is required',
                },
                {
                  type: 'min',
                  value: 0.01,
                  message: 'Quantity must be greater than 0',
                },
              ],
            },
            quickButtons: [
              { label: '1', value: 1 },
              { label: '5', value: 5 },
              { label: '10', value: 10 },
              { label: '50', value: 50 },
            ],
            stockCheck: {
              enabled: true,
              formula: 'stockQuantity - quantity',
              label: 'After sale:',
              suffix: '{unit}',
              colorRules: [
                { condition: 'value < 0', color: '#FF3B30' },
                { condition: 'value < lowStockAlert', color: '#FF9500' },
                { condition: 'value >= lowStockAlert', color: '#34C759' },
              ],
            },
          },
          priceSection: {
            question: 'Price per unit?',
            field: {
              id: 'pricePerUnit',
              name: 'pricePerUnit',
              type: 'AMOUNT',
              suffix: 'PKR',
              required: true,
              validations: [
                {
                  type: 'required',
                  message: 'Price is required',
                },
                {
                  type: 'min',
                  value: 0.01,
                  message: 'Price must be greater than 0',
                },
              ],
            },
            lastPriceButton: {
              enabled: true,
              label: 'Use last price: PKR {lastSoldPrice}',
            },
          },
          totalCalculation: {
            formula: 'quantity * pricePerUnit',
            display: [
              {
                label: 'Quantity: {quantity} × Price: PKR {pricePerUnit}',
                style: 'secondary',
              },
              {
                label: 'Total: PKR {total}',
                style: 'primary-large',
              },
            ],
          },
          warnings: [
            {
              condition: 'quantity > stockQuantity',
              icon: '⚠️',
              message: 'Not enough stock! Available: {stockQuantity} {unit}',
              confirmDialog: {
                title: 'Insufficient Stock',
                message: 'Proceed with negative stock?',
                confirmText: 'Yes, Proceed',
                cancelText: 'Cancel',
              },
            },
          ],
          actions: {
            primary: {
              text: '✓ Add to cart',
              addToCart: true,
              navigate: 'shopping-cart',
            },
            secondary: {
              text: '+ Add more items',
              addToCart: true,
              navigate: 'product-selection',
            },
          },
        },
      },
      {
        id: 'shopping-cart',
        screenId: 'SALE-004',
        route: '/sale/cart',
        type: 'SHOPPING_CART',
        title: 'Invoice Items',
        config: {
          header: 'Invoice Items:',
          subtitle: 'Sale to {customerName}',
          cartItemCard: {
            fields: [
              {
                id: 'name',
                type: 'text',
                style: 'title',
              },
              {
                id: 'calculation',
                type: 'formula',
                formula: '{quantity} × PKR {pricePerUnit}',
                style: 'secondary',
              },
              {
                id: 'lineTotal',
                type: 'currency',
                prefix: 'PKR',
                style: 'bold',
              },
            ],
            actions: [
              {
                id: 'edit',
                label: 'Edit',
                navigate: 'product-quantity-price',
                params: ['cartItem'],
              },
              {
                id: 'delete',
                label: 'Delete',
                confirmDialog: {
                  title: 'Remove Item',
                  message: 'Remove {productName} from cart?',
                  confirmText: 'Remove',
                  cancelText: 'Cancel',
                },
              },
            ],
          },
          addMoreButton: {
            text: '+ Add another item',
            navigate: 'product-selection',
          },
          calculations: [
            {
              id: 'subtotal',
              label: 'Subtotal',
              formula: 'sum(cartItems.lineTotal)',
              style: 'standard',
            },
            {
              id: 'discount',
              label: 'Discount',
              collapsible: true,
              defaultCollapsed: true,
              addButton: {
                text: '+ Add discount',
              },
              fields: [
                {
                  id: 'discountType',
                  name: 'discountType',
                  type: 'RADIO',
                  options: [
                    { label: 'Percentage (%)', value: 'percentage' },
                    { label: 'Fixed Amount', value: 'fixed' },
                  ],
                },
                {
                  id: 'discountValue',
                  name: 'discountValue',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: '{discountType === "percentage" ? "%" : "PKR"}',
                  validations: [
                    {
                      type: 'min',
                      value: 0,
                      message: 'Discount cannot be negative',
                    },
                  ],
                },
              ],
              calculation: {
                formula:
                  'discountType === "percentage" ? (subtotal * discountValue / 100) : discountValue',
                display: '- PKR {calculatedDiscount}',
                style: 'discount',
              },
            },
            {
              id: 'tax',
              label: 'Tax',
              collapsible: true,
              defaultCollapsed: true,
              addButton: {
                text: '+ Add GST/Sales Tax',
              },
              fields: [
                {
                  id: 'taxType',
                  name: 'taxType',
                  type: 'DROPDOWN',
                  placeholder: 'Select tax type',
                  options: [
                    { label: 'GST 18%', value: 'gst_18' },
                    { label: 'Sales Tax 17%', value: 'sales_tax_17' },
                    { label: 'Custom %', value: 'custom' },
                  ],
                },
                {
                  id: 'customTaxRate',
                  name: 'customTaxRate',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: '%',
                  showWhen: 'taxType === "custom"',
                },
              ],
              calculation: {
                formula:
                  'getTaxRate(taxType, customTaxRate) * (subtotal - discount) / 100',
                display: '+ PKR {calculatedTax}',
                style: 'tax',
              },
            },
            {
              id: 'grand-total',
              label: 'Total Amount',
              formula: 'subtotal - discount + tax',
              style: 'grand-total',
              divider: 'double',
            },
          ],
          continueButton: {
            text: 'Continue to Payment',
            disabled: 'cartItems.length === 0',
            navigate: 'payment-terms',
          },
        },
      },
      {
        id: 'direct-total-entry',
        screenId: 'SALE-005',
        route: '/sale/direct-total',
        type: 'DIRECT_TOTAL',
        title: 'Quick Sale',
        config: {
          infoText: 'Quick sale without item details',
          question: 'What is the total sale amount?',
          field: {
            id: 'totalAmount',
            name: 'totalAmount',
            type: 'AMOUNT',
            suffix: 'PKR',
            required: true,
            validations: [
              {
                type: 'required',
                message: 'Total amount is required',
              },
              {
                type: 'min',
                value: 0.01,
                message: 'Amount must be greater than 0',
              },
              {
                type: 'max',
                value: 9999999.99,
                message: 'Amount too large',
              },
            ],
          },
          quickButtons: [
            { label: '500', value: 500 },
            { label: '1,000', value: 1000 },
            { label: '5,000', value: 5000 },
            { label: '10,000', value: 10000 },
          ],
          descriptionField: {
            id: 'description',
            name: 'description',
            label: 'What did you sell? (optional)',
            type: 'TEXT',
            placeholder: 'e.g., Mixed groceries, various items',
            maxLength: 200,
            required: false,
          },
          continueButton: {
            text: 'Continue to Payment',
            navigate: 'payment-terms',
          },
        },
      },
      {
        id: 'payment-terms',
        screenId: 'SALE-006',
        route: '/sale/payment-terms',
        type: 'SELECTION',
        title: 'How is {customerName} paying?',
        config: {
          infoDisplay: {
            label: 'Total Amount:',
            value: 'PKR {grandTotal}',
            style: 'prominent',
          },
          selectionType: 'single',
          displayType: 'cards',
          field: {
            id: 'paymentTerm',
            name: 'paymentTerm',
            type: 'RADIO',
            required: true,
            options: [
              {
                value: 'full',
                label: 'Full Payment Now',
                icon: '💰',
                description: 'Receive complete amount',
                navigateTo: 'full-payment',
              },
              {
                value: 'credit',
                label: 'Credit (Pay Later)',
                icon: '📅',
                description: '{customerName} will pay later',
                navigateTo: 'credit-terms',
                disabledWhen: 'customer.isWalkIn',
                disabledMessage: 'Walk-in customers must pay in full',
              },
              {
                value: 'partial',
                label: 'Partial Payment',
                icon: '💵',
                description: 'Part now, part later',
                navigateTo: 'partial-payment',
                disabledWhen: 'customer.isWalkIn',
                disabledMessage: 'Walk-in customers must pay in full',
              },
            ],
          },
          customerCreditInfo: {
            showWhen: 'customer.creditHistory',
            message:
              '{customerName} usually takes credit for {usualCreditDays} days',
            quickAction: {
              text: 'Use {usualCreditDays} days',
              navigate: 'credit-terms',
              presetDays: '{usualCreditDays}',
            },
          },
          walkInWarning: {
            showWhen: 'customer.isWalkIn',
            icon: '⚠️',
            message: 'Walk-in customers can only pay in full',
          },
          actions: {
            onSelect: {
              navigate: '{option.navigateTo}',
              params: ['paymentTerm'],
            },
          },
        },
      },
      {
        id: 'full-payment',
        screenId: 'SALE-007',
        route: '/sale/full-payment',
        type: 'SELECTION',
        title: 'Full Payment',
        config: {
          infoDisplay: {
            label: 'Receiving:',
            value: 'PKR {grandTotal}',
            style: 'large',
          },
          question: 'Payment method?',
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
                description: 'Cash in hand',
                navigateTo: 'sale-confirmation',
              },
              {
                value: 'bank',
                label: 'Bank Transfer',
                icon: '🏦',
                description: 'Direct to account',
                navigateTo: 'bank-selection',
              },
              {
                value: 'wallet',
                label: 'Mobile Wallet',
                icon: '📱',
                description: 'JazzCash, Easypaisa',
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
                description: 'Credit/Debit card',
                navigateTo: 'sale-confirmation',
              },
            ],
          },
          actions: {
            onSelect: {
              navigate: '{option.navigateTo}',
              params: ['paymentMethod'],
            },
          },
        },
      },
      {
        id: 'credit-terms',
        screenId: 'SALE-008',
        route: '/sale/credit-terms',
        type: 'CREDIT_TERMS',
        title: 'Credit Sale',
        config: {
          infoDisplay: {
            label: 'Credit amount:',
            value: 'PKR {grandTotal}',
            style: 'large',
          },
          dueDateSection: {
            question: 'When should {customerName} pay?',
            quickPeriods: [
              { label: '7 days', value: 7 },
              { label: '15 days', value: 15 },
              { label: '30 days', value: 30 },
              { label: '60 days', value: 60 },
              { label: 'Custom', value: 'custom' },
            ],
            field: {
              id: 'dueDate',
              name: 'dueDate',
              type: 'DATE',
              required: true,
              validations: [
                {
                  type: 'required',
                  message: 'Due date is required',
                },
                {
                  type: 'custom',
                  message: 'Due date must be today or future',
                  validator: 'date >= today',
                },
              ],
            },
            dueDateDisplay: {
              label: 'Due on:',
              format: 'MMMM DD, YYYY',
            },
          },
          creditLimitCheck: {
            enabled: true,
            display: [
              {
                label: "{customerName}'s credit limit:",
                value: 'PKR {creditLimit}',
              },
              {
                label: 'Currently owes:',
                value: 'PKR {currentOutstanding}',
              },
              {
                label: 'Will owe:',
                value: 'PKR {currentOutstanding + grandTotal}',
                colorRule: {
                  condition: '(currentOutstanding + grandTotal) > creditLimit',
                  color: '#FF3B30',
                },
              },
            ],
            warning: {
              showWhen: '(currentOutstanding + grandTotal) > creditLimit',
              icon: '⚠️',
              title: 'Credit Limit Exceeded',
              message:
                'This sale will exceed the credit limit. Proceed anyway?',
              confirmText: 'Approve Override',
              cancelText: 'Cancel',
            },
          },
          reminderSection: {
            question: 'Set automatic reminder?',
            options: [
              {
                value: 'yes',
                label: 'Yes, remind {reminderDays} days before',
                defaultSelected: true,
              },
              {
                value: 'no',
                label: 'No reminder needed',
              },
            ],
            reminderDaysField: {
              id: 'reminderDays',
              name: 'reminderDays',
              type: 'NUMBER',
              defaultValue: 3,
              min: 1,
              max: 30,
              showWhen: 'reminderEnabled === true',
            },
          },
          continueButton: {
            text: 'Confirm Credit Terms',
            navigate: 'sale-confirmation',
          },
        },
      },
      {
        id: 'partial-payment',
        screenId: 'SALE-009',
        route: '/sale/partial-payment',
        type: 'COMPOUND',
        title: 'Partial Payment',
        config: {
          infoDisplay: {
            label: 'Total amount:',
            value: 'PKR {grandTotal}',
          },
          sections: [
            {
              id: 'advance-amount-section',
              title: 'Amount paying now',
              question: 'How much is {customerName} paying now?',
              field: {
                id: 'advanceAmount',
                name: 'advanceAmount',
                type: 'AMOUNT',
                suffix: 'PKR',
                required: true,
                validations: [
                  {
                    type: 'required',
                    message: 'Advance amount is required',
                  },
                  {
                    type: 'min',
                    value: 0.01,
                    message: 'Amount must be greater than 0',
                  },
                  {
                    type: 'custom',
                    message: 'For full payment, select "Full Payment Now"',
                    validator: 'value < grandTotal',
                  },
                ],
              },
              quickPercentages: [
                { label: '25%', value: 0.25 },
                { label: '50%', value: 0.5 },
                { label: '75%', value: 0.75 },
              ],
              realTimeCalculation: {
                display: [
                  {
                    label: 'Paying now:',
                    value: 'PKR {advanceAmount}',
                    style: 'success',
                  },
                  {
                    label: 'Remaining:',
                    value: 'PKR {grandTotal - advanceAmount}',
                    style: 'warning',
                  },
                ],
              },
            },
            {
              id: 'advance-payment-method-section',
              title: 'Payment method for advance',
              question: 'Payment method for PKR {advanceAmount}?',
              field: {
                id: 'advancePaymentMethod',
                name: 'advancePaymentMethod',
                type: 'RADIO',
                required: true,
                options: [
                  { value: 'cash', label: 'Cash', icon: '💵' },
                  { value: 'bank', label: 'Bank', icon: '🏦' },
                  { value: 'wallet', label: 'Wallet', icon: '📱' },
                  { value: 'cheque', label: 'Cheque', icon: '📝' },
                  { value: 'card', label: 'Card', icon: '💳' },
                ],
              },
            },
            {
              id: 'remaining-terms-section',
              title: 'Remaining amount terms',
              question: 'When will {customerName} pay the remaining?',
              field: {
                id: 'remainingDueDate',
                name: 'remainingDueDate',
                type: 'DATE',
                required: true,
                quickPeriods: [
                  { label: '7 days', value: 7 },
                  { label: '15 days', value: 15 },
                  { label: '30 days', value: 30 },
                ],
              },
              reminderOption: {
                enabled: true,
              },
            },
          ],
          breakdownDisplay: {
            items: [
              { label: 'Total:', value: 'PKR {grandTotal}' },
              { label: 'Paying now:', value: 'PKR {advanceAmount}' },
              { type: 'divider' },
              {
                label: 'Remaining:',
                value: 'PKR {grandTotal - advanceAmount}',
                style: 'bold',
              },
              { label: 'Due:', value: '{remainingDueDate}', format: 'date' },
            ],
          },
          continueButton: {
            text: 'Continue',
            navigate: 'sale-confirmation',
          },
        },
      },
      {
        id: 'sale-confirmation',
        screenId: 'SALE-010',
        route: '/sale/confirmation',
        type: 'CONFIRMATION',
        title: 'Sale Recorded',
        config: {
          successHeader: {
            icon: '✅',
            title: 'Sale Recorded',
            subtitle: 'Invoice created successfully',
          },
          summaryCard: {
            header: 'INVOICE #{invoiceNumber}',
            metadata: [
              { label: 'Date:', value: '{invoiceDate}', format: 'date' },
              { label: 'Customer:', value: '{customerName}' },
            ],
            itemsList: {
              showWhen: 'saleType === "itemized"',
              format:
                '{productName}: {quantity} × PKR {pricePerUnit} = PKR {lineTotal}',
            },
            fields: [
              { label: 'Subtotal:', value: 'PKR {subtotal}' },
              {
                label: 'Discount:',
                value: '- PKR {discount}',
                showWhen: 'discount > 0',
              },
              { label: 'Tax:', value: '+ PKR {tax}', showWhen: 'tax > 0' },
              { type: 'divider' },
              {
                label: 'Total:',
                value: 'PKR {grandTotal}',
                style: 'bold-large',
              },
            ],
            paymentStatus: {
              badges: [
                {
                  condition: 'paymentStatus === "paid"',
                  label: '✅ Paid',
                  color: '#34C759',
                },
                {
                  condition: 'paymentStatus === "credit"',
                  label: '📅 Credit - Due: {dueDate}',
                  color: '#FF9500',
                  format: 'date',
                },
                {
                  condition: 'paymentStatus === "partial"',
                  label:
                    '💵 Advance: PKR {advanceAmount}, Remaining: PKR {remainingAmount}',
                  color: '#007AFF',
                },
              ],
            },
          },
          actionsSection: {
            title: "What's next?",
            actions: [
              {
                id: 'send-invoice',
                label: 'Send Invoice to {customerName}',
                icon: '📱',
                description: 'WhatsApp / SMS / Email',
                navigate: 'share-invoice',
              },
              {
                id: 'generate-pdf',
                label: 'Generate PDF',
                icon: '📄',
                description: 'Download invoice',
                action: 'generate-pdf',
              },
              {
                id: 'print',
                label: 'Print Invoice',
                icon: '🖨️',
                description: 'Print physical copy',
                action: 'print',
              },
              {
                id: 'add-note',
                label: 'Add Note/Memo',
                icon: '📝',
                description: 'Optional note',
                navigate: 'add-note',
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
                    title: 'Undo Sale?',
                    message:
                      'This will delete the invoice and reverse all changes.',
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
                text: '🔁 Repeat Sale',
                action: {
                  duplicateSale: true,
                  navigate: 'shopping-cart',
                },
              },
            ],
          },
          invoiceData: {
            endpoint: '/api/invoices/sales',
            method: 'POST',
            payload: {
              invoice_number: '{invoiceNumber}',
              invoice_date: '{invoiceDate}',
              customer_id: '{customerId}',
              sale_type: '{saleType}',
              cart_items: '{cartItems}',
              subtotal: '{subtotal}',
              discount: '{discount}',
              tax: '{tax}',
              grand_total: '{grandTotal}',
              payment_status: '{paymentStatus}',
              payment_details: '{paymentDetails}',
              due_date: '{dueDate}',
              created_at: '{timestamp}',
              created_by: '{userId}',
            },
          },
        },
      },
      {
        id: 'share-invoice',
        screenId: 'SALE-011',
        route: '/sale/share-invoice',
        type: 'MODAL',
        title: 'Send Invoice to {customerName}',
        config: {
          modalType: 'bottom-sheet',
          customerInfo: {
            fields: [
              { label: 'Phone', field: 'customer.phone' },
              { label: 'Email', field: 'customer.email' },
            ],
          },
          shareOptions: [
            {
              id: 'whatsapp',
              label: 'WhatsApp',
              icon: '📱',
              description: 'Send via WhatsApp',
              action: 'share-whatsapp',
              requiresField: 'customer.phone',
              messageTemplate: {
                text: 'Dear {customerName},\n\nThank you for your purchase!\n\nInvoice #: {invoiceNumber}\nDate: {date}\nAmount: PKR {grandTotal}\n\nPayment Status: {paymentStatus}\n\nView invoice: {invoiceLink}\n\n{businessName}',
              },
            },
            {
              id: 'sms',
              label: 'SMS',
              icon: '💬',
              description: 'Send as text',
              action: 'share-sms',
              requiresField: 'customer.phone',
              messageTemplate: {
                text: 'Dear {customerName}, Invoice #{invoiceNumber} for PKR {grandTotal}. Status: {paymentStatus}. {businessName}',
              },
            },
            {
              id: 'email',
              label: 'Email',
              icon: '📧',
              description: 'Send to {customer.email}',
              action: 'share-email',
              requiresField: 'customer.email',
              disabledMessage: 'No email address',
              emailTemplate: {
                subject: 'Invoice #{invoiceNumber} - {businessName}',
                body: 'Dear {customerName},\n\nThank you for your purchase. Please find your invoice attached.\n\nBest regards,\n{businessName}',
                attachment: '{invoicePDF}',
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
          invoiceFormat: {
            template: 'invoice-standard',
            fields: [
              'businessLogo',
              'businessName',
              'businessContact',
              'invoiceNumber',
              'date',
              'customerName',
              'itemsList',
              'subtotal',
              'discount',
              'tax',
              'grandTotal',
              'paymentStatus',
              'termsAndConditions',
            ],
          },
          actions: {
            onClose: {
              navigate: 'sale-confirmation',
            },
          },
        },
      },
    ],
  },
};

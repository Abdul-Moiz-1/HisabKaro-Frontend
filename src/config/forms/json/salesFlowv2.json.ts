// config/forms/json/salesFlow.json.ts
import { IconType } from '../../types/icon.types';

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
          searchIcon: {
            type: IconType.IONICONS,
            name: 'search',
            size: 20,
            color: '#8E8E93',
          },
          sectionHeader: 'Recent customers:',
          addNewButtonText: '+ Add new customer',
          addNewButtonIcon: {
            type: IconType.IONICONS,
            name: 'person-add',
            size: 20,
          },
          specialButton: {
            text: 'Skip - Walk-in customer',
            icon: {
              type: IconType.MATERIAL_COMMUNITY,
              name: 'walk',
              size: 24,
            },
            infoText: '💡 Or skip if cash sale to unknown',
            infoIcon: {
              type: IconType.IONICONS,
              name: 'information-circle',
              size: 16,
            },
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
            emptyStateIcon: {
              type: IconType.IONICONS,
              name: 'people-outline',
              size: 64,
              color: '#C7C7CC',
            },
            emptyStateMessage: 'No recent customers found',
            itemTemplate: {
              showAvatar: true,
              avatarIcon: {
                type: IconType.IONICONS,
                name: 'person-circle',
                size: 48,
                color: '#007AFF',
              },
              fields: [
                {
                  id: 'name',
                  type: 'text',
                  style: 'title',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'person',
                    size: 16,
                    color: '#8E8E93',
                  },
                },
                {
                  id: 'lastSaleDate',
                  type: 'date',
                  format: 'MMM DD, YYYY',
                  prefix: 'Last sale:',
                  style: 'caption',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'calendar-outline',
                    size: 14,
                    color: '#8E8E93',
                  },
                },
                {
                  id: 'lastSaleAmount',
                  type: 'currency',
                  prefix: 'PKR',
                  style: 'amount',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'cash-outline',
                    size: 14,
                    color: '#34C759',
                  },
                },
              ],
              arrowIcon: {
                type: IconType.IONICONS,
                name: 'chevron-forward',
                size: 20,
                color: '#C7C7CC',
              },
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
          searchIcon: {
            type: IconType.IONICONS,
            name: 'search',
            size: 20,
            color: '#8E8E93',
          },
          barcodeButton: {
            icon: {
              type: IconType.IONICONS,
              name: 'barcode-outline',
              size: 24,
              color: '#007AFF',
            },
            action: 'scan-barcode',
          },
          sections: [
            {
              id: 'frequently-sold',
              title: 'Frequently sold to {customerName}',
              titleIcon: {
                type: IconType.IONICONS,
                name: 'star',
                size: 20,
                color: '#FF9500',
              },
              showWhen: 'customer && !customer.isWalkIn',
              apiEndpoint:
                '/api/products/frequent?customerId={customerId}&limit=5',
              layout: 'horizontal-scroll',
            },
            {
              id: 'recently-sold',
              title: 'Recently sold items:',
              titleIcon: {
                type: IconType.IONICONS,
                name: 'time-outline',
                size: 20,
                color: '#007AFF',
              },
              apiEndpoint: '/api/products/recent-sold?limit=10',
              layout: 'grid',
            },
            {
              id: 'all-products',
              title: 'All Products',
              titleIcon: {
                type: IconType.IONICONS,
                name: 'grid-outline',
                size: 20,
                color: '#8E8E93',
              },
              apiEndpoint: '/api/products',
              layout: 'list',
              collapsible: true,
              defaultCollapsed: true,
              expandIcon: {
                collapsed: {
                  type: IconType.IONICONS,
                  name: 'chevron-down',
                  size: 20,
                },
                expanded: {
                  type: IconType.IONICONS,
                  name: 'chevron-up',
                  size: 20,
                },
              },
            },
          ],
          productCard: {
            showImage: true,
            defaultImageIcon: {
              type: IconType.IONICONS,
              name: 'cube-outline',
              size: 48,
              color: '#C7C7CC',
            },
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
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'package-variant',
                  size: 16,
                },
                colorRules: [
                  {
                    condition: 'value > 50',
                    color: '#34C759',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'checkmark-circle',
                      size: 16,
                      color: '#34C759',
                    },
                    label: 'In Stock',
                  },
                  {
                    condition: 'value >= 10 && value <= 50',
                    color: '#FF9500',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'warning',
                      size: 16,
                      color: '#FF9500',
                    },
                    label: 'Low Stock',
                  },
                  {
                    condition: 'value < 10 && value > 0',
                    color: '#FF3B30',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'alert-circle',
                      size: 16,
                      color: '#FF3B30',
                    },
                    label: 'Very Low',
                  },
                  {
                    condition: 'value === 0',
                    color: '#8E8E93',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'close-circle',
                      size: 16,
                      color: '#8E8E93',
                    },
                    label: 'Out of Stock',
                  },
                ],
              },
              {
                id: 'lastSoldPrice',
                type: 'currency',
                prefix: 'Last sold: PKR',
                style: 'caption',
                icon: {
                  type: IconType.IONICONS,
                  name: 'pricetag-outline',
                  size: 14,
                  color: '#8E8E93',
                },
              },
            ],
          },
          addNewButton: {
            text: '+ Add new product',
            icon: {
              type: IconType.IONICONS,
              name: 'add-circle',
              size: 20,
              color: '#007AFF',
            },
            navigate: 'add-product',
          },
          skipButton: {
            text: 'Skip items - Just enter total',
            icon: {
              type: IconType.IONICONS,
              name: 'calculator-outline',
              size: 20,
              color: '#FF9500',
            },
            infoText: '💡 Use this for quick sales without item details',
            infoIcon: {
              type: IconType.IONICONS,
              name: 'information-circle',
              size: 16,
              color: '#8E8E93',
            },
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
          submitButtonIcon: {
            type: IconType.IONICONS,
            name: 'checkmark',
            size: 20,
          },
          cancelButtonText: 'Cancel',
          cancelButtonIcon: {
            type: IconType.IONICONS,
            name: 'close',
            size: 20,
          },
          sections: [
            {
              id: 'basic-info',
              title: 'Product Information',
              icon: {
                type: IconType.IONICONS,
                name: 'information-circle',
                size: 20,
                color: '#007AFF',
              },
              fields: [
                {
                  id: 'name',
                  name: 'name',
                  label: 'Product Name',
                  type: 'TEXT',
                  placeholder: 'Enter product name',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'pricetag',
                    size: 20,
                    color: '#8E8E93',
                  },
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
                  icon: {
                    type: IconType.IONICONS,
                    name: 'list',
                    size: 20,
                    color: '#8E8E93',
                  },
                  required: true,
                  options: [
                    {
                      label: 'Electronics',
                      value: 'electronics',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'phone-portrait',
                        size: 20,
                        color: '#007AFF',
                      },
                    },
                    {
                      label: 'Furniture',
                      value: 'furniture',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'sofa',
                        size: 20,
                        color: '#5856D6',
                      },
                    },
                    {
                      label: 'Clothing',
                      value: 'clothing',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'shirt',
                        size: 20,
                        color: '#FF2D55',
                      },
                    },
                    {
                      label: 'Food & Beverages',
                      value: 'food',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'fast-food',
                        size: 20,
                        color: '#FF9500',
                      },
                    },
                    {
                      label: 'Services',
                      value: 'services',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'construct',
                        size: 20,
                        color: '#34C759',
                      },
                    },
                    {
                      label: 'Other',
                      value: 'other',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'ellipsis-horizontal',
                        size: 20,
                        color: '#8E8E93',
                      },
                    },
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
                  icon: {
                    type: IconType.IONICONS,
                    name: 'barcode-outline',
                    size: 20,
                    color: '#8E8E93',
                  },
                  required: false,
                  maxLength: 50,
                },
              ],
            },
            {
              id: 'pricing-info',
              title: 'Pricing & Inventory',
              icon: {
                type: IconType.IONICONS,
                name: 'cash',
                size: 20,
                color: '#34C759',
              },
              fields: [
                {
                  id: 'salePrice',
                  name: 'salePrice',
                  label: 'Sale Price (per unit)',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: 'PKR',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'pricetag',
                    size: 20,
                    color: '#34C759',
                  },
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
                  icon: {
                    type: IconType.IONICONS,
                    name: 'trending-down',
                    size: 20,
                    color: '#FF3B30',
                  },
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
                  id: 'profitMargin',
                  name: 'profitMargin',
                  label: 'Profit Margin',
                  type: 'CALCULATED',
                  formula: '((salePrice - purchasePrice) / salePrice) * 100',
                  suffix: '%',
                  showWhen: 'salePrice > 0 && purchasePrice > 0',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'trending-up',
                    size: 20,
                  },
                  colorRules: [
                    {
                      condition: 'value < 0',
                      color: '#FF3B30',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'trending-down',
                        size: 16,
                        color: '#FF3B30',
                      },
                      label: 'Loss',
                    },
                    {
                      condition: 'value >= 0 && value < 20',
                      color: '#FF9500',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'remove',
                        size: 16,
                        color: '#FF9500',
                      },
                      label: 'Low',
                    },
                    {
                      condition: 'value >= 20 && value < 40',
                      color: '#34C759',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'checkmark',
                        size: 16,
                        color: '#34C759',
                      },
                      label: 'Good',
                    },
                    {
                      condition: 'value >= 40',
                      color: '#007AFF',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'star',
                        size: 16,
                        color: '#007AFF',
                      },
                      label: 'Excellent',
                    },
                  ],
                },
                {
                  id: 'unit',
                  name: 'unit',
                  label: 'Unit of Measurement',
                  type: 'DROPDOWN',
                  placeholder: 'Select unit',
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'scale-balance',
                    size: 20,
                    color: '#8E8E93',
                  },
                  required: true,
                  options: [
                    {
                      label: 'Piece(s)',
                      value: 'piece',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'cube',
                        size: 18,
                      },
                    },
                    {
                      label: 'Kilogram (KG)',
                      value: 'kg',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'weight-kilogram',
                        size: 18,
                      },
                    },
                    {
                      label: 'Liter (L)',
                      value: 'liter',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'bottle-tonic',
                        size: 18,
                      },
                    },
                    {
                      label: 'Meter (M)',
                      value: 'meter',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'ruler',
                        size: 18,
                      },
                    },
                    {
                      label: 'Box(es)',
                      value: 'box',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'package',
                        size: 18,
                      },
                    },
                    {
                      label: 'Dozen',
                      value: 'dozen',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'numeric-12-box',
                        size: 18,
                      },
                    },
                    {
                      label: 'Other',
                      value: 'other',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'ellipsis-horizontal',
                        size: 18,
                      },
                    },
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
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'package-variant',
                    size: 20,
                    color: '#8E8E93',
                  },
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
                  icon: {
                    type: IconType.IONICONS,
                    name: 'notifications',
                    size: 20,
                    color: '#FF9500',
                  },
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
              icon: {
                type: IconType.IONICONS,
                name: 'document-text',
                size: 20,
                color: '#8E8E93',
              },
              collapsible: true,
              defaultCollapsed: true,
              fields: [
                {
                  id: 'description',
                  name: 'description',
                  label: 'Description',
                  type: 'TEXTAREA',
                  placeholder: 'Enter product description',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'text',
                    size: 20,
                    color: '#8E8E93',
                  },
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
                  icon: {
                    type: IconType.IONICONS,
                    name: 'camera',
                    size: 20,
                    color: '#007AFF',
                  },
                  required: false,
                },
              ],
            },
          ],
          warnings: [
            {
              condition: 'salePrice < purchasePrice',
              type: 'warning',
              icon: {
                type: IconType.IONICONS,
                name: 'warning',
                size: 24,
                color: '#FF9500',
              },
              message: 'Warning: Selling at loss. Continue?',
              confirmDialog: {
                title: 'Selling at Loss',
                message:
                  'Sale price is less than purchase price. Do you want to continue?',
                confirmText: 'Yes, Continue',
                cancelText: 'Cancel',
              },
            },
          ],
          actions: {
            onSubmit: {
              apiEndpoint: '/api/products',
              method: 'POST',
              onSuccess: {
                navigate: 'product-selection',
                params: ['newProduct'],
                showToast: {
                  message: 'Product added successfully',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'checkmark-circle',
                    size: 20,
                    color: '#34C759',
                  },
                },
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
            defaultImageIcon: {
              type: IconType.IONICONS,
              name: 'cube',
              size: 80,
              color: '#C7C7CC',
            },
            showStock: true,
            stockIcon: {
              type: IconType.MATERIAL_COMMUNITY,
              name: 'package-variant',
              size: 20,
              color: '#8E8E93',
            },
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
            questionIcon: {
              type: IconType.MATERIAL_COMMUNITY,
              name: 'counter',
              size: 24,
              color: '#007AFF',
            },
            field: {
              id: 'quantity',
              name: 'quantity',
              type: 'AMOUNT',
              allowDecimals: true,
              maxDecimals: 2,
              required: true,
              icon: {
                type: IconType.IONICONS,
                name: 'calculator',
                size: 20,
              },
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
              {
                label: '1',
                value: 1,
                icon: {
                  type: IconType.IONICONS,
                  name: 'finger-print',
                  size: 16,
                },
              },
              {
                label: '5',
                value: 5,
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'numeric-5-box',
                  size: 16,
                },
              },
              {
                label: '10',
                value: 10,
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'numeric-10-box',
                  size: 16,
                },
              },
              {
                label: '50',
                value: 50,
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'package-variant-closed',
                  size: 16,
                },
              },
            ],
            stockCheck: {
              enabled: true,
              formula: 'stockQuantity - quantity',
              label: 'After sale:',
              suffix: '{unit}',
              icon: {
                type: IconType.IONICONS,
                name: 'trending-down',
                size: 18,
              },
              colorRules: [
                {
                  condition: 'value < 0',
                  color: '#FF3B30',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'alert-circle',
                    size: 16,
                    color: '#FF3B30',
                  },
                },
                {
                  condition: 'value < lowStockAlert',
                  color: '#FF9500',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'warning',
                    size: 16,
                    color: '#FF9500',
                  },
                },
                {
                  condition: 'value >= lowStockAlert',
                  color: '#34C759',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'checkmark-circle',
                    size: 16,
                    color: '#34C759',
                  },
                },
              ],
            },
          },
          priceSection: {
            question: 'Price per unit?',
            questionIcon: {
              type: IconType.IONICONS,
              name: 'cash',
              size: 24,
              color: '#34C759',
            },
            field: {
              id: 'pricePerUnit',
              name: 'pricePerUnit',
              type: 'AMOUNT',
              suffix: 'PKR',
              required: true,
              icon: {
                type: IconType.IONICONS,
                name: 'pricetag',
                size: 20,
              },
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
              icon: {
                type: IconType.IONICONS,
                name: 'time',
                size: 18,
                color: '#007AFF',
              },
            },
          },
          totalCalculation: {
            formula: 'quantity * pricePerUnit',
            icon: {
              type: IconType.IONICONS,
              name: 'calculator',
              size: 20,
              color: '#007AFF',
            },
            display: [
              {
                label: 'Quantity: {quantity} × Price: PKR {pricePerUnit}',
                style: 'secondary',
              },
              {
                label: 'Total: PKR {total}',
                style: 'primary-large',
                icon: {
                  type: IconType.IONICONS,
                  name: 'cash',
                  size: 24,
                  color: '#34C759',
                },
              },
            ],
          },
          warnings: [
            {
              condition: 'quantity > stockQuantity',
              icon: {
                type: IconType.IONICONS,
                name: 'warning',
                size: 24,
                color: '#FF9500',
              },
              message:
                '⚠️ Insufficient stock! Available: {stockQuantity} {unit}',
              confirmDialog: {
                title: 'Insufficient Stock',
                message:
                  'You are selling more than available stock. This will create negative inventory. Proceed?',
                icon: {
                  type: IconType.IONICONS,
                  name: 'alert-circle',
                  size: 48,
                  color: '#FF3B30',
                },
                confirmText: 'Yes, Proceed',
                cancelText: 'Cancel',
              },
            },
          ],
          actions: {
            primary: {
              text: '✓ Add to cart',
              icon: {
                type: IconType.IONICONS,
                name: 'cart',
                size: 20,
              },
              addToCart: true,
              navigate: 'shopping-cart',
            },
            secondary: {
              text: '+ Add more items',
              icon: {
                type: IconType.IONICONS,
                name: 'add',
                size: 20,
              },
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
          headerIcon: {
            type: IconType.IONICONS,
            name: 'cart',
            size: 24,
            color: '#007AFF',
          },
          header: 'Invoice Items:',
          subtitle: 'Sale to {customerName}',
          cartItemCard: {
            fields: [
              {
                id: 'name',
                type: 'text',
                style: 'title',
                icon: {
                  type: IconType.IONICONS,
                  name: 'cube',
                  size: 18,
                  color: '#8E8E93',
                },
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
                icon: {
                  type: IconType.IONICONS,
                  name: 'cash',
                  size: 16,
                  color: '#34C759',
                },
              },
            ],
            actions: [
              {
                id: 'edit',
                label: 'Edit',
                icon: {
                  type: IconType.FEATHER,
                  name: 'edit-2',
                  size: 18,
                  color: '#007AFF',
                },
                navigate: 'product-quantity-price',
                params: ['cartItem'],
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: {
                  type: IconType.IONICONS,
                  name: 'trash',
                  size: 18,
                  color: '#FF3B30',
                },
                confirmDialog: {
                  title: 'Remove Item',
                  message: 'Remove {productName} from cart?',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'trash',
                    size: 48,
                    color: '#FF3B30',
                  },
                  confirmText: 'Remove',
                  cancelText: 'Cancel',
                },
              },
            ],
          },
          addMoreButton: {
            text: '+ Add another item',
            icon: {
              type: IconType.IONICONS,
              name: 'add-circle',
              size: 20,
              color: '#007AFF',
            },
            navigate: 'product-selection',
          },
          calculations: [
            {
              id: 'subtotal',
              label: 'Subtotal',
              formula: 'sum(cartItems.lineTotal)',
              style: 'standard',
              icon: {
                type: IconType.IONICONS,
                name: 'calculator',
                size: 18,
                color: '#8E8E93',
              },
            },
            {
              id: 'discount',
              label: 'Discount',
              collapsible: true,
              defaultCollapsed: true,
              icon: {
                type: IconType.MATERIAL_COMMUNITY,
                name: 'tag-percent',
                size: 20,
                color: '#FF9500',
              },
              addButton: {
                text: '+ Add discount',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'tag-plus',
                  size: 18,
                  color: '#FF9500',
                },
              },
              fields: [
                {
                  id: 'discountType',
                  name: 'discountType',
                  type: 'RADIO',
                  label: 'Discount Type',
                  options: [
                    {
                      label: 'Percentage (%)',
                      value: 'percentage',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'percent',
                        size: 20,
                        color: '#FF9500',
                      },
                    },
                    {
                      label: 'Fixed Amount',
                      value: 'fixed',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'cash',
                        size: 20,
                        color: '#34C759',
                      },
                    },
                  ],
                },
                {
                  id: 'discountValue',
                  name: 'discountValue',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: '{discountType === "percentage" ? "%" : "PKR"}',
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'tag',
                    size: 20,
                    color: '#FF9500',
                  },
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
                icon: {
                  type: IconType.IONICONS,
                  name: 'remove-circle',
                  size: 16,
                  color: '#FF3B30',
                },
              },
            },
            {
              id: 'tax',
              label: 'Tax',
              collapsible: true,
              defaultCollapsed: true,
              icon: {
                type: IconType.MATERIAL_COMMUNITY,
                name: 'receipt-text',
                size: 20,
                color: '#5856D6',
              },
              addButton: {
                text: '+ Add GST/Sales Tax',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'plus',
                  size: 18,
                  color: '#5856D6',
                },
              },
              fields: [
                {
                  id: 'taxType',
                  name: 'taxType',
                  type: 'DROPDOWN',
                  label: 'Tax Type',
                  placeholder: 'Select tax type',
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'receipt',
                    size: 20,
                    color: '#5856D6',
                  },
                  options: [
                    {
                      label: 'GST 18%',
                      value: 'gst_18',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'percent',
                        size: 18,
                      },
                    },
                    {
                      label: 'Sales Tax 17%',
                      value: 'sales_tax_17',
                      icon: {
                        type: IconType.MATERIAL_COMMUNITY,
                        name: 'percent',
                        size: 18,
                      },
                    },
                    {
                      label: 'Custom %',
                      value: 'custom',
                      icon: {
                        type: IconType.IONICONS,
                        name: 'create',
                        size: 18,
                      },
                    },
                  ],
                },
                {
                  id: 'customTaxRate',
                  name: 'customTaxRate',
                  type: 'AMOUNT',
                  placeholder: '0',
                  suffix: '%',
                  showWhen: 'taxType === "custom"',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'create',
                    size: 20,
                    color: '#5856D6',
                  },
                },
              ],
              calculation: {
                formula:
                  'getTaxRate(taxType, customTaxRate) * (subtotal - discount) / 100',
                display: '+ PKR {calculatedTax}',
                style: 'tax',
                icon: {
                  type: IconType.IONICONS,
                  name: 'add-circle',
                  size: 16,
                  color: '#34C759',
                },
              },
            },
            {
              id: 'grand-total',
              label: 'Total Amount',
              formula: 'subtotal - discount + tax',
              style: 'grand-total',
              divider: 'double',
              icon: {
                type: IconType.IONICONS,
                name: 'cash',
                size: 24,
                color: '#007AFF',
              },
            },
          ],
          continueButton: {
            text: 'Continue to Payment',
            icon: {
              type: IconType.IONICONS,
              name: 'arrow-forward',
              size: 20,
            },
            disabled: 'cartItems.length === 0',
            navigate: 'payment-terms',
          },
          emptyCartState: {
            icon: {
              type: IconType.IONICONS,
              name: 'cart-outline',
              size: 64,
              color: '#C7C7CC',
            },
            message: 'Your cart is empty',
            actionButton: {
              text: 'Add Products',
              icon: {
                type: IconType.IONICONS,
                name: 'add',
                size: 20,
              },
              navigate: 'product-selection',
            },
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
          headerIcon: {
            type: IconType.IONICONS,
            name: 'flash',
            size: 24,
            color: '#FF9500',
          },
          infoText: 'Quick sale without item details',
          infoIcon: {
            type: IconType.IONICONS,
            name: 'information-circle',
            size: 20,
            color: '#007AFF',
          },
          question: 'What is the total sale amount?',
          field: {
            id: 'totalAmount',
            name: 'totalAmount',
            type: 'AMOUNT',
            suffix: 'PKR',
            required: true,
            icon: {
              type: IconType.IONICONS,
              name: 'cash',
              size: 24,
              color: '#34C759',
            },
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
            {
              label: '500',
              value: 500,
              icon: {
                type: IconType.MATERIAL_COMMUNITY,
                name: 'cash',
                size: 18,
              },
            },
            {
              label: '1,000',
              value: 1000,
              icon: {
                type: IconType.MATERIAL_COMMUNITY,
                name: 'cash-100',
                size: 18,
              },
            },
            {
              label: '5,000',
              value: 5000,
              icon: {
                type: IconType.MATERIAL_COMMUNITY,
                name: 'cash-multiple',
                size: 18,
              },
            },
            {
              label: '10,000',
              value: 10000,
              icon: {
                type: IconType.MATERIAL_COMMUNITY,
                name: 'cash-plus',
                size: 18,
              },
            },
          ],
          descriptionField: {
            id: 'description',
            name: 'description',
            label: 'What did you sell? (optional)',
            type: 'TEXT',
            placeholder: 'e.g., Mixed groceries, various items',
            maxLength: 200,
            required: false,
            icon: {
              type: IconType.IONICONS,
              name: 'document-text',
              size: 20,
              color: '#8E8E93',
            },
          },
          continueButton: {
            text: 'Continue to Payment',
            icon: {
              type: IconType.IONICONS,
              name: 'arrow-forward',
              size: 20,
            },
            navigate: 'payment-terms',
          },
          usageNote: {
            icon: {
              type: IconType.IONICONS,
              name: 'bulb',
              size: 16,
              color: '#FF9500',
            },
            text: 'Best for: Walk-in sales, mixed items, quick entry',
          },
        },
      },
      {
        id: 'payment-terms',
        screenId: 'SALE-006',
        route: '/sale/payment-terms',
        type: 'SELECTION',
        title: 'Payment Terms',
        config: {
          question: 'How is {customerName} paying?',
          infoDisplay: {
            label: 'Total Amount:',
            value: 'PKR {grandTotal}',
            style: 'prominent',
            icon: {
              type: IconType.IONICONS,
              name: 'cash',
              size: 20,
              color: '#34C759',
            },
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
                icon: {
                  type: IconType.IONICONS,
                  name: 'checkmark-circle',
                  size: 32,
                  color: '#34C759',
                },
                description: 'Receive complete amount',
                navigateTo: 'full-payment',
              },
              {
                value: 'credit',
                label: 'Credit (Pay Later)',
                icon: {
                  type: IconType.IONICONS,
                  name: 'time',
                  size: 32,
                  color: '#FF9500',
                },
                description: '{customerName} will pay later',
                navigateTo: 'credit-terms',
                disabledWhen: 'customer.isWalkIn',
                disabledMessage: 'Walk-in customers must pay in full',
                disabledIcon: {
                  type: IconType.IONICONS,
                  name: 'lock-closed',
                  size: 20,
                  color: '#8E8E93',
                },
              },
              {
                value: 'partial',
                label: 'Partial Payment',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'percent',
                  size: 32,
                  color: '#007AFF',
                },
                description: 'Part now, part later',
                navigateTo: 'partial-payment',
                disabledWhen: 'customer.isWalkIn',
                disabledMessage: 'Walk-in customers must pay in full',
                disabledIcon: {
                  type: IconType.IONICONS,
                  name: 'lock-closed',
                  size: 20,
                  color: '#8E8E93',
                },
              },
            ],
          },
          customerCreditInfo: {
            showWhen: 'customer.creditHistory',
            icon: {
              type: IconType.IONICONS,
              name: 'information-circle',
              size: 20,
              color: '#007AFF',
            },
            message:
              '{customerName} usually takes credit for {usualCreditDays} days',
            quickAction: {
              text: 'Use {usualCreditDays} days',
              icon: {
                type: IconType.IONICONS,
                name: 'flash',
                size: 18,
              },
              navigate: 'credit-terms',
              presetDays: '{usualCreditDays}',
            },
          },
          walkInWarning: {
            showWhen: 'customer.isWalkIn',
            icon: {
              type: IconType.IONICONS,
              name: 'alert-circle',
              size: 20,
              color: '#FF9500',
            },
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
            icon: {
              type: IconType.IONICONS,
              name: 'arrow-down-circle',
              size: 24,
              color: '#34C759',
            },
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
                icon: {
                  type: IconType.IONICONS,
                  name: 'cash',
                  size: 32,
                  color: '#34C759',
                },
                description: 'Cash in hand',
                navigateTo: 'sale-confirmation',
              },
              {
                value: 'bank',
                label: 'Bank Transfer',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'bank-transfer',
                  size: 32,
                  color: '#007AFF',
                },
                description: 'Direct to account',
                navigateTo: 'bank-selection',
              },
              {
                value: 'wallet',
                label: 'Mobile Wallet',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'wallet',
                  size: 32,
                  color: '#5856D6',
                },
                description: 'JazzCash, Easypaisa',
                navigateTo: 'wallet-selection',
              },
              {
                value: 'cheque',
                label: 'Cheque',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'checkbook',
                  size: 32,
                  color: '#FF9500',
                },
                description: 'Post-dated or cleared',
                navigateTo: 'cheque-details',
              },
              {
                value: 'card',
                label: 'Card/POS',
                icon: {
                  type: IconType.IONICONS,
                  name: 'card',
                  size: 32,
                  color: '#FF2D55',
                },
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
            icon: {
              type: IconType.IONICONS,
              name: 'time',
              size: 24,
              color: '#FF9500',
            },
          },
          dueDateSection: {
            question: 'When should {customerName} pay?',
            questionIcon: {
              type: IconType.IONICONS,
              name: 'calendar',
              size: 24,
              color: '#007AFF',
            },
            quickPeriods: [
              {
                label: '7 days',
                value: 7,
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 18,
                  color: '#34C759',
                },
              },
              {
                label: '15 days',
                value: 15,
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 18,
                  color: '#34C759',
                },
              },
              {
                label: '30 days',
                value: 30,
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 18,
                  color: '#007AFF',
                },
                recommended: true,
              },
              {
                label: '60 days',
                value: 60,
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 18,
                  color: '#FF9500',
                },
              },
              {
                label: 'Custom',
                value: 'custom',
                icon: {
                  type: IconType.IONICONS,
                  name: 'create',
                  size: 18,
                  color: '#8E8E93',
                },
              },
            ],
            field: {
              id: 'dueDate',
              name: 'dueDate',
              type: 'DATE',
              required: true,
              icon: {
                type: IconType.IONICONS,
                name: 'calendar',
                size: 20,
              },
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
              icon: {
                type: IconType.IONICONS,
                name: 'checkmark-circle',
                size: 20,
                color: '#34C759',
              },
            },
          },
          creditLimitCheck: {
            enabled: true,
            icon: {
              type: IconType.MATERIAL_COMMUNITY,
              name: 'credit-card-check',
              size: 20,
              color: '#007AFF',
            },
            display: [
              {
                label: "{customerName}'s credit limit:",
                value: 'PKR {creditLimit}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'card',
                  size: 16,
                },
              },
              {
                label: 'Currently owes:',
                value: 'PKR {currentOutstanding}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'trending-up',
                  size: 16,
                },
              },
              {
                label: 'Will owe:',
                value: 'PKR {currentOutstanding + grandTotal}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'calculator',
                  size: 16,
                },
                colorRule: {
                  condition: '(currentOutstanding + grandTotal) > creditLimit',
                  color: '#FF3B30',
                },
              },
            ],
            warning: {
              showWhen: '(currentOutstanding + grandTotal) > creditLimit',
              icon: {
                type: IconType.IONICONS,
                name: 'warning',
                size: 48,
                color: '#FF3B30',
              },
              title: '⚠️ Credit Limit Exceeded',
              message:
                'This sale will exceed the credit limit. Proceed anyway?',
              confirmText: 'Approve Override',
              cancelText: 'Cancel',
            },
          },
          reminderSection: {
            question: 'Set automatic reminder?',
            questionIcon: {
              type: IconType.IONICONS,
              name: 'notifications',
              size: 20,
              color: '#FF9500',
            },
            options: [
              {
                value: 'yes',
                label: 'Yes, remind {reminderDays} days before',
                icon: {
                  type: IconType.IONICONS,
                  name: 'checkmark-circle',
                  size: 20,
                  color: '#34C759',
                },
                defaultSelected: true,
              },
              {
                value: 'no',
                label: 'No reminder needed',
                icon: {
                  type: IconType.IONICONS,
                  name: 'close-circle',
                  size: 20,
                  color: '#8E8E93',
                },
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
              icon: {
                type: IconType.IONICONS,
                name: 'time',
                size: 20,
              },
            },
          },
          continueButton: {
            text: 'Confirm Credit Terms',
            icon: {
              type: IconType.IONICONS,
              name: 'checkmark',
              size: 20,
            },
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
            icon: {
              type: IconType.IONICONS,
              name: 'calculator',
              size: 24,
              color: '#007AFF',
            },
          },
          sections: [
            {
              id: 'advance-amount-section',
              title: 'Amount paying now',
              titleIcon: {
                type: IconType.IONICONS,
                name: 'cash',
                size: 20,
                color: '#34C759',
              },
              question: 'How much is {customerName} paying now?',
              field: {
                id: 'advanceAmount',
                name: 'advanceAmount',
                type: 'AMOUNT',
                suffix: 'PKR',
                required: true,
                icon: {
                  type: IconType.IONICONS,
                  name: 'cash',
                  size: 24,
                },
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
                {
                  label: '25%',
                  value: 0.25,
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'percent',
                    size: 16,
                  },
                },
                {
                  label: '50%',
                  value: 0.5,
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'percent',
                    size: 16,
                  },
                },
                {
                  label: '75%',
                  value: 0.75,
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'percent',
                    size: 16,
                  },
                },
              ],
              realTimeCalculation: {
                display: [
                  {
                    label: 'Paying now:',
                    value: 'PKR {advanceAmount}',
                    style: 'success',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'arrow-down',
                      size: 16,
                      color: '#34C759',
                    },
                  },
                  {
                    label: 'Remaining:',
                    value: 'PKR {grandTotal - advanceAmount}',
                    style: 'warning',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'time',
                      size: 16,
                      color: '#FF9500',
                    },
                  },
                ],
              },
            },
            {
              id: 'advance-payment-method-section',
              title: 'Payment method for advance',
              titleIcon: {
                type: IconType.IONICONS,
                name: 'card',
                size: 20,
                color: '#007AFF',
              },
              question: 'Payment method for PKR {advanceAmount}?',
              field: {
                id: 'advancePaymentMethod',
                name: 'advancePaymentMethod',
                type: 'RADIO',
                required: true,
                layout: 'compact',
                options: [
                  {
                    value: 'cash',
                    label: 'Cash',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'cash',
                      size: 24,
                      color: '#34C759',
                    },
                  },
                  {
                    value: 'bank',
                    label: 'Bank',
                    icon: {
                      type: IconType.MATERIAL_COMMUNITY,
                      name: 'bank',
                      size: 24,
                      color: '#007AFF',
                    },
                  },
                  {
                    value: 'wallet',
                    label: 'Wallet',
                    icon: {
                      type: IconType.MATERIAL_COMMUNITY,
                      name: 'wallet',
                      size: 24,
                      color: '#5856D6',
                    },
                  },
                  {
                    value: 'cheque',
                    label: 'Cheque',
                    icon: {
                      type: IconType.MATERIAL_COMMUNITY,
                      name: 'checkbook',
                      size: 24,
                      color: '#FF9500',
                    },
                  },
                  {
                    value: 'card',
                    label: 'Card',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'card',
                      size: 24,
                      color: '#FF2D55',
                    },
                  },
                ],
              },
            },
            {
              id: 'remaining-terms-section',
              title: 'Remaining amount terms',
              titleIcon: {
                type: IconType.IONICONS,
                name: 'calendar',
                size: 20,
                color: '#FF9500',
              },
              question: 'When will {customerName} pay the remaining?',
              field: {
                id: 'remainingDueDate',
                name: 'remainingDueDate',
                type: 'DATE',
                required: true,
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 20,
                },
                quickPeriods: [
                  { label: '7 days', value: 7 },
                  { label: '15 days', value: 15 },
                  { label: '30 days', value: 30 },
                ],
              },
              reminderOption: {
                enabled: true,
                icon: {
                  type: IconType.IONICONS,
                  name: 'notifications',
                  size: 18,
                  color: '#FF9500',
                },
              },
            },
          ],
          breakdownDisplay: {
            icon: {
              type: IconType.IONICONS,
              name: 'receipt',
              size: 20,
              color: '#007AFF',
            },
            items: [
              {
                label: 'Total:',
                value: 'PKR {grandTotal}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'calculator',
                  size: 16,
                },
              },
              {
                label: 'Paying now:',
                value: 'PKR {advanceAmount}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'checkmark-circle',
                  size: 16,
                  color: '#34C759',
                },
              },
              { type: 'divider' },
              {
                label: 'Remaining:',
                value: 'PKR {grandTotal - advanceAmount}',
                style: 'bold',
                icon: {
                  type: IconType.IONICONS,
                  name: 'time',
                  size: 16,
                  color: '#FF9500',
                },
              },
              {
                label: 'Due:',
                value: '{remainingDueDate}',
                format: 'date',
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 16,
                },
              },
            ],
          },
          continueButton: {
            text: 'Continue',
            icon: {
              type: IconType.IONICONS,
              name: 'arrow-forward',
              size: 20,
            },
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
            icon: {
              type: IconType.IONICONS,
              name: 'checkmark-circle',
              size: 64,
              color: '#34C759',
            },
            title: '✅ Sale Recorded',
            subtitle: 'Invoice created successfully',
          },
          summaryCard: {
            headerIcon: {
              type: IconType.IONICONS,
              name: 'receipt',
              size: 24,
              color: '#007AFF',
            },
            header: 'INVOICE #{invoiceNumber}',
            metadata: [
              {
                label: 'Date:',
                value: '{invoiceDate}',
                format: 'date',
                icon: {
                  type: IconType.IONICONS,
                  name: 'calendar',
                  size: 16,
                },
              },
              {
                label: 'Customer:',
                value: '{customerName}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'person',
                  size: 16,
                },
              },
            ],
            itemsList: {
              showWhen: 'saleType === "itemized"',
              icon: {
                type: IconType.IONICONS,
                name: 'list',
                size: 18,
              },
              format:
                '{productName}: {quantity} × PKR {pricePerUnit} = PKR {lineTotal}',
            },
            fields: [
              {
                label: 'Subtotal:',
                value: 'PKR {subtotal}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'calculator',
                  size: 16,
                },
              },
              {
                label: 'Discount:',
                value: '- PKR {discount}',
                showWhen: 'discount > 0',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'tag-minus',
                  size: 16,
                  color: '#FF3B30',
                },
              },
              {
                label: 'Tax:',
                value: '+ PKR {tax}',
                showWhen: 'tax > 0',
                icon: {
                  type: IconType.MATERIAL_COMMUNITY,
                  name: 'receipt-text',
                  size: 16,
                  color: '#5856D6',
                },
              },
              { type: 'divider' },
              {
                label: 'Total:',
                value: 'PKR {grandTotal}',
                style: 'bold-large',
                icon: {
                  type: IconType.IONICONS,
                  name: 'cash',
                  size: 20,
                  color: '#34C759',
                },
              },
            ],
            paymentStatus: {
              badges: [
                {
                  condition: 'paymentStatus === "paid"',
                  label: '✅ Paid',
                  color: '#34C759',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'checkmark-circle',
                    size: 16,
                    color: '#34C759',
                  },
                },
                {
                  condition: 'paymentStatus === "credit"',
                  label: '📅 Credit - Due: {dueDate}',
                  color: '#FF9500',
                  format: 'date',
                  icon: {
                    type: IconType.IONICONS,
                    name: 'time',
                    size: 16,
                    color: '#FF9500',
                  },
                },
                {
                  condition: 'paymentStatus === "partial"',
                  label:
                    '💵 Advance: PKR {advanceAmount}, Remaining: PKR {remainingAmount}',
                  color: '#007AFF',
                  icon: {
                    type: IconType.MATERIAL_COMMUNITY,
                    name: 'percent',
                    size: 16,
                    color: '#007AFF',
                  },
                },
              ],
            },
          },
          actionsSection: {
            title: "What's next?",
            titleIcon: {
              type: IconType.IONICONS,
              name: 'options',
              size: 20,
              color: '#007AFF',
            },
            actions: [
              {
                id: 'send-invoice',
                label: 'Send Invoice to {customerName}',
                icon: {
                  type: IconType.IONICONS,
                  name: 'send',
                  size: 24,
                  color: '#007AFF',
                },
                description: 'WhatsApp / SMS / Email',
                navigate: 'share-invoice',
              },
              {
                id: 'generate-pdf',
                label: 'Generate PDF',
                icon: {
                  type: IconType.IONICONS,
                  name: 'document',
                  size: 24,
                  color: '#FF3B30',
                },
                description: 'Download invoice',
                action: 'generate-pdf',
              },
              {
                id: 'print',
                label: 'Print Invoice',
                icon: {
                  type: IconType.IONICONS,
                  name: 'print',
                  size: 24,
                  color: '#5856D6',
                },
                description: 'Print physical copy',
                action: 'print',
              },
              {
                id: 'add-note',
                label: 'Add Note/Memo',
                icon: {
                  type: IconType.IONICONS,
                  name: 'create',
                  size: 24,
                  color: '#FF9500',
                },
                description: 'Optional note',
                navigate: 'add-note',
              },
            ],
          },
          bottomActions: {
            primary: {
              text: '✓ Done',
              icon: {
                type: IconType.IONICONS,
                name: 'checkmark',
                size: 20,
              },
              action: {
                navigate: 'dashboard',
                saveTransaction: true,
              },
            },
            secondary: [
              {
                text: '↩️ Undo',
                icon: {
                  type: IconType.IONICONS,
                  name: 'arrow-undo',
                  size: 18,
                },
                action: {
                  confirmDialog: {
                    title: 'Undo Sale?',
                    message:
                      'This will delete the invoice and reverse all changes.',
                    icon: {
                      type: IconType.IONICONS,
                      name: 'warning',
                      size: 48,
                      color: '#FF3B30',
                    },
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
                icon: {
                  type: IconType.IONICONS,
                  name: 'repeat',
                  size: 18,
                },
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
              stock_impact: '{stockImpact}',
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
          headerIcon: {
            type: IconType.IONICONS,
            name: 'share-social',
            size: 24,
            color: '#007AFF',
          },
          customerInfo: {
            icon: {
              type: IconType.IONICONS,
              name: 'person',
              size: 20,
            },
            fields: [
              {
                label: 'Phone',
                field: 'customer.phone',
                icon: {
                  type: IconType.IONICONS,
                  name: 'call',
                  size: 16,
                },
              },
              {
                label: 'Email',
                field: 'customer.email',
                icon: {
                  type: IconType.IONICONS,
                  name: 'mail',
                  size: 16,
                },
              },
            ],
          },
          shareOptions: [
            {
              id: 'whatsapp',
              label: 'WhatsApp',
              icon: {
                type: IconType.IONICONS,
                name: 'logo-whatsapp',
                size: 32,
                color: '#25D366',
              },
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
              icon: {
                type: IconType.IONICONS,
                name: 'chatbubble',
                size: 32,
                color: '#007AFF',
              },
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
              icon: {
                type: IconType.IONICONS,
                name: 'mail',
                size: 32,
                color: '#FF9500',
              },
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
              icon: {
                type: IconType.IONICONS,
                name: 'download',
                size: 32,
                color: '#5856D6',
              },
              description: 'Save and share manually',
              action: 'download-pdf',
            },
          ],
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

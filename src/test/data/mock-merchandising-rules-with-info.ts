import type { MerchandisingRulesWithInfo } from '@/libs/api';

export const mockMerchandisingRulesWithInfo: MerchandisingRulesWithInfo = {
  pinnedProducts: [
    {
      id: '60183702',
      productId: '60183702',
      metadata: {
        isPinned: true,
      },
      url: 'heatgen-thermal-leggings/p/clp22405750?color=MIDGREYMARL&image=SD_02_T32_7200_QJ_X_EC_0',
      price: '£12.00',
      imageUrl: [
        'SD_02_T32_7200_QJ_X_EC_0',
        'SD_02_T32_7200_QJ_X_EC_0',
        'SD_02_T32_7200_QJ_X_EC_90',
        'SD_02_T32_7200_QJ_X_EC_90',
      ],
      title: 'Heatgen™ Thermal Leggings',
      brand: 'M&S Collection',
      isInStock: true,
    },
    {
      id: '60290408',
      productId: '60290408',
      metadata: {
        isPinned: true,
      },
      url: '2-pair-pack-sumptuously-soft-knee-high-socks/p/clp60194370?color=CHARCOALMIX&image=SD_02_T60_9609_PK_X_EC_0',
      price: '£10.00',
      imageUrl: [
        'SD_02_T60_9609_PK_X_EC_0',
        'SD_02_T60_9609_PK_X_EC_0',
        'SD_02_T60_9609_PK_X_EC_90',
        'SD_02_T60_9609_PK_X_EC_90',
      ],
      title: '2pk Sumptuously Soft™ Thermal Knee High Socks',
      brand: 'M&S Collection',
      isInStock: true,
    },
    {
      id: '60169259',
      productId: '60169259',
      metadata: {
        isPinned: true,
      },
      url: 'heatgen-thermal-long-sleeve-top/p/clp22405753?color=MIDGREYMARL&image=SD_02_T32_9100_QJ_X_EC_0',
      price: '£12.00',
      imageUrl: [
        'SD_02_T32_9100_QJ_X_EC_0',
        'SD_02_T32_9100_QJ_X_EC_0',
        'SD_02_T32_9100_QJ_X_EC_90',
        'SD_02_T32_9100_QJ_X_EC_90',
      ],
      title: 'Heatgen™ Thermal Long Sleeve Top',
      brand: 'M&S Collection',
      isInStock: true,
    },
  ],
  blockedProducts: [],
  boosts: {
    numeric: [
      {
        field: 'newInFreshNess',
        weight: 100,
      },
    ],
    alphanumeric: [
      {
        fields: [
          {
            field: 'colour',
            values: ['Grey'],
          },
        ],
        weight: 100,
      },
    ],
    product: [],
  },
  buries: {
    numeric: [
      {
        field: 'maxPrice',
        weight: 100,
      },
    ],
    alphanumeric: [
      {
        fields: [
          {
            field: 'category.name',
            values: ['Thermals'],
          },
        ],
        weight: 100,
      },
    ],
    product: [],
  },
};

export const mockEmptyMerchandisingRulesWithInfo: MerchandisingRulesWithInfo = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
};

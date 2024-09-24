import {
  ReturnedKeywordRuleSet,
  ReturnedKeywordRuleSets,
  SearchPreviewResponseBeta,
} from '@/libs/api';

export const mockRulesetsList: ReturnedKeywordRuleSets = {
  ruleSets: [
    {
      id: '2b948868-cbe2-4d21-8b8a-0fd713516add',
      isEnabled: false,
      rules: {
        pinnedProducts: [
          {
            id: '60516876',
          },
        ],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },
      lastChanged: {
        date: '2024-09-18T09:46:55Z',
        user: '',
      },
      searchTerms: ['black hiking boots'],
      facets: [],
      excludedFacets: {
        facets: [],
      },
    },
    {
      id: '3394effe-ceda-4bc6-a1d6-ec09673a0549',
      isEnabled: false,
      rules: {
        pinnedProducts: [
          {
            id: '60526178',
          },
        ],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [
            {
              fields: [
                {
                  field: 'colourGroup',
                  values: ['Red'],
                },
              ],
              weight: 100,
            },
          ],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },
      lastChanged: {
        date: '2024-09-16T13:16:06Z',
        user: 'Graham Licence',
      },
      searchTerms: ['coats', 'hats'],
      facets: [],
      excludedFacets: {
        facets: [],
      },
    },
    {
      id: 'abcdcae5-c3c4-455b-aeff-b7d2af65b702',
      isEnabled: true,
      rules: {
        pinnedProducts: [
          {
            id: '22390528',
          },
        ],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [
            {
              fields: [
                {
                  field: 'saleFlag',
                  values: ['true'],
                },
              ],
            },
          ],
        },
        excludes: {
          alphanumeric: [],
        },
      },
      lastChanged: {
        date: '2024-09-04T07:52:37Z',
        user: 'Graham Licence',
      },
      searchTerms: ['sock', 'socks', 'sockz'],
      facets: [],
      excludedFacets: {
        facets: [],
      },
    },
    {
      id: '371733d3-d93a-4220-bcb9-e52cdbbf7245',
      isEnabled: true,
      rules: {
        pinnedProducts: [
          {
            id: '#(productId)',
          },
        ],
        blockedProducts: [],
        boosts: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        buries: {
          numeric: [],
          alphanumeric: [],
          product: [],
        },
        includes: {
          alphanumeric: [],
        },
        excludes: {
          alphanumeric: [],
        },
      },
      lastChanged: {
        date: '2024-09-03T18:16:10Z',
        user: '',
      },
      searchTerms: ['large clogs'],
      facets: [],
      excludedFacets: {
        facets: [],
      },
    },
  ],
  pagination: {
    totalItems: 4,
  },
};

export const mockPreview: SearchPreviewResponseBeta = {
  searchTerm: 'joggers',
  products: [
    {
      id: '60376241',
      productId: 'P60376241',
      title: 'Performance Cuffed Joggers',
      url: 'performance-cuffed-joggers/p/clp60376241?color=BLACK&image=SD_01_T51_6066_Y0_X_EC_90',
      price: '£11.00',
      brand: 'GOODMOVE',
      isInStock: true,
      imageUrl: [
        'SD_01_T51_6066_Y0_X_EC_0',
        'SD_01_T51_6066_Y0_X_EC_0',
        'SD_01_T51_6066_Y0_X_EC_90',
        'SD_01_T51_6066_Y0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '22531198',
      productId: '22531198',
      title: 'Cotton Blend Kindness Slogan Cuffed Joggers',
      url: 'cotton-kindness-slogan-cuffed-joggers/p/clp22531198?color=CREAM&image=SD_10_T82_6308_K0_X_EC_0',
      price: '£17.00',
      brand: "Nobody's Child",
      isInStock: true,
      imageUrl: [
        'SD_10_T82_6308_K0_X_EC_0',
        'SD_10_T82_6308_K0_X_EC_0',
        'SD_10_T82_6308_K0_X_EC_0',
        'SD_10_T82_6308_K0_X_EC_0',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '22531197',
      productId: '22531197',
      title: 'Cotton Blend Embroidered Cuffed Joggers',
      url: 'organic-cotton-embroidered-cuffed-joggers/p/clp22531197?color=PINK&image=SD_10_T82_6307_A0_X_EC_0',
      price: '£17.00',
      brand: "Nobody's Child",
      isInStock: true,
      imageUrl: [
        'SD_10_T82_6307_A0_X_EC_0',
        'SD_10_T82_6307_A0_X_EC_0',
        'SD_10_T82_6307_A0_X_EC_0',
        'SD_10_T82_6307_A0_X_EC_0',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
  ],
  ruleSet: {
    rules: {
      pinnedProducts: [
        {
          id: '22390528',
          productId: '22390528',
          title: '3pk Pure Cotton Socks',
          url: '3-pack-pure-cotton-luxury-mercerised-socks/p/clp22390528?color=BLACK&image=SD_03_T10_7000_Y0_X_EC_0',
          price: '£15.00',
          brand: 'M&S Collection Luxury',
          isInStock: true,
          imageUrl: [
            'SD_03_T10_7000_Y0_X_EC_0',
            'SD_03_T10_7000_Y0_X_EC_0',
            'SD_03_T10_7000_Y0_X_EC_0',
            'SD_03_T10_7000_Y0_X_EC_0',
          ],
          metadata: {
            isPinned: true,
            isBoosted: false,
            isBuried: false,
            isBlocked: false,
          },
        },
      ],
      blockedProducts: [],
      boosts: { numeric: [], alphanumeric: [], product: [] },
      buries: { numeric: [], alphanumeric: [], product: [] },
      includes: { alphanumeric: [] },
      excludes: { alphanumeric: [] },
    },
    facets: [],
  },
  externalChanges: {
    pinnedProducts: [],
    blockedProducts: [
      {
        id: '60099727',
        productId: 'P60099727',
        title: "2pk Boys' Easy Dressing School Shorts (3-14 Yrs)",
        url: '2-pack-boys-adaptive-shorts/p/clp60099727?color=GREY&image=SD_04_T76_4912_T0_X_EC_90',
        price: '£8.00-£12.00',
        brand: 'M&S Collection',
        isInStock: true,
        imageUrl: [
          'SD_04_T76_4912_T0_X_EC_0',
          'SD_04_T76_4912_T0_X_EC_0',
          'SD_04_T76_4912_T0_X_EC_90',
          'SD_04_T76_4912_T0_X_EC_90',
        ],
        metadata: {
          isPinned: false,
          isBoosted: false,
          isBuried: false,
          isBlocked: false,
        },
      },
      {
        id: '60515136',
        productId: 'P60515136',
        title: 'Alphabet Jewellery Box',
        url: 'alphabet-jewellery-box/p/hbp60515136?color=GREY&image=PL_05_T27_8506B_T0_X_EC_90',
        price: '£9.50',
        isInStock: true,
        imageUrl: [
          'PL_05_T27_8506B_T0_X_EC_0',
          'PL_05_T27_8506B_T0_X_EC_0',
          'PL_05_T27_8506B_T0_X_EC_90',
          'PL_05_T27_8506B_T0_X_EC_90',
        ],
        metadata: {
          isPinned: false,
          isBoosted: false,
          isBuried: false,
          isBlocked: false,
        },
      },
    ],
    boosts: {
      numeric: [
        { field: 'predictions.revenueIn1Day.normalisedValue', weight: 6 },
        { field: 'newInFreshNess', weight: 0.25 },
      ],
      alphanumeric: [
        { fields: [{ field: 'brand', values: ['JAEGER'] }], weight: 100 },
      ],
      product: [
        {
          id: '60508654',
          productId: '60508654',
          title: 'Egyptian Cotton Luxury Towel',
          url: 'egyptian-cotton-towel/p/hbp60508646?color=COBALT&image=PL_05_T36_1917E_CB_X_EC_90',
          price: '£2.00-£18.00',
          isInStock: true,
          imageUrl: [
            'PL_05_T36_1917E_CB_X_EC_0',
            'PL_05_T36_1917E_CB_X_EC_0',
            'PL_05_T36_1917E_CB_X_EC_90',
            'PL_05_T36_1917E_CB_X_EC_90',
          ],
          metadata: {
            isPinned: false,
            isBoosted: false,
            isBuried: false,
            isBlocked: false,
          },
          weight: 100,
        },
      ],
    },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: { alphanumeric: [] },
    excludes: { alphanumeric: [] },
  },
  facets: [
    {
      id: 'brand',
      order: 1,
      data: [
        { name: "Nobody's Child", count: 2, selected: false, disabled: false },
        { name: 'GOODMOVE', count: 1, selected: false, disabled: false },
      ],
    },
    {
      id: 'Colour',
      order: 2,
      data: [
        {
          count: 1,
          name: 'Pink',
          colourHexValue: '#FF3399',
          iconValue: 'product.colours.pink',
          disabled: false,
          selected: false,
          hexColourType: true,
          hasHexCode: true,
        },
        {
          count: 1,
          name: 'Black',
          colourHexValue: '#000000',
          iconValue: 'product.colours.black',
          disabled: false,
          selected: false,
          hexColourType: true,
          hasHexCode: true,
        },
        {
          count: 1,
          name: 'Cream',
          colourHexValue: '#FFFFF0',
          iconValue: 'product.colours.cream',
          disabled: false,
          selected: false,
          hexColourType: true,
          hasHexCode: true,
        },
      ],
    },
    {
      id: 'Size',
      order: 3,
      data: [
        { name: '6', count: 3, selected: false, disabled: false },
        { name: '8', count: 2, selected: false, disabled: false },
        { name: '10', count: 3, selected: false, disabled: false },
        { name: '12', count: 2, selected: false, disabled: false },
        { name: '14', count: 2, selected: false, disabled: false },
        { name: '16', count: 2, selected: false, disabled: false },
        { name: '18', count: 2, selected: false, disabled: false },
        { name: '20', count: 1, selected: false, disabled: false },
      ],
    },
    {
      id: 'Price',
      order: 13,
      data: [
        {
          count: 3,
          minimum: 10,
          maximum: 30,
          selected: false,
        },
      ],
    },
  ],
  pagination: { totalItems: 3 },
};

export const mockRuleSet: ReturnedKeywordRuleSet = {
  id: 'abcdcae5-c3c4-455b-aeff-b7d2af65b702',
  isEnabled: true,
  rules: {
    pinnedProducts: [{ id: '22390528' }],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [{ fields: [{ field: 'saleFlag', values: ['true'] }] }],
    },
    excludes: { alphanumeric: [] },
  },
  lastChanged: { date: '2024-09-19T08:11:42Z', user: 'Graham Licence' },
  searchTerms: ['joggers'],
  facets: [],
  excludedFacets: { facets: [] },
};

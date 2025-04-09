import type {
  MerchandisingAttributesResponse,
  MerchandisingProductSearchResponse,
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSets,
  MerchandisingSearchPreviewResponseBeta,
} from '@/libs/api';

export const mockRulesetsList: MerchandisingReturnedKeywordRuleSets = {
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
      facets: [
        {
          id: '4f8d4803-3eb0-11ef-9a6a-000000000000',
          excludedValues: ['NO COLOUR'],
          boosted: ['CHAMPAGNE'],
        },
        {
          id: 'a43271cf-bf57-4e40-8fe3-f3d59f9c4c2e',
          excludedValues: [],
          boosted: ['SC_Level_0_0', 'SC_Level_1_16696340'],
        },
      ],
      excludedFacets: {
        facets: [],
      },
      startDate: '2024-09-12T14:17:54Z',
      endDate: '2024-12-19T04:20:03Z',
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
      facets: [
        {
          id: '4f8ecea1-3eb0-11ef-9a6a-000000000000',
          excludedValues: [],
          boosted: [],
        },
        {
          id: '528e50d2-5f32-4248-868b-72cdce842597',
          excludedValues: ['Brown'],
          boosted: ['Pink', 'Navy', 'Grey', 'Blue', 'Green'],
        },
        {
          id: '08aa7156-7b45-4399-a24f-345f110ed327',
          excludedValues: [],
          boosted: [],
        },
      ],
      excludedFacets: {
        facets: [
          { id: '1e404940-3240-11ef-aa09-000000000000' },
          { id: '1e742a80-3240-11ef-aa09-000000000000' },
        ],
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

export const mockPreview: MerchandisingSearchPreviewResponseBeta = {
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
      id: '225311981',
      productId: '225311981',
      title: 'Cotton Blend Kindness Slogan Cuffed Joggers',
      url: 'cotton-kindness-slogan-cuffed-joggers/p/clp225311981?color=CREAM&image=SD_10_T82_6308_K0_X_EC_0',
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
    {
      id: '22531198',
      productId: '22531198',
      title: 'Cotton Blend Embroidered Joggers',
      url: 'organic-cotton-embroidered-cuffed-joggers/p/clp22531198?color=PINK&image=SD_10_T82_6307_A0_X_EC_0',
      price: '£7.00',
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

export const mockPreviewIE: MerchandisingSearchPreviewResponseBeta = {
  searchTerm: 'joggers',
  products: [
    {
      id: '60120228',
      productId: 'P60120228',
      title: 'Cotton Rich Straight Leg Joggers',
      url: '/cotton-rich-straight-leg-joggers/p/clp22511885?color=BLACK&image=SD_01_T57_6660_Y0_X_EC_90',
      price: '€18.00-€20.00',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T57_6660_Y0_X_EC_0',
        'SD_01_T57_6660_Y0_X_EC_0',
        'SD_01_T57_6660_Y0_X_EC_90',
        'SD_01_T57_6660_Y0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60120220',
      productId: '60120220',
      title: 'Straight Leg Joggers',
      url: '/cotton-rich-straight-leg-joggers/p/clp22511885?color=NAVY&image=SD_01_T57_6660_F0_X_EC_90',
      price: '€18.00-€20.00',
      brand: "Nobody's Child",
      isInStock: true,
      imageUrl: [
        'SD_01_T57_6660_F0_X_EC_90',
        'SD_01_T57_6660_F0_X_EC_90',
        'SD_01_T57_6660_F0_X_EC_90',
        'SD_01_T57_6660_F0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60205122',
      price: '€11.50',
      productId: '60205122',
      title: 'Cotton Rich Draw Cord Joggers (2-7 Yrs)',
      url: '/draw-cord-joggers-3-months-7-years-/p/clp60207154?color=NAVY&image=SD_04_T88_2834B_F0_X_EC_90',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_04_T88_2834B_F0_X_EC_0',
        'SD_04_T88_2834B_F0_X_EC_0',
        'SD_04_T88_2834B_F0_X_EC_90',
        'SD_04_T88_2834B_F0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60442866',
      productId: '60442866',
      title: 'Cotton Rich Draw Cord Joggers (2-7 Yrs)',
      url: '/draw-cord-joggers-3-months-7-years-/p/clp60207154?color=BLACKMIX&image=SD_04_T88_2834B_Y4_X_EC_90',
      price: '€11.50',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_04_T88_2834B_Y4_X_EC_0',
        'SD_04_T88_2834B_Y4_X_EC_0',
        'SD_04_T88_2834B_Y4_X_EC_90',
        'SD_04_T88_2834B_Y4_X_EC_90',
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
    facets: [
      {
        id: '4f8d4803-3eb0-11ef-9a6a-000000000000',
        excludedValues: ['NO COLOUR'],
        boosted: ['CHAMPAGNE'],
      },
      {
        id: 'a43271cf-bf57-4e40-8fe3-f3d59f9c4c2e',
        excludedValues: [],
        boosted: ['SC_Level_0_0', 'SC_Level_1_16696340'],
      },
    ],
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

export const mockRuleSet: MerchandisingReturnedKeywordRuleSet = {
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
  facets: [
    {
      id: '4f8d4803-3eb0-11ef-9a6a-000000000000',
      excludedValues: ['NO COLOUR'],
      boosted: ['CHAMPAGNE'],
    },
    {
      id: 'a43271cf-bf57-4e40-8fe3-f3d59f9c4c2e',
      excludedValues: [],
      boosted: ['SC_Level_0_0', 'SC_Level_1_16696340'],
    },
  ],
  excludedFacets: { facets: [] },
  startDate: '2024-09-12T14:17:54Z',
  endDate: '2024-12-19T04:20:03Z',
};

export const mockProducts: MerchandisingProductSearchResponse = {
  products: [
    {
      id: '60529550',
      productId: '60529550',
      title: 'V-Neck Knee Length Swing Dress',
      url: 'v-neck-knee-length-smock-dress/p/clp60529552?color=BLACK&image=SD_10_T97_6310B_Y0_X_EC_90',
      price: '£125.00',
      brand: 'JAEGER',
      isInStock: true,
      imageUrl: [
        'SD_10_T97_6310B_Y0_X_EC_0',
        'SD_10_T97_6310B_Y0_X_EC_0',
        'SD_10_T97_6310B_Y0_X_EC_90',
        'SD_10_T97_6310B_Y0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: true,
        isBuried: false,
        isBlocked: false,
      },
    },

    {
      id: '22531022',
      productId: '22531022',
      title: 'Swing Dress',
      url: 'swing-dress/p/clp22531022?color=BLACKMIX&image=SD_10_T83_5439_Y4_X_EC_90',
      price: '£89.00',
      brand: 'Phase Eight',
      isInStock: true,
      imageUrl: [
        'SD_10_T83_5439_Y4_X_EC_90',
        'SD_10_T83_5439_Y4_X_EC_90',
        'SD_10_T83_5439_Y4_X_EC_90',
        'SD_10_T83_5439_Y4_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '22530754',
      productId: '22530754',
      title: 'Cord Shirt Dress',
      url: 'cord-shirt-dress/p/clp22530754?color=PINK&image=SD_10_T83_5732_A0_X_EC_90',
      price: '£59.50',
      brand: 'FatFace',
      isInStock: true,
      imageUrl: [
        'SD_10_T83_5732_A0_X_EC_0',
        'SD_10_T83_5732_A0_X_EC_0',
        'SD_10_T83_5732_A0_X_EC_90',
        'SD_10_T83_5732_A0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60534443',
      productId: '60534443',
      title: 'Shirred Midi Smock Dress',
      url: 'shirred-midi-smock-dress/p/clp60534443?color=BLACK&image=SD_01_T69_1196_Y0_X_EC_90',
      price: '£45.00',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T69_1196_Y0_X_EC_0',
        'SD_01_T69_1196_Y0_X_EC_0',
        'SD_01_T69_1196_Y0_X_EC_90',
        'SD_01_T69_1196_Y0_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60506901',
      productId: '60506901',
      title: 'Floral Midi Waisted Dress',
      url: 'floral-midi-waisted-dress/p/clp60506901?color=NAVYMIX&image=SD_01_T42_4755_F4_X_EC_90',
      price: '£39.50',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T42_4755_F4_X_EC_0',
        'SD_01_T42_4755_F4_X_EC_0',
        'SD_01_T42_4755_F4_X_EC_90',
        'SD_01_T42_4755_F4_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60533510',
      productId: 'P60533510',
      title: 'Floral Midi Waisted Dress',
      url: 'floral-midi-waisted-dress/p/clp60533510?color=BLUEMIX&image=SD_01_T69_1192_E4_X_EC_90',
      price: '£45.00',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T69_1192_E4_X_EC_0',
        'SD_01_T69_1192_E4_X_EC_0',
        'SD_01_T69_1192_E4_X_EC_90',
        'SD_01_T69_1192_E4_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60534411',
      productId: 'P60533510',
      title: 'Floral Midi Waisted Dress',
      url: 'floral-midi-waisted-dress/p/clp60533510?color=MULTI&image=SD_01_T69_1192_ZZ_X_EC_90',
      price: '£45.00',
      brand: 'M&S Collection',
      isInStock: true,
      imageUrl: [
        'SD_01_T69_1192_ZZ_X_EC_0',
        'SD_01_T69_1192_ZZ_X_EC_0',
        'SD_01_T69_1192_ZZ_X_EC_90',
        'SD_01_T69_1192_ZZ_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '60530380',
      productId: 'P60530380',
      title: 'Satin Midi Tea Dress',
      url: 'satin-midi-tea-dress/p/clp60530380?color=OLIVE&image=SD_01_T69_6085_JR_X_EC_90',
      price: '£79.00',
      brand: 'M&S X GHOST',
      isInStock: true,
      imageUrl: [
        'SD_01_T69_6085_JR_X_EC_0',
        'SD_01_T69_6085_JR_X_EC_0',
        'SD_01_T69_6085_JR_X_EC_90',
        'SD_01_T69_6085_JR_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '22532311',
      productId: '22532311',
      title: 'Sequin Mini Shift Dress',
      url: 'sequin-mini-shift-dress/p/clp22532311?color=BLACKMIX&image=SD_10_T83_3103_Y4_X_EC_90',
      price: '£149.00',
      brand: 'HOBBS',
      isInStock: true,
      imageUrl: [
        'SD_10_T83_3103_Y4_X_EC_0',
        'SD_10_T83_3103_Y4_X_EC_0',
        'SD_10_T83_3103_Y4_X_EC_90',
        'SD_10_T83_3103_Y4_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '22532683',
      productId: 'P22532683',
      title: 'Ditsy Floral Shirt Dress',
      url: 'ditsy-floral-shirt-dress/p/clp22532683?color=GREYMIX&image=SD_10_T83_8880_T4_X_EC_90',
      price: '£59.00',
      brand: 'White Stuff',
      isInStock: true,
      imageUrl: [
        'SD_10_T83_8880_T4_X_EC_0',
        'SD_10_T83_8880_T4_X_EC_0',
        'SD_10_T83_8880_T4_X_EC_90',
        'SD_10_T83_8880_T4_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
    {
      id: '22531286',
      productId: '22531286',
      title: 'Floral Midi Waisted Dress',
      url: 'cotton-floral-midi-waisted-dress/p/clp22531286?color=NAVYMIX&image=SD_10_T83_6647_F4_X_EC_90',
      price: '£55.00',
      brand: 'White Stuff',
      isInStock: true,
      imageUrl: [
        'SD_10_T83_6647_F4_X_EC_0',
        'SD_10_T83_6647_F4_X_EC_0',
        'SD_10_T83_6647_F4_X_EC_90',
        'SD_10_T83_6647_F4_X_EC_90',
      ],
      metadata: {
        isPinned: false,
        isBoosted: false,
        isBuried: false,
        isBlocked: false,
      },
    },
  ],
  pagination: { totalItems: 130 },
};

export const mockCategoryNumericAttributes: MerchandisingAttributesResponse = {
  attributes: [
    {
      name: 'predictions.salesIn1Day.normalisedValue',
      type: 'numeric',
    },
    {
      name: 'newInFreshNess',
      type: 'numeric',
    },
  ],
};

export const mockCategoryAlphanumericAttributes: MerchandisingAttributesResponse =
  {
    attributes: [
      {
        name: 'offerFlag',
        type: 'alphanumeric',
        values: [
          {
            value: '0',
          },
          {
            value: '1',
          },
        ],
      },
      {
        name: 'fit',
        type: 'alphanumeric',
        values: [
          {
            value: 'Regular fit',
          },
          {
            value: 'Relaxed fit',
          },
          {
            value: 'Fitted',
          },
          {
            value: 'Straight leg',
          },
        ],
      },
    ],
  };

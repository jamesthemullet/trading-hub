import type {
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingReturnedGlobalRuleSet,
} from '@/libs/api';

export const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';
const categoryId = 'SubCategory_428';
const product1Id = 'a1';
const product2Id = 'b2';
const product3Id = 'c2';
const product1Title = 'first product';
const product2Title = 'second product';
const product3Title = 'third product';
const product1Brand = 'Monsoon';
const product2Brand = 'M&S';
const product1Price = '£5';
const product2Price = '£10';

const mockRuleData: MerchandisingReturnedCategoryRuleSet = {
  id: ruleSetId,
  countryCode: 'UK_IE',
  categoriesInfo: [
    {
      id: categoryId,
    },
  ],
  isEnabled: false,
  lastChanged: {
    date: '',
    user: '',
  },
  rules: {
    pinnedProducts: [{ id: product1Id }],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  facets: [
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a84',
      boosted: ['test include'],
      excludedValues: ['test exclude'],
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
      boosted: [],
      excludedValues: [],
    },
  ],
  excludedFacets: {
    facets: [
      {
        id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a88',
      },
    ],
  },
};

export const mockUseRuleSetPreviewData = {
  ruleSetDetail: mockRuleData,
  products: [
    {
      id: product1Id,
      productId: product1Id,
      title: product1Title,
      imageUrl: ['example1.jpg'],
      brand: product1Brand,
      metadata: { isPinned: false },
      isInStock: true,
      price: product1Price,
      url: '',
    },
    {
      id: product2Id,
      productId: product2Id,
      title: product2Title,
      imageUrl: ['example2.jpg'],
      brand: product2Brand,
      metadata: { isPinned: false },
      isInStock: true,
      price: product2Price,
      url: '',
    },
    {
      id: product3Id,
      productId: product3Id,
      title: product3Title,
      imageUrl: ['example.jpg'],
      brand: 'brand',
      metadata: { isPinned: false },
      isInStock: true,
      price: '£10',
      url: '',
    },
  ],
  error: '',
  facets: [],
  isLoading: false,
  refreshRuleset: () => {},
};

export const mockGlobalRuleData: MerchandisingReturnedGlobalRuleSet = {
  rules: {
    pinnedProducts: [{ id: 'xyz0' }],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
    includes: {
      alphanumeric: [],
    },
    excludes: {
      alphanumeric: [],
    },
  },
  isEnabled: true,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

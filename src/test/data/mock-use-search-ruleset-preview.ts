import { MerchandisingReturnedKeywordRuleSet } from '@/libs/api';

const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';
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

const mockRuleData: MerchandisingReturnedKeywordRuleSet = {
  searchTerms: ['foo', 'bar'],
  countryCode: 'UK_IE',
  id: ruleSetId,
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
      excludedValues: ['Brown'],
      boosted: ['Pink', 'Navy', 'Grey', 'Blue', 'Green'],
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a85',
      excludedValues: [],
      boosted: [],
    },
    {
      id: 'b04eaac3-f4ea-4f21-9459-0b4302dc2a86',
      excludedValues: [],
      boosted: [],
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

export const mockUseSearchRuleSetPreviewData = {
  ruleSet: mockRuleData,

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
};

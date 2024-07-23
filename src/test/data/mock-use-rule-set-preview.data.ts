export const ruleSetId = '090152b8-2517-4e42-a5f3-48fcab8d9942';
export const categoryId = 'SubCategory_428';
export const product1Id = 'a1';
export const product2Id = 'b2';
export const product3Id = 'c2';
export const product1Title = 'first product';
export const product2Title = 'second product';
export const product3Title = 'third product';
export const product1Brand = 'Monsoon';
export const product2Brand = 'M&S';
export const product1Price = '£5';
export const product2Price = '£10';

export const mockUseRuleSetPreviewData = {
  ruleSetDetail: {
    categoryId: categoryId,
    categoryName: 'Cat Name',
    id: ruleSetId,
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
    },
  },
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

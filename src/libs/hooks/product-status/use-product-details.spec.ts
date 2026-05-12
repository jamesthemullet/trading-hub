import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

import { getProductDetails, ProductError } from './use-product-details';

const mockProduct = {
  id: 'p1',
  productId: '60538523',
  title: 'Test Product',
  price: '£10.00',
  imageUrl: ['image1.jpg'],
  isInStock: true,
  brand: 'M&S',
  url: 'https://example.com',
  metadata: { isPinned: false },
};

const onlineData: BetaMerchandisingProductDiagnosticsListData = {
  products: [mockProduct],
  pagination: { totalItems: 1 },
  issues: [],
};

const productAssemblyErrorData: BetaMerchandisingProductDiagnosticsListData = {
  products: [],
  pagination: { totalItems: 0 },
  issues: [
    {
      reason: ProductError.AssemblyFailed,
      action:
        'Contact the Product Domain team to investigate the assembly service.',
    },
    {
      reason: ProductError.DataUnavailable,
      action: 'Check the data pipeline and retry once the data is available.',
    },
  ],
};

const otherErrorData: BetaMerchandisingProductDiagnosticsListData = {
  products: [],
  pagination: { totalItems: 0 },
  issues: [
    {
      reason: 'Product is not marked saleable in Product Assembly',
      action:
        'Contact the Product Domain team to mark the product as saleable.',
    },
  ],
};

describe('getProductDetails', () => {
  describe('online product', () => {
    const { isIndexed, product, sections } = getProductDetails(onlineData);

    it('should return online product with all sections operational', () => {
      expect(isIndexed).toBe(true);
      expect(product?.productId).toBe('60538523');
      expect(sections.productAssembly.status).toBe('operational');
      expect(sections.availability.status).toBe('operational');
      expect(sections.saleability.status).toBe('operational');
      expect(sections.associatedRules.status).toBe('operational');
      expect(sections.productAssembly.issues).toHaveLength(0);
    });

    it('should populate productAssembly content with product details', () => {
      const labels = sections.productAssembly.content.map((d) => d.label);
      expect(labels).toContain('Brand');
      expect(labels).toContain('Price range');
      expect(labels).toContain('URL');
    });
  });

  describe('Failed to get product data error', () => {
    const { isIndexed, sections } = getProductDetails(productAssemblyErrorData);

    it('should set productAssembly to issue-detected and populate all issues', () => {
      expect(isIndexed).toBe(false);
      expect(sections.productAssembly.status).toBe('issue-detected');
      expect(sections.productAssembly.issues).toHaveLength(2);
      expect(sections.productAssembly.issues[0].reason).toBe(
        ProductError.AssemblyFailed
      );
    });

    it('should set downstream sections to blocked with null content', () => {
      expect(sections.availability.status).toBe('blocked');
      expect(sections.availability.content).toBeNull();
      expect(sections.saleability.status).toBe('blocked');
      expect(sections.saleability.content).toBeNull();
      expect(sections.associatedRules.status).toBe('blocked');
      expect(sections.associatedRules.content).toBeNull();
    });
  });

  describe('out of stock error', () => {
    const outOfStockData: BetaMerchandisingProductDiagnosticsListData = {
      products: [mockProduct],
      pagination: { totalItems: 1 },
      issues: [
        {
          reason: ProductError.OutOfStock,
          action: 'Wait for the product to be restocked.',
        },
      ],
    };

    const { sections } = getProductDetails(outOfStockData);

    it('should set productAssembly to blocked with no issues', () => {
      expect(sections.productAssembly.status).toBe('blocked');
      expect(sections.productAssembly.issues).toHaveLength(0);
    });

    it('should set availability to issue-detected and downstream sections to blocked', () => {
      expect(sections.availability.status).toBe('issue-detected');
      expect(sections.availability.issues).toHaveLength(1);
      expect(sections.availability.issues[0].reason).toBe(
        ProductError.OutOfStock
      );
      expect(sections.availability.issues[0].type).toBe('error');
      expect(sections.saleability.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });
  });

  describe('Product data is not available error', () => {
    const dataUnavailableData: BetaMerchandisingProductDiagnosticsListData = {
      products: [],
      pagination: { totalItems: 0 },
      issues: [
        {
          reason: ProductError.DataUnavailable,
          action: 'Check the data pipeline.',
        },
      ],
    };

    it('should set productAssembly to issue-detected and downstream sections to blocked', () => {
      const { sections } = getProductDetails(dataUnavailableData);
      expect(sections.productAssembly.status).toBe('issue-detected');
      expect(sections.availability.status).toBe('blocked');
      expect(sections.saleability.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });
  });

  describe('not indexed — push-available', () => {
    const notIndexedData: BetaMerchandisingProductDiagnosticsListData = {
      products: [],
      pagination: { totalItems: 0 },
      issues: [],
    };

    const { sections } = getProductDetails(notIndexedData);

    it('should set productAssembly to push-available with not-indexed warning', () => {
      expect(sections.productAssembly.status).toBe('push-available');
      expect(sections.productAssembly.issues).toHaveLength(1);
      expect(sections.productAssembly.issues[0].reason).toBe(
        ProductError.NotIndexed
      );
      expect(sections.productAssembly.issues[0].type).toBe('warning');
    });

    it('should set availability, saleability and associatedRules to waiting', () => {
      expect(sections.availability.status).toBe('waiting');
      expect(sections.saleability.status).toBe('waiting');
      expect(sections.associatedRules.status).toBe('waiting');
    });
  });

  describe('other errors (default case)', () => {
    it('should set productAssembly to operational and map issue with error type', () => {
      const { sections } = getProductDetails(otherErrorData);
      expect(sections.productAssembly.status).toBe('operational');
      expect(sections.productAssembly.issues[0].reason).toBe(
        'Product is not marked saleable in Product Assembly'
      );
    });
  });

  describe('ranking attributes', () => {
    it('should include ranking attributes in productAssembly content when present', () => {
      const dataWithRanking: BetaMerchandisingProductDiagnosticsListData = {
        ...onlineData,
        products: [
          {
            ...mockProduct,
            metadata: {
              isPinned: false,
              ranking: [
                { property: 'Predicted Revenue Score', values: ['0.85'] },
                { property: 'Days Since Launch', values: ['42'] },
              ],
            },
          },
        ],
      };
      const { sections } = getProductDetails(dataWithRanking);
      const labels = sections.productAssembly.content.map((d) => d.label);
      expect(labels).toContain('Predicted Revenue Score');
      expect(labels).toContain('Days since launch');
    });
  });

  describe('optional product fields', () => {
    it('should include Rating when present on the product', () => {
      const dataWithRating: BetaMerchandisingProductDiagnosticsListData = {
        ...onlineData,
        products: [
          { ...mockProduct, rating: '4.5' } as typeof mockProduct & {
            rating: string;
          },
        ],
      };
      const { sections } = getProductDetails(dataWithRating);
      expect(sections.productAssembly.content.map((d) => d.label)).toContain(
        'Rating'
      );
    });
  });
});

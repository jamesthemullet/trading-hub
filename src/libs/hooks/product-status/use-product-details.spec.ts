import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';

import { ProductError, useProductDetails } from './use-product-details';

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

describe('useProductDetails', () => {
  describe('online product', () => {
    it('should set isOnline to true', () => {
      const { isOnline } = useProductDetails(onlineData);
      expect(isOnline).toBe(true);
    });

    it('should return the first product', () => {
      const { product } = useProductDetails(onlineData);
      expect(product?.productId).toBe('60538523');
    });

    it('should set all sections to operational', () => {
      const { sections } = useProductDetails(onlineData);
      expect(sections.productAssembly.status).toBe('operational');
      expect(sections.availability.status).toBe('operational');
      expect(sections.saleability.status).toBe('operational');
      expect(sections.associatedRules.status).toBe('operational');
    });

    it('should populate productAssembly content with product details', () => {
      const { sections } = useProductDetails(onlineData);
      const labels = sections.productAssembly.content.map((d) => d.label);
      expect(labels).toContain('Brand');
      expect(labels).toContain('Price range');
      expect(labels).toContain('URL');
    });

    it('should have no issues in any section', () => {
      const { sections } = useProductDetails(onlineData);
      expect(sections.productAssembly.issues).toHaveLength(0);
      expect(sections.availability.issues).toHaveLength(0);
    });
  });

  describe('Failed to get product data error', () => {
    it('should set isOnline to false', () => {
      const { isOnline } = useProductDetails(productAssemblyErrorData);
      expect(isOnline).toBe(false);
    });

    it('should set productAssembly status to issue-detected', () => {
      const { sections } = useProductDetails(productAssemblyErrorData);
      expect(sections.productAssembly.status).toBe('issue-detected');
    });

    it('should populate productAssembly issues with all issues', () => {
      const { sections } = useProductDetails(productAssemblyErrorData);
      expect(sections.productAssembly.issues).toHaveLength(2);
      expect(sections.productAssembly.issues[0].reason).toBe(
        ProductError.AssemblyFailed
      );
    });

    it('should set availability, saleability and associatedRules to blocked', () => {
      const { sections } = useProductDetails(productAssemblyErrorData);
      expect(sections.availability.status).toBe('blocked');
      expect(sections.saleability.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });

    it('should set blocked sections content to null', () => {
      const { sections } = useProductDetails(productAssemblyErrorData);
      expect(sections.availability.content).toBeNull();
      expect(sections.saleability.content).toBeNull();
      expect(sections.associatedRules.content).toBeNull();
    });
  });

  describe('Product data is not available error', () => {
    const dataUnavailableData: BetaMerchandisingProductDiagnosticsListData = {
      products: [],
      pagination: { totalItems: 0 },
      issues: [
        {
          reason: ProductError.DataUnavailable,
          action:
            'Check the data pipeline and retry once the data is available.',
        },
      ],
    };

    it('should set productAssembly status to issue-detected', () => {
      const { sections } = useProductDetails(dataUnavailableData);
      expect(sections.productAssembly.status).toBe('issue-detected');
    });

    it('should set availability, saleability and associatedRules to blocked', () => {
      const { sections } = useProductDetails(dataUnavailableData);
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

    it('should set productAssembly status to push-available when offline with no issues', () => {
      const { sections } = useProductDetails(notIndexedData);
      expect(sections.productAssembly.status).toBe('push-available');
    });

    it('should populate productAssembly issues with the not-indexed warning', () => {
      const { sections } = useProductDetails(notIndexedData);
      expect(sections.productAssembly.issues).toHaveLength(1);
      expect(sections.productAssembly.issues[0].reason).toBe(
        ProductError.NotIndexed
      );
      expect(sections.productAssembly.issues[0].type).toBe('warning');
    });

    it('should set other sections to waiting', () => {
      const { sections } = useProductDetails(notIndexedData);
      expect(sections.availability.status).toBe('waiting');
      expect(sections.saleability.status).toBe('waiting');
      expect(sections.associatedRules.status).toBe('waiting');
    });
  });

  describe('other errors (default case)', () => {
    it('should enter the default switch branch for unknown errors', () => {
      const { sections } = useProductDetails(otherErrorData);
      expect(sections.productAssembly.issues).toHaveLength(1);
      expect(sections.productAssembly.issues[0].reason).toBe(
        'Product is not marked saleable in Product Assembly'
      );
    });
  });

  describe('ranking attributes', () => {
    it('should include Predicted Revenue Score when present in metadata', () => {
      const dataWithRanking: BetaMerchandisingProductDiagnosticsListData = {
        ...onlineData,
        products: [
          {
            ...mockProduct,
            metadata: {
              isPinned: false,
              ranking: [
                { property: 'Predicted Revenue Score', values: ['0.85'] },
              ],
            },
          },
        ],
      };
      const { sections } = useProductDetails(dataWithRanking);
      const labels = sections.productAssembly.content.map((d) => d.label);
      expect(labels).toContain('Predicted Revenue Score');
    });

    it('should include Days since launch when present in metadata', () => {
      const dataWithRanking: BetaMerchandisingProductDiagnosticsListData = {
        ...onlineData,
        products: [
          {
            ...mockProduct,
            metadata: {
              isPinned: false,
              ranking: [{ property: 'Days Since Launch', values: ['42'] }],
            },
          },
        ],
      };
      const { sections } = useProductDetails(dataWithRanking);
      const labels = sections.productAssembly.content.map((d) => d.label);
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
      const { sections } = useProductDetails(dataWithRating);
      const labels = sections.productAssembly.content.map((d) => d.label);
      expect(labels).toContain('Rating');
    });
  });
});

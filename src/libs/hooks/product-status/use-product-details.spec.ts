import type { GetProductDiagnosticsData } from '@/libs/api/generated/open-api';

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

const onlineData: GetProductDiagnosticsData = {
  products: [mockProduct],
  pagination: { totalItems: 1 },
  issues: [],
};

describe('getProductDetails', () => {
  describe('online — no issues', () => {
    const { isIndexed, product, sections } = getProductDetails(onlineData);

    it('should return online product with all sections operational', () => {
      expect(isIndexed).toBe(true);
      expect(product?.productId).toBe('60538523');
      expect(sections.productAssembly.status).toBe('operational');
      expect(sections.availability.status).toBe('operational');
      expect(sections.saleability.status).toBe('operational');
      expect(sections.productAssembly.issues).toHaveLength(0);
    });

    it('should populate productAssembly content with product details', () => {
      const labels = sections.productAssembly.content.map((d) => d.label);
      expect(labels).toContain('Brand');
      expect(labels).toContain('Price range');
      expect(labels).toContain('URL');
    });
  });

  describe('not indexed — push-available', () => {
    const notIndexedData: GetProductDiagnosticsData = {
      products: [],
      pagination: { totalItems: 0 },
      issues: [],
    };

    const { isIndexed, sections } = getProductDetails(notIndexedData);

    it('should set productAssembly to push-available with not-indexed warning', () => {
      expect(isIndexed).toBe(false);
      expect(sections.productAssembly.status).toBe('push-available');
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

  describe('out of stock', () => {
    const outOfStockData: GetProductDiagnosticsData = {
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

    it('should set availability to issue-detected and all other sections to blocked', () => {
      expect(sections.availability.status).toBe('issue-detected');
      expect(sections.availability.issues[0].reason).toBe(
        ProductError.OutOfStock
      );
      expect(sections.availability.issues[0].type).toBe('error');
      expect(sections.productAssembly.status).toBe('blocked');
      expect(sections.saleability.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });
  });

  describe('not saleable', () => {
    const notSaleableData: GetProductDiagnosticsData = {
      products: [mockProduct],
      pagination: { totalItems: 1 },
      issues: [
        { reason: ProductError.NotSaleable, action: 'Mark as saleable.' },
      ],
    };

    const { sections } = getProductDetails(notSaleableData);

    it('should set saleability to issue-detected and all other sections to blocked', () => {
      expect(sections.saleability.status).toBe('issue-detected');
      expect(sections.saleability.issues[0].reason).toBe(
        ProductError.NotSaleable
      );
      expect(sections.saleability.issues[0].type).toBe('error');
      expect(sections.productAssembly.status).toBe('blocked');
      expect(sections.availability.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });
  });

  describe('out of stock and not saleable combined', () => {
    const combinedData: GetProductDiagnosticsData = {
      products: [mockProduct],
      pagination: { totalItems: 1 },
      issues: [
        { reason: ProductError.OutOfStock, action: 'Wait for restock.' },
        { reason: ProductError.NotSaleable, action: 'Mark as saleable.' },
      ],
    };

    const { sections } = getProductDetails(combinedData);

    it('should set both affected sections to issue-detected and remaining to blocked', () => {
      expect(sections.availability.status).toBe('issue-detected');
      expect(sections.availability.issues[0].reason).toBe(
        ProductError.OutOfStock
      );
      expect(sections.saleability.status).toBe('issue-detected');
      expect(sections.saleability.issues[0].reason).toBe(
        ProductError.NotSaleable
      );
      expect(sections.productAssembly.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });
  });

  describe('unknown issues', () => {
    const unknownIssueData: GetProductDiagnosticsData = {
      products: [mockProduct],
      pagination: { totalItems: 1 },
      issues: [{ reason: 'Some unexpected issue', action: 'Contact support.' }],
    };

    const { sections } = getProductDetails(unknownIssueData);

    it('should route unknown issues to productAssembly and block all downstream sections', () => {
      expect(sections.productAssembly.status).toBe('issue-detected');
      expect(sections.productAssembly.issues[0].reason).toBe(
        'Some unexpected issue'
      );
      expect(sections.availability.status).toBe('blocked');
      expect(sections.saleability.status).toBe('blocked');
      expect(sections.associatedRules.status).toBe('blocked');
    });
  });

  describe('ranking attributes', () => {
    it('should include ranking attributes in productAssembly content when present', () => {
      const dataWithRanking: GetProductDiagnosticsData = {
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
      const dataWithRating: GetProductDiagnosticsData = {
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

import { fireEvent, screen } from '@testing-library/react';

import type { BetaMerchandisingProductDiagnosticsListData } from '@/libs/api/generated/open-api';
import { renderWithProviders } from '@/test/render-with-providers';

jest.mock('@/libs/hooks/product-status/use-product-details', () => ({
  ...jest.requireActual('@/libs/hooks/product-status/use-product-details'),
  useProductDetails: jest.fn(),
}));

import { useProductDetails } from '@/libs/hooks/product-status/use-product-details';

import { ProductResult } from './product-result';

const mockUseProductDetails = useProductDetails as jest.MockedFunction<
  typeof useProductDetails
>;

const blockedSections = {
  productAssembly: { content: [], issues: [], status: 'blocked' as const },
  availability: { content: null, issues: [], status: 'blocked' as const },
  saleability: { content: null, issues: [], status: 'blocked' as const },
  associatedRules: { content: null, issues: [], status: 'blocked' as const },
};

const baseProduct = {
  id: 'p1',
  productId: '60538523',
  title: 'Green Wool Coat',
  price: '£89.00',
  isInStock: true,
  metadata: { isPinned: false },
};

const onlineData = (
  imageUrl: string[] = []
): BetaMerchandisingProductDiagnosticsListData => ({
  products: [{ ...baseProduct, imageUrl }],
  pagination: { totalItems: 1 },
  issues: [],
});

const offlineData = (
  issues: { reason: string; action: string }[]
): BetaMerchandisingProductDiagnosticsListData => ({
  products: [],
  pagination: { totalItems: 0 },
  issues,
});

beforeEach(() => {
  mockUseProductDetails.mockImplementation(
    jest.requireActual('@/libs/hooks/product-status/use-product-details')
      .useProductDetails
  );
});

describe('ProductResult', () => {
  describe('product ID display', () => {
    it('should prepend P when productId does not include it', () => {
      renderWithProviders(
        <ProductResult query="60538523" data={onlineData()} />
      );
      expect(screen.getByText('P60538523')).toBeVisible();
    });

    it('should not double the P when productId already includes it', () => {
      const dataWithPrefixed: BetaMerchandisingProductDiagnosticsListData = {
        products: [{ ...baseProduct, productId: 'P60538523', imageUrl: [] }],
        pagination: { totalItems: 1 },
        issues: [],
      };
      renderWithProviders(
        <ProductResult query="60538523" data={dataWithPrefixed} />
      );
      expect(screen.getByText('P60538523')).toBeVisible();
      expect(screen.queryByText('PP60538523')).not.toBeInTheDocument();
    });
  });

  describe('online product', () => {
    it('should render the product title', () => {
      renderWithProviders(
        <ProductResult query="60538523" data={onlineData()} />
      );
      expect(screen.getByText('Green Wool Coat')).toBeVisible();
    });

    it('should render the product image when imageUrl is present', () => {
      renderWithProviders(
        <ProductResult query="60538523" data={onlineData(['image1.jpg'])} />
      );
      expect(screen.getByAltText('Green Wool Coat')).toBeInTheDocument();
    });

    it('should render the placeholder when imageUrl is empty', () => {
      const { container } = renderWithProviders(
        <ProductResult query="60538523" data={onlineData()} />
      );
      expect(container.querySelector('.imagePlaceholder')).toBeInTheDocument();
    });

    it('should render the placeholder when the image fails to load', async () => {
      const { container } = renderWithProviders(
        <ProductResult query="60538523" data={onlineData(['broken.jpg'])} />
      );
      const img = screen.getByAltText('Green Wool Coat');
      fireEvent.error(img);
      expect(container.querySelector('.imagePlaceholder')).toBeInTheDocument();
      expect(screen.queryByAltText('Green Wool Coat')).not.toBeInTheDocument();
    });

    it('should show "Product is operational" badge', () => {
      renderWithProviders(
        <ProductResult query="60538523" data={onlineData()} />
      );
      expect(screen.getByText('Product is operational')).toBeVisible();
    });

    it('should show the info box hint when online with no issues', () => {
      renderWithProviders(
        <ProductResult query="60538523" data={onlineData()} />
      );
      expect(
        screen.getByText("Can't see this on the website yet?")
      ).toBeVisible();
    });
  });

  describe('offline product — AssemblyFailed', () => {
    it('should show "Title not available" when product is not found', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={offlineData([
            { reason: 'Failed to get product data', action: 'Fix it' },
          ])}
        />
      );
      expect(screen.getByText('Title not available')).toBeVisible();
    });

    it('should prepend P to query when product is not found', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={offlineData([
            { reason: 'Failed to get product data', action: 'Fix it' },
          ])}
        />
      );
      expect(screen.getByText('P60538523')).toBeVisible();
    });

    it('should show singular "1 issue detected" badge', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={offlineData([
            { reason: 'Failed to get product data', action: 'Fix it' },
          ])}
        />
      );
      expect(screen.getByText('1 issue detected')).toBeVisible();
    });

    it('should show plural "2 issues detected" badge', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={offlineData([
            { reason: 'Failed to get product data', action: 'Fix it' },
            { reason: 'Another issue', action: 'Do something' },
          ])}
        />
      );
      expect(screen.getByText('2 issues detected')).toBeVisible();
    });

    it('should show "Issue detected" label on product assembly card', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={offlineData([
            { reason: 'Failed to get product data', action: 'Fix it' },
          ])}
        />
      );
      expect(screen.getByText('Issue detected')).toBeVisible();
    });

    it('should render issue reason and action via InfoBox', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={offlineData([
            {
              reason: 'Failed to get product data',
              action: 'Contact the team',
            },
          ])}
        />
      );
      expect(screen.getByText('Failed to get product data')).toBeVisible();
      expect(screen.getByText('Contact the team')).toBeVisible();
    });
  });

  describe('not indexed — push-available', () => {
    it('should show "Emergency push available" badge when product is not indexed', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={{ products: [], pagination: { totalItems: 0 }, issues: [] }}
        />
      );
      expect(screen.getByText('Emergency push available')).toBeVisible();
    });

    it('should show "Push available" label on product assembly card', () => {
      renderWithProviders(
        <ProductResult
          query="60538523"
          data={{ products: [], pagination: { totalItems: 0 }, issues: [] }}
        />
      );
      expect(screen.getByText('Push available')).toBeVisible();
    });
  });

  describe('mocked hook statuses — branch coverage', () => {
    const emptyData: BetaMerchandisingProductDiagnosticsListData = {
      products: [],
      pagination: { totalItems: 0 },
      issues: [],
    };

    afterEach(() => {
      mockUseProductDetails.mockRestore();
    });

    it('should show "Blocked" badge and label when productAssembly status is blocked', () => {
      mockUseProductDetails.mockReturnValue({
        isOnline: false,
        product: null,
        sections: blockedSections,
      });
      renderWithProviders(<ProductResult query="60538523" data={emptyData} />);
      expect(screen.getAllByText('Blocked').length).toBeGreaterThanOrEqual(1);
    });
  });
});

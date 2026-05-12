import { fireEvent, screen } from '@testing-library/react';

import type { ProductDisplay } from '@/libs/hooks/product-status/reducer';
import { renderWithProviders } from '@/test/render-with-providers';

import { ProductResult } from './product-result';

const baseProduct = {
  id: 'p1',
  productId: '60538523',
  title: 'Green Wool Coat',
  price: '£89.00',
  isInStock: true,
  brand: 'M&S',
  url: 'https://example.com',
  imageUrl: [] as string[],
  metadata: { isPinned: false },
};

const operationalSections: ProductDisplay['sections'] = {
  productAssembly: {
    content: [
      { label: 'Brand', value: 'M&S' },
      { label: 'Price range', value: '£89.00' },
    ],
    issues: [],
    status: 'operational',
    statusLabel: 'Operational',
  },
  availability: {
    content: null,
    issues: [],
    status: 'operational',
    statusLabel: 'Operational',
  },
  saleability: {
    content: null,
    issues: [],
    status: 'operational',
    statusLabel: 'Operational',
  },
  associatedRules: {
    content: null,
    issues: [],
    status: 'operational',
    statusLabel: 'Operational',
  },
};

const blockedSection = {
  content: null,
  issues: [],
  status: 'blocked' as const,
  statusLabel: 'Blocked by an issue',
};

const makeDisplay = (imageUrl: string[] = []): ProductDisplay => ({
  isIndexed: true,
  product: { ...baseProduct, imageUrl },
  displayId: 'P60538523',
  mainStatusLabel: 'Product is operational',
  mainStatusVariant: 'product-operational',
  sections: operationalSections,
});

const offlineDisplay = (
  issues: { reason: string; action: string }[]
): ProductDisplay => ({
  isIndexed: false,
  product: null,
  displayId: 'P60538523',
  mainStatusLabel: `${issues.length} issue${issues.length !== 1 ? 's' : ''} detected`,
  mainStatusVariant: 'error',
  sections: {
    productAssembly: {
      content: [],
      issues: issues.map((i) => ({ ...i, type: 'error' as const })),
      status: 'issue-detected',
      statusLabel: 'Issue detected',
    },
    availability: blockedSection,
    saleability: blockedSection,
    associatedRules: blockedSection,
  },
});

const pushAvailableDisplay: ProductDisplay = {
  isIndexed: false,
  product: null,
  displayId: 'P60538523',
  mainStatusLabel: 'Emergency push available',
  mainStatusVariant: 'emergency',
  sections: {
    productAssembly: {
      content: [],
      issues: [
        {
          reason: 'Product is not indexed in Elastic yet',
          action: 'Send an Emergency Push request.',
          type: 'warning',
        },
      ],
      status: 'push-available',
      statusLabel: 'Push available',
    },
    availability: {
      content: null,
      issues: [],
      status: 'waiting',
      statusLabel: 'Waiting for push',
    },
    saleability: {
      content: null,
      issues: [],
      status: 'waiting',
      statusLabel: 'Waiting for push',
    },
    associatedRules: {
      content: null,
      issues: [],
      status: 'waiting',
      statusLabel: 'Waiting for push',
    },
  },
};

describe('ProductResult', () => {
  describe('online product', () => {
    it('should render the product title', () => {
      renderWithProviders(<ProductResult productDisplay={makeDisplay()} />);
      expect(screen.getByText('Green Wool Coat')).toBeVisible();
    });

    it('should render the product image when imageUrl is present', () => {
      renderWithProviders(
        <ProductResult productDisplay={makeDisplay(['image1.jpg'])} />
      );
      expect(screen.getByAltText('Green Wool Coat')).toBeInTheDocument();
    });

    it('should render the placeholder when imageUrl is empty', () => {
      const { container } = renderWithProviders(
        <ProductResult productDisplay={makeDisplay()} />
      );
      expect(container.querySelector('.imagePlaceholder')).toBeInTheDocument();
    });

    it('should render the placeholder when the image fails to load', () => {
      const { container } = renderWithProviders(
        <ProductResult productDisplay={makeDisplay(['broken.jpg'])} />
      );
      fireEvent.error(screen.getByAltText('Green Wool Coat'));
      expect(container.querySelector('.imagePlaceholder')).toBeInTheDocument();
      expect(screen.queryByAltText('Green Wool Coat')).not.toBeInTheDocument();
    });

    it('should show "Product is operational" badge', () => {
      renderWithProviders(<ProductResult productDisplay={makeDisplay()} />);
      expect(screen.getByText('Product is operational')).toBeVisible();
    });

    it('should show the info box hint when online with no issues', () => {
      renderWithProviders(<ProductResult productDisplay={makeDisplay()} />);
      expect(
        screen.getByText("Can't see this on the website yet?")
      ).toBeVisible();
    });
  });

  describe('offline product — AssemblyFailed', () => {
    const singleIssueDisplay = offlineDisplay([
      { reason: 'Failed to get product data', action: 'Fix it' },
    ]);

    it('should show "Title not available" when product is not found', () => {
      renderWithProviders(
        <ProductResult productDisplay={singleIssueDisplay} />
      );
      expect(screen.getByText('Title not available')).toBeVisible();
    });

    it('should show singular "1 issue detected" badge', () => {
      renderWithProviders(
        <ProductResult productDisplay={singleIssueDisplay} />
      );
      expect(screen.getByText('1 issue detected')).toBeVisible();
    });

    it('should show "Issue detected" label on product assembly card', () => {
      renderWithProviders(
        <ProductResult productDisplay={singleIssueDisplay} />
      );
      expect(screen.getByText('Issue detected')).toBeVisible();
    });

    it('should render issue reason and action via InfoBox', () => {
      renderWithProviders(
        <ProductResult
          productDisplay={offlineDisplay([
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

  describe('availability issues', () => {
    const baseOffline = offlineDisplay([]);
    const display: ProductDisplay = {
      ...baseOffline,
      mainStatusLabel: '1 issue detected',
      mainStatusVariant: 'error',
      sections: {
        ...baseOffline.sections,
        availability: {
          content: null,
          issues: [
            {
              reason: 'Out of stock',
              action: 'Restock the item.',
              type: 'error',
            },
          ],
          status: 'issue-detected',
          statusLabel: 'Issue detected',
        },
      },
    };

    it('should render availability issue reason and action via InfoBox', () => {
      renderWithProviders(<ProductResult productDisplay={display} />);
      expect(screen.getByText('Out of stock')).toBeVisible();
      expect(screen.getByText('Restock the item.')).toBeVisible();
    });
  });

  describe('not indexed — push-available', () => {
    it('should show "Emergency push available" badge', () => {
      renderWithProviders(
        <ProductResult productDisplay={pushAvailableDisplay} />
      );
      expect(screen.getByText('Emergency push available')).toBeVisible();
    });

    it('should show "Push available" label on product assembly card', () => {
      renderWithProviders(
        <ProductResult productDisplay={pushAvailableDisplay} />
      );
      expect(screen.getByText('Push available')).toBeVisible();
    });
  });
});

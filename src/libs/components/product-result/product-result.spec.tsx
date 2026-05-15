import { fireEvent, screen } from '@testing-library/react';

import type {
  ProductDisplay,
  SectionWithLabel,
} from '@/libs/hooks/product-status/reducer';
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
  imageUrl: [],
  metadata: { isPinned: false },
};

const operationalSection: SectionWithLabel<string | null> = {
  content: null,
  issues: [],
  status: 'operational',
  statusLabel: 'Operational',
};

const makeDisplay = (imageUrl: string[] = []): ProductDisplay => ({
  isIndexed: true,
  product: { ...baseProduct, imageUrl },
  displayId: 'P60538523',
  mainStatusLabel: 'Product is operational',
  mainStatusVariant: 'product-operational',
  sections: {
    productAssembly: {
      content: [
        { label: 'Brand', value: 'M&S' },
        { label: 'Price range', value: '£89.00' },
      ],
      issues: [],
      status: 'operational',
      statusLabel: 'Operational',
    },
    availability: operationalSection,
    saleability: operationalSection,
    associatedRules: operationalSection,
  },
});

const withIssue = (
  section: 'availability' | 'saleability',
  reason: string,
  action: string,
  copyMessage = 'Please contact support.'
): ProductDisplay => ({
  isIndexed: true,
  product: baseProduct,
  displayId: 'P60538523',
  mainStatusLabel: '1 issue detected',
  mainStatusVariant: 'error',
  sections: {
    productAssembly: {
      content: [],
      issues: [],
      status: 'blocked',
      statusLabel: 'Blocked by an issue',
    },
    availability: operationalSection,
    saleability: operationalSection,
    associatedRules: operationalSection,
    [section]: {
      content: null,
      issues: [{ reason, action, type: 'error', copyMessage }],
      status: 'issue-detected',
      statusLabel: 'Issue detected',
    },
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
          copyMessage:
            "I'm requesting for an Emergency Push for 'P60538523' as soon as possible.",
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

  describe('blocked productAssembly', () => {
    it('shows "Not available" when productAssembly is blocked', () => {
      const display = withIssue(
        'availability',
        'Product is out of stock',
        'Wait for restock.'
      );
      renderWithProviders(<ProductResult productDisplay={display} />);
      expect(screen.getByText('Not available')).toBeVisible();
    });
  });

  describe('availability issue', () => {
    const display = withIssue(
      'availability',
      'Product is out of stock',
      'Wait for the product to be restocked.'
    );

    it('should show "Title not available" only when product is absent', () => {
      renderWithProviders(<ProductResult productDisplay={display} />);
      expect(screen.queryByText('Title not available')).not.toBeInTheDocument();
      expect(screen.getByText('Green Wool Coat')).toBeVisible();
    });

    it('should render availability issue reason and action via InfoBox', () => {
      renderWithProviders(<ProductResult productDisplay={display} />);
      expect(screen.getByText('Product is out of stock')).toBeVisible();
      expect(
        screen.getByText('Wait for the product to be restocked.')
      ).toBeVisible();
    });
  });

  describe('saleability issue', () => {
    const display = withIssue(
      'saleability',
      'Product is not marked saleable in Product Assembly',
      'Mark as saleable.'
    );

    it('should render saleability issue reason and action via InfoBox', () => {
      renderWithProviders(<ProductResult productDisplay={display} />);
      expect(
        screen.getByText('Product is not marked saleable in Product Assembly')
      ).toBeVisible();
      expect(screen.getByText('Mark as saleable.')).toBeVisible();
    });

    it('should render the copy message box', () => {
      renderWithProviders(<ProductResult productDisplay={display} />);
      expect(screen.getByText('Copy this message below:')).toBeVisible();
    });
  });

  describe('not indexed — push-available', () => {
    it('should show "Emergency push available" badge and Push available label', () => {
      renderWithProviders(
        <ProductResult productDisplay={pushAvailableDisplay} />
      );
      expect(screen.getByText('Emergency push available')).toBeVisible();
      expect(screen.getByText('Push available')).toBeVisible();
    });

    it('should render the copy message box', () => {
      renderWithProviders(
        <ProductResult productDisplay={pushAvailableDisplay} />
      );
      expect(screen.getByText('Copy this message below:')).toBeVisible();
    });
  });
});

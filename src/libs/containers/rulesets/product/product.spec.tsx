import type { Screen } from '@testing-library/react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { RuleSetActions } from '@/libs/components/types';
import { renderWithProviders } from '@/test/render-with-providers';

import type { ProductProps } from './product';
import { MissingProduct, Product } from './product';

const mockDispatch = jest.fn();
const productProps: ProductProps = {
  id: 'id',
  productId: 'product id',
  title: 'product title',
  imageUrl: ['example1.jpg'],
  isPinnable: true,
  brand: 'product brand',
  metadata: {
    isPinned: false,
    ranking: [
      {
        property: 'Predicted Revenue Score:',
        values: ['11.59'],
      },
      {
        property: 'Days Since Launch:',
        values: ['100'],
      },
    ],
  },
  isInStock: true,
  price: '£10',
  url: '',
  index: 1,
  dispatch: mockDispatch,
  pinnedProductsCount: 2,
  isSelected: false,
  isSelectionDisabled: false,
  hasSupplementaryInfo: true,
};

const missingProductProps = {
  id: 'id',
  index: 1,
  dispatch: mockDispatch,
  onSelectProduct: jest.fn(),
  isSelected: false,
  isSelectionDisabled: false,
};

const openActionsMenu = (screen: Screen) => {
  const actionsMenu = screen.getByTitle('Open menu');

  act(() => {
    actionsMenu.click();
  });
};

const openPinningMenu = (screen: Screen) => {
  const pinMenu = screen.getByRole('button', { name: 'Pin in position' });

  act(() => {
    pinMenu.click();
  });
};

describe('Product', () => {
  describe('Product card', () => {
    it('should render correctly', () => {
      render(<Product {...productProps} />);

      expect(screen.getByTestId('product title')).toBeInTheDocument();

      expect(screen.getByTestId('product title')).toHaveTextContent(
        'product brand product title'
      );
    });

    it('should use fallback image on error', () => {
      render(<Product {...productProps} />);

      const image = screen.getByTestId('productImage');

      fireEvent.error(image);

      expect(image).toHaveAttribute(
        'src',
        'https://dummyimage.com/300x400/cccccc/ffffff?text=missing+image'
      );
    });

    it('should show pinned label', () => {
      render(<Product {...productProps} metadata={{ isPinned: true }} />);

      expect(screen.getByTestId('Pinned product')).toBeInTheDocument();
    });

    it('should boost to top', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'add',
          operation: 'boost',
        },
      };
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      const boostToTop = screen.getByRole('button', { name: 'Boost to Top' });

      act(() => {
        boostToTop.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should block', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'add',
          operation: 'block',
        },
      };
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      const blockProduct = screen.getByRole('button', {
        name: 'Block Product',
      });

      act(() => {
        blockProduct.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should bury', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'add',
          operation: 'bury',
        },
      };
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      const buryButton = screen.getByRole('button', { name: 'Bury to Bottom' });

      act(() => {
        buryButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should open pinning menu', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      expect(screen.getByLabelText('Pinning heading')).toBeInTheDocument();
    });

    it('should close the pinning menu', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });

      act(() => {
        cancelButton.click();
      });

      expect(
        screen.queryByLabelText('Pinning heading')
      ).not.toBeInTheDocument();
    });

    it('should close the pinning menu clicking on the overlay', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const cancelButton = screen.getByTestId('menu overlay');

      act(() => {
        cancelButton.click();
      });

      expect(
        screen.queryByLabelText('Pinning heading')
      ).not.toBeInTheDocument();
    });

    it('should not allow pinning in a non sequential order', async () => {
      const expectedError = 'Please choose a position between 1 and 2';
      render(<Product {...productProps} metadata={{ isPinned: true }} />);

      openActionsMenu(screen);

      const pinMenu = screen.getByRole('button', { name: 'Edit position' });

      act(() => {
        pinMenu.click();
      });

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await userEvent.type(input, '5');

      act(() => {
        confirmButton.click();
      });

      expect(screen.getByTestId('Error message')).toHaveTextContent(
        expectedError
      );
    });

    it('should hide edit position when fewer than two products are pinned', () => {
      render(
        <Product
          {...productProps}
          metadata={{ ...productProps.metadata, isPinned: true }}
          pinnedProductsCount={1}
        />
      );

      openActionsMenu(screen);

      expect(
        screen.queryByRole('button', { name: 'Edit position' })
      ).not.toBeInTheDocument();
    });

    it('should only allow pinning from position 1', async () => {
      const expectedError =
        'Please choose a position sequentially starting from 1';
      render(<Product {...productProps} pinnedProductsCount={0} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await userEvent.type(input, '5');

      act(() => {
        confirmButton.click();
      });

      expect(screen.getByTestId('Error message')).toHaveTextContent(
        expectedError
      );
    });

    it('should not allow pinning with non numeric text', async () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await userEvent.type(input, 'a');

      expect(confirmButton).toBeDisabled();
    });

    it('should pin correctly', async () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          position: 2,
          operation: 'pin',
          change: 'add',
        },
      };
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByRole('button', { name: 'Confirm' });

      await userEvent.type(input, '3');

      act(() => {
        confirmButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should not pin when disallowed', async () => {
      render(<Product {...productProps} isPinnable={false} />);

      openActionsMenu(screen);

      expect(screen.queryByText('Pin in position')).not.toBeInTheDocument();
    });

    it('should un-pin', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'pin',
        },
      };
      render(<Product {...productProps} metadata={{ isPinned: true }} />);

      openActionsMenu(screen);

      const unboostButton = screen.getByRole('button', { name: 'Restore' });

      act(() => {
        unboostButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-block', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'block',
        },
      };
      render(
        <Product
          {...productProps}
          metadata={{ isPinned: false, isBlocked: true }}
        />
      );

      openActionsMenu(screen);

      const unboostButton = screen.getByRole('button', { name: 'Restore' });

      act(() => {
        unboostButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-boost', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'boost',
        },
      };
      render(
        <Product
          {...productProps}
          metadata={{ isPinned: false, isBoosted: true }}
        />
      );

      openActionsMenu(screen);

      const unboostButton = screen.getByRole('button', { name: 'Unboost' });

      act(() => {
        unboostButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-bury', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'bury',
        },
      };
      render(
        <Product
          {...productProps}
          metadata={{ isPinned: false, isBuried: true }}
        />
      );

      openActionsMenu(screen);

      const unboostButton = screen.getByRole('button', { name: 'Unbury' });

      act(() => {
        unboostButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should render predicted revenue and newness for visual editor or product search', () => {
      render(<Product {...productProps} hasSupplementaryInfo />);

      const predictedRevenue = screen.getByText('Predicted Revenue Score:');
      expect(predictedRevenue).toBeInTheDocument();

      const predictedRevenueValue = within(predictedRevenue).getByText('11.59');
      expect(predictedRevenueValue).toBeInTheDocument();

      const newness = screen.getByText('Days Since Launch:');
      expect(newness).toBeInTheDocument();

      const newnessValue = within(newness).getByText('100');
      expect(newnessValue).toBeInTheDocument();
    });

    it('should show out of stock message', () => {
      render(<Product {...productProps} isInStock={false} />);

      const outOfStockMessage = screen.getByText('Out of stock');
      expect(outOfStockMessage).toBeInTheDocument();
    });

    it('should not show out of stock message', () => {
      render(<Product {...productProps} isInStock />);

      const outOfStockMessage = screen.queryByText('Out of stock');
      expect(outOfStockMessage).not.toBeInTheDocument();
    });
  });

  describe('Missing product', () => {
    it('should render correctly', () => {
      renderWithProviders(<MissingProduct {...missingProductProps} />);

      expect(screen.getByTestId('product title')).toHaveTextContent(
        `Product ${missingProductProps.id} not found`
      );
    });

    it('should un-boost', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'boost',
        },
      };
      renderWithProviders(
        <MissingProduct {...missingProductProps} isBoosted />
      );

      openActionsMenu(screen);

      const unboostButton = screen.getByRole('button', { name: 'Unboost' });

      act(() => {
        unboostButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-bury', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'bury',
        },
      };
      renderWithProviders(<MissingProduct {...missingProductProps} isBuried />);

      openActionsMenu(screen);

      const unburyButton = screen.getByRole('button', { name: 'Unbury' });

      act(() => {
        unburyButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-pin', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          operation: 'pin',
          change: 'remove',
        },
      };
      renderWithProviders(<MissingProduct {...missingProductProps} isPinned />);

      openActionsMenu(screen);

      const unpinButton = screen.getByRole('button', { name: 'Restore' });

      act(() => {
        unpinButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-block', () => {
      const expectedCall: RuleSetActions = {
        type: 'product',
        payload: {
          ids: ['id'],
          change: 'remove',
          operation: 'block',
        },
      };
      renderWithProviders(
        <MissingProduct {...missingProductProps} isBlocked />
      );

      openActionsMenu(screen);

      const unblockButton = screen.getByRole('button', { name: 'Restore' });

      act(() => {
        unblockButton.click();
      });

      expect(mockDispatch).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should open and close the actions menu', () => {
      renderWithProviders(<MissingProduct {...missingProductProps} />);

      openActionsMenu(screen);

      expect(
        screen.getByRole('heading', { name: 'Product actions' })
      ).toBeInTheDocument();

      const actionsMenu = screen.getByTitle('Close menu');

      act(() => {
        actionsMenu.click();
      });

      expect(
        screen.queryByRole('heading', { name: 'Product actions' })
      ).not.toBeInTheDocument();
    });

    it('should close the menu by clicking on the overlay', () => {
      renderWithProviders(<MissingProduct {...missingProductProps} />);

      openActionsMenu(screen);

      const cancelButton = screen.getByLabelText('menu overlay');

      act(() => {
        cancelButton.click();
      });

      expect(screen.queryByText('Product actions')).not.toBeInTheDocument();
    });
  });

  describe('bulk action', () => {
    it('should show bulk action checkbox', () => {
      renderWithProviders(<Product {...productProps} />);

      const checkbox = screen.queryByLabelText(`Select ${productProps.title}`);

      expect(checkbox).toBeVisible();
    });

    it('should select a product', () => {
      const mockSelect = jest.fn();
      renderWithProviders(
        <Product {...productProps} onSelectProduct={mockSelect} />
      );

      act(() => {
        screen.getByLabelText(`Select ${productProps.title}`).click();
      });

      expect(mockSelect).toHaveBeenCalledWith({
        id: productProps.id,
        isSelected: false,
      });
    });

    it('should select a missing product', () => {
      const mockSelect = jest.fn();
      renderWithProviders(
        <MissingProduct {...missingProductProps} onSelectProduct={mockSelect} />
      );

      act(() => {
        screen.getByLabelText(`Select ${missingProductProps.id}`).click();
      });

      expect(mockSelect).toHaveBeenCalledWith({
        id: missingProductProps.id,
        isSelected: false,
      });
    });
  });
});

import type { Screen } from '@testing-library/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MissingProduct, Product } from './product';

const mockChangePosition = jest.fn();
const mockProductBoostBury = jest.fn();
const productProps = {
  id: 'id',
  productId: 'product id',
  title: 'product title',
  imageUrl: ['example1.jpg'],
  isPinnable: true,
  brand: 'product brand',
  metadata: { isPinned: false },
  isInStock: true,
  price: '£10',
  url: '',
  index: 1,
  onChangePosition: mockChangePosition,
  onProductBoostBury: mockProductBoostBury,
  pinnedProductsCount: 2,
};

const missingProductProps = {
  id: 'id',
  index: 1,
  onChangePosition: mockChangePosition,
  onProductBoostBury: mockProductBoostBury,
};

const openActionsMenu = (screen: Screen) => {
  const actionsMenu = screen.getByTitle('Open menu');

  act(() => {
    actionsMenu.click();
  });
};

const openPinningMenu = (screen: Screen) => {
  const pinMenu = screen.getByText('Pin in position');

  act(() => {
    pinMenu.click();
  });
};

describe('Product', () => {
  describe('Product card', () => {
    it('should render correctly', () => {
      render(<Product {...productProps} />);

      expect(
        screen.getByText('product brand product title')
      ).toBeInTheDocument();
    });

    it('should show pinned label', () => {
      render(<Product {...productProps} metadata={{ isPinned: true }} />);

      expect(screen.getByText('Internal')).toBeInTheDocument();
    });

    it('should open the actions menu', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      expect(screen.getByText('Product actions')).toBeInTheDocument();
    });

    it('should boost to top', () => {
      const expectedCall = {
        id: 'id',
        change: 'add',
        operation: 'boosts',
      };
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      const boostToTop = screen.getByText('Boost to Top');

      act(() => {
        boostToTop.click();
      });

      expect(mockProductBoostBury).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should open pinning menu', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      expect(screen.getByText('Slot position')).toBeInTheDocument();
    });

    it('should close the pinning menu', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const cancelButton = screen.getByText('Cancel');

      act(() => {
        cancelButton.click();
      });

      expect(screen.queryByText('Slot position')).not.toBeInTheDocument();
    });

    it('should close the pinning menu clicking on the overlay', () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const cancelButton = screen.getByLabelText('menu overlay');

      act(() => {
        cancelButton.click();
      });

      expect(screen.queryByText('Slot position')).not.toBeInTheDocument();
    });

    it('should not allow pinning in a non sequential order', async () => {
      const expectedError = 'Please choose a position between 1 and 2';
      render(<Product {...productProps} metadata={{ isPinned: true }} />);

      openActionsMenu(screen);

      const pinMenu = screen.getByText('Edit position');

      act(() => {
        pinMenu.click();
      });

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByText('Confirm');

      await userEvent.type(input, '5');

      act(() => {
        confirmButton.click();
      });

      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });

    it('should only allow pinning from position 1', async () => {
      const expectedError =
        'Please choose a position sequentially starting from 1';
      render(<Product {...productProps} pinnedProductsCount={0} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByText('Confirm');

      await userEvent.type(input, '5');

      act(() => {
        confirmButton.click();
      });

      expect(screen.getByText(expectedError)).toBeInTheDocument();
    });

    it('should not allow pinning with non numeric text', async () => {
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByText('Confirm');

      await userEvent.type(input, 'a');

      expect(confirmButton).toBeDisabled();
    });

    it('should pin correctly', async () => {
      const expectedCall = {
        id: 'id',
        isPinned: true,
        newPosition: 2,
      };
      render(<Product {...productProps} />);

      openActionsMenu(screen);

      openPinningMenu(screen);

      const input = screen.getByPlaceholderText('i.e. 3');
      const confirmButton = screen.getByText('Confirm');

      await userEvent.type(input, '3');

      act(() => {
        confirmButton.click();
      });

      expect(mockChangePosition).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should not pin when disallowed', async () => {
      render(<Product {...productProps} isPinnable={false} />);

      openActionsMenu(screen);

      expect(screen.queryByText('Pin in position')).toBeNull();
    });

    it('should un-pin', () => {
      const expectedCall = {
        id: 'id',
        isPinned: false,
        newPosition: 1,
      };
      render(<Product {...productProps} metadata={{ isPinned: true }} />);

      openActionsMenu(screen);

      const unboostButton = screen.getByText('Restore');

      act(() => {
        unboostButton.click();
      });

      expect(mockChangePosition).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-block', () => {
      const expectedCall = {
        id: 'id',
        change: 'remove',
        operation: 'block',
      };
      render(
        <Product
          {...productProps}
          metadata={{ isPinned: false, isBlocked: true }}
        />
      );

      openActionsMenu(screen);

      const unboostButton = screen.getByText('Restore');

      act(() => {
        unboostButton.click();
      });

      expect(mockProductBoostBury).toHaveBeenLastCalledWith(expectedCall);
    });
  });

  describe('Missing product', () => {
    it('should render correctly', () => {
      render(<MissingProduct {...missingProductProps} />);

      expect(
        screen.getByText(`Product ${missingProductProps.id} not found`)
      ).toBeInTheDocument();
    });

    it('should un-boost', () => {
      const expectedCall = {
        id: 'id',
        change: 'remove',
        operation: 'boosts',
      };
      render(<MissingProduct {...missingProductProps} isBoosted={true} />);

      openActionsMenu(screen);

      const unboostButton = screen.getByText('Unboost');

      act(() => {
        unboostButton.click();
      });

      expect(mockProductBoostBury).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-bury', () => {
      const expectedCall = {
        id: 'id',
        change: 'remove',
        operation: 'buries',
      };
      render(<MissingProduct {...missingProductProps} isBuried={true} />);

      openActionsMenu(screen);

      const unburyButton = screen.getByText('Unbury');

      act(() => {
        unburyButton.click();
      });

      expect(mockProductBoostBury).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-pin', () => {
      const expectedCall = {
        id: 'id',
        isPinned: false,
        newPosition: 1,
      };
      render(<MissingProduct {...missingProductProps} isPinned={true} />);

      openActionsMenu(screen);

      const unpinButton = screen.getByText('Restore');

      act(() => {
        unpinButton.click();
      });

      expect(mockChangePosition).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should un-block', () => {
      const expectedCall = {
        id: 'id',
        change: 'remove',
        operation: 'block',
      };
      render(<MissingProduct {...missingProductProps} isBlocked={true} />);

      openActionsMenu(screen);

      const unblockButton = screen.getByText('Restore');

      act(() => {
        unblockButton.click();
      });

      expect(mockProductBoostBury).toHaveBeenLastCalledWith(expectedCall);
    });

    it('should open and close the actions menu', () => {
      render(<MissingProduct {...productProps} />);

      openActionsMenu(screen);

      expect(screen.getByText('Product actions')).toBeInTheDocument();

      const actionsMenu = screen.getByTitle('Close menu');

      act(() => {
        actionsMenu.click();
      });

      expect(screen.queryByText('Product actions')).not.toBeInTheDocument();
    });

    it('should close the menu by clicking on the overlay', () => {
      render(<MissingProduct {...productProps} />);

      openActionsMenu(screen);

      const cancelButton = screen.getByLabelText('menu overlay');

      act(() => {
        cancelButton.click();
      });

      expect(screen.queryByText('Product actions')).not.toBeInTheDocument();
    });
  });
});

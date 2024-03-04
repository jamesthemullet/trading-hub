import type { Screen } from '@testing-library/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Product } from './product';

const mockChangePosition = jest.fn();
const productProps = {
  id: 'id',
  title: 'product title',
  imageUrl: ['example1.jpg'],
  brand: 'product brand',
  metadata: { isPinned: false },
  isInStock: true,
  price: '£10',
  rating: 4.5,
  url: '',
  index: 1,
  onChangePosition: mockChangePosition,
  totalProducts: 10,
  pinnedProductsCount: 2,
};

const openActionsMenu = (screen: Screen) => {
  const actionsMenu = screen.getByTitle('Open menu');

  act(() => {
    actionsMenu.click();
  });
};

const openPinningMenu = (screen: Screen) => {
  const pinMenu = screen.getByText('Pin in position#');

  act(() => {
    pinMenu.click();
  });
};

describe('Product', () => {
  it('should render correctly', () => {
    render(<Product {...productProps} />);

    expect(screen.getByText('product brand product title')).toBeInTheDocument();
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
      isPinned: true,
      newPosition: 0,
    };
    render(<Product {...productProps} />);

    openActionsMenu(screen);

    const boostToTop = screen.getByText('Boost to Top');

    act(() => {
      boostToTop.click();
    });

    expect(mockChangePosition).toHaveBeenLastCalledWith(expectedCall);
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
    const expectedError = 'Please choose a position between 1 and 3';
    render(<Product {...productProps} />);

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

  it('should un-boost', () => {
    const expectedCall = {
      id: 'id',
      isPinned: false,
      newPosition: 1,
    };
    render(<Product {...productProps} metadata={{ isPinned: true }} />);

    openActionsMenu(screen);

    const unboostButton = screen.getByText('Un-boost');

    act(() => {
      unboostButton.click();
    });

    expect(mockChangePosition).toHaveBeenLastCalledWith(expectedCall);
  });

  it('should show updated label', () => {
    render(
      <Product
        {...productProps}
        metadata={{ isPinned: true }}
        isLastChanged={true}
      />
    );

    expect(screen.getByLabelText('Position 2 updated')).toBeInTheDocument();
  });
});

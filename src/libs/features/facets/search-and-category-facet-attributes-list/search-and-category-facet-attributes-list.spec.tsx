import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import lodash from 'lodash';

import { SearchAndCategoryFacetAttributesList } from './search-and-category-facet-attributes-list';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  intersection: jest.fn(),
  without: jest.fn(),
}));

const setup = (props = {}) => {
  const defaultProps = {
    boostedValues: [
      { displayValue: 'Cotton', order: 1 },
      { displayValue: 'Silk', order: 2 },
      { displayValue: 'Satin', order: 3 },
      { displayValue: 'Wool', order: 4 },
    ],
    algoControlValues: [
      { displayValue: 'Polyester' },
      { displayValue: 'Linen' },
    ],
    excludedValues: [
      { displayValue: 'Duck Down' },
      { displayValue: 'Feather' },
    ],
    dispatch: jest.fn(),
    searchQuery: '',
    writeEnabled: true,
  };

  return renderWithProviders(
    <SearchAndCategoryFacetAttributesList {...defaultProps} {...props} />
  );
};

describe('SearchAndCategoryFacetAttributesList', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all value rows', () => {
    setup();
    expect(screen.getByTestId('included attribute 0 Cotton')).toBeVisible();
    expect(screen.getByTestId('included attribute 1 Silk')).toBeVisible();
    expect(
      screen.getByTestId('algoControl attribute 0 Polyester')
    ).toBeVisible();
    expect(screen.getByTestId('excluded attribute 0 Duck Down')).toBeVisible();
  });

  it('filters values by searchQuery', async () => {
    setup({ searchQuery: 'Silk' });
    expect(screen.getByTestId('included attribute 0 Silk')).toBeVisible();
    expect(
      screen.queryByTestId('included attribute 0 Cotton')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('algoControl attribute 0 Polyester')
    ).not.toBeInTheDocument();
  });

  it('disables arrow buttons when at bounds or searching', () => {
    setup();
    const upButton = screen.getByLabelText('Move Cotton row up');
    expect(upButton).toBeDisabled();
    const downButton = screen.getByLabelText('Move Wool row down');
    expect(downButton).toBeDisabled();
  });

  it('dispatches MOVE_BOOSTED_ROW_UP and MOVE_BOOSTED_ROW_DOWN', async () => {
    const dispatch = jest.fn();
    setup({ dispatch });

    const downButton = screen.getByLabelText('Move Cotton row down');
    await userEvent.click(downButton);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'MOVE_BOOSTED_ROW_DOWN',
      payload: { id: 'Cotton' },
    });

    const upButton = screen.getByLabelText('Move Silk row up');
    await userEvent.click(upButton);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'MOVE_BOOSTED_ROW_UP',
      payload: { id: 'Silk' },
    });
  });

  it('dispatches CHANGE_DISPLAY_TYPE when dropdown changes', async () => {
    const dispatch = jest.fn();
    setup({ dispatch });

    const dropdown = screen.getAllByLabelText(
      'Select to set as included, excluded or algo control'
    )[0];
    await userEvent.click(dropdown);

    const excludedOption = screen.getByRole('option', { name: 'Exclude only' });
    await userEvent.click(excludedOption);

    expect(dispatch).toHaveBeenCalledWith({
      type: 'CHANGE_DISPLAY_TYPE',
      payload: {
        id: 'Cotton',
        newDisplayType: 'excluded',
      },
    });
  });

  it('renders empty state when no values are provided', () => {
    setup({
      boostedValues: [],
      algoControlValues: [],
      excludedValues: [],
    });

    expect(screen.queryByTestId(/included attribute/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(/algoControl attribute/)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(/excluded attribute/)).not.toBeInTheDocument();
  });

  it('shows no results when search query matches nothing', () => {
    setup({ searchQuery: 'nonexistent' });

    expect(screen.queryByTestId(/included attribute/)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(/algoControl attribute/)
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId(/excluded attribute/)).not.toBeInTheDocument();
  });

  describe('Re-order by number', () => {
    it('should dispatch SET_BOOSTED_ORDER if new value within the range of boosted items', async () => {
      const dispatch = jest.fn();
      const user = userEvent.setup({ delay: null });
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Wool');
      expect(input).toHaveValue(4);
      await user.clear(input);
      await user.type(input, '1');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: { id: 'Wool', newIndex: 0 },
        });
      });
    });

    it('should not dispatch SET_BOOSTED_ORDER if new value is less than 1', async () => {
      const user = userEvent.setup({ delay: null });
      const dispatch = jest.fn();
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Wool');
      expect(input).toHaveValue(4);
      await user.clear(input);
      await user.type(input, '0');
      await user.keyboard('{enter}');

      await waitFor(() => {
        expect(dispatch).not.toHaveBeenCalledWith({
          type: 'SET_BOOSTED_ORDER',
          payload: expect.any(Object),
        });
        expect(input).toHaveValue(4);
      });
    });

    it('should keep the existing order if the user deletes, then clicks outside without inputting a new order', async () => {
      const dispatch = jest.fn();
      const user = userEvent.setup({ delay: null });
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Satin');
      expect(input).toHaveValue(3);
      await user.clear(input);
      expect(input).toHaveValue(null);
      act(() => {
        input.blur();
      });

      await waitFor(() => {
        expect(input).toHaveValue(3);
      });
    });

    it('should keep the existing order if the user deletes, then clicks enter without inputting a new order', async () => {
      const dispatch = jest.fn();
      const user = userEvent.setup({ delay: null });
      (lodash.without as jest.Mock).mockReturnValue([
        'Cotton',
        'Silk',
        'Satin',
        'Wool',
      ]);

      setup({ dispatch });

      const input = screen.getByLabelText('Order for Silk');
      expect(input).toHaveValue(2);
      await user.clear(input);
      expect(input).toHaveValue(null);
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(input).toHaveValue(2);
      });
    });
  });
});

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { SearchAndCategoryFacetAttributesList } from './search-and-category-facet-attibutes-list';

const setup = (props = {}) => {
  const defaultProps = {
    boostedValues: [
      { displayValue: 'Cotton' },
      { displayValue: 'Silk' },
      { displayValue: 'Wool' },
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
});

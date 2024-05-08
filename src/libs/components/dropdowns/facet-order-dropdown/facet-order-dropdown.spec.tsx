import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetOrderDropdown } from './facet-order-dropdown';

describe('Filter dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dropdown', () => {
    render(<FacetOrderDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet order dropdown'
    );
    expect(dropdownHeader.getAttribute('aria-haspopup')).toBe('listbox');
    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('Select an action')).toBeVisible();
    expect(screen.getByText('Include only')).not.toBeVisible();
    expect(screen.getByText('Exclude only')).not.toBeVisible();
  });

  it('should open the dropdown and display the options when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FacetOrderDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet order dropdown'
    );
    await user.click(screen.getByRole('button'));

    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('true');
    expect(dropdownHeader).toHaveStyle('border-bottom: 1px solid #b1b1b1;');
    expect(dropdownHeader).toHaveStyle('border-radius: 4px 4px 0 0;');
    expect(screen.getByText('Select an action')).toBeVisible();
    expect(screen.getByText('Include only')).toBeVisible();
    expect(screen.getByText('Exclude only')).toBeVisible();
  });

  it('should close dropdown when button is clicked again when already open', async () => {
    const user = userEvent.setup();
    render(<FacetOrderDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet order dropdown'
    );
    await user.click(dropdownHeader);

    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('true');

    await user.click(dropdownHeader);

    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
  });

  it('should change the selected option when an option is clicked, and close the dropdown', async () => {
    const user = userEvent.setup();
    render(<FacetOrderDropdown />);

    expect(screen.queryByText('Select an action')).toBeVisible();

    const dropdownHeader = screen.getByTestId(
      'button to open facet order dropdown'
    );
    await user.click(dropdownHeader);

    const alwaysHideOption = screen.getByText('Exclude only');
    await user.click(alwaysHideOption);

    expect(screen.getByText('Include only')).not.toBeVisible();
    expect(screen.getAllByText('Exclude only')[0]).toBeVisible();
    expect(screen.getAllByText('Exclude only')[1]).not.toBeVisible();
    expect(screen.queryByText('Select an action')).not.toBeInTheDocument();
    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
  });
});

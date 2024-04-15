import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetOrderDropdown } from './facet-order-dropdown';

describe('Filter dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the button', () => {
    render(<FacetOrderDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet order dropdown'
    );
    expect(dropdownHeader.getAttribute('aria-haspopup')).toBe('listbox');
    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('Select an action')).toBeVisible();
    expect(screen.getByText('Always Show')).not.toBeVisible();
    expect(screen.getByText('Always Hide')).not.toBeVisible();
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
    expect(screen.getByText('Always Show')).toBeVisible();
    expect(screen.getByText('Always Hide')).toBeVisible();
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

    const dropdownHeader = screen.getByTestId(
      'button to open facet order dropdown'
    );
    await user.click(dropdownHeader);

    const alwaysHideOption = screen.getByText('Always Hide');
    await user.click(alwaysHideOption);

    expect(screen.getByText('Always Show')).not.toBeVisible();
    expect(screen.getAllByText('Always Hide')[0]).toBeVisible();
    expect(screen.getAllByText('Always Hide')[1]).not.toBeVisible();
    expect(screen.queryByText('Select an action')).not.toBeInTheDocument();
    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
  });
});

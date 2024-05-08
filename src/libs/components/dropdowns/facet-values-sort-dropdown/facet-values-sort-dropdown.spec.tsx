import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetValuesSortDropdown } from './facet-values-sort-dropdown';

describe('Facet values sort dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the dropdown', () => {
    render(<FacetValuesSortDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet values sort dropdown'
    );

    expect(dropdownHeader.getAttribute('aria-haspopup')).toBe('listbox');
    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getAllByText('Default')[0]).toBeVisible();
    expect(
      screen.getByText('Alphabetical - Ascending (A to Z)')
    ).not.toBeVisible();
    expect(
      screen.getByText('Alphabetical - Descending (Z to A)')
    ).not.toBeVisible();
  });

  it('should open the dropdown and display the options when button is clicked', async () => {
    const user = userEvent.setup();
    render(<FacetValuesSortDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet values sort dropdown'
    );

    await user.click(screen.getByRole('button'));

    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('true');
    expect(dropdownHeader).toHaveStyle('border-bottom: 1px solid #b1b1b1;');
    expect(dropdownHeader).toHaveStyle('border-radius: 4px 4px 0 0;');
    expect(screen.getAllByText('Default')[0]).toBeVisible();
    expect(screen.getByText('Alphabetical - Ascending (A to Z)')).toBeVisible();
    expect(
      screen.getByText('Alphabetical - Descending (Z to A)')
    ).toBeVisible();
  });

  it('should close dropdown when button is clicked again when already open', async () => {
    const user = userEvent.setup();
    render(<FacetValuesSortDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet values sort dropdown'
    );

    await user.click(dropdownHeader);

    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('true');

    await user.click(dropdownHeader);

    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
  });

  it('should change the selected option when an option is clicked, and close the dropdown', async () => {
    const user = userEvent.setup();
    render(<FacetValuesSortDropdown />);

    const dropdownHeader = screen.getByTestId(
      'button to open facet values sort dropdown'
    );

    await user.click(dropdownHeader);

    const option = screen.getByText('Alphabetical - Ascending (A to Z)');
    await user.click(option);

    expect(screen.getByText('Default')).not.toBeVisible();
    expect(
      screen.getAllByText('Alphabetical - Ascending (A to Z)')[0]
    ).toBeVisible();
    expect(
      screen.getAllByText('Alphabetical - Ascending (A to Z)')[1]
    ).not.toBeVisible();
    expect(dropdownHeader.getAttribute('aria-expanded')).toBe('false');
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CountryFilterDropdown } from './country-filter-dropdown';

describe('Country Filter Dropdown', () => {
  it('should render the dropdown', () => {
    render(<CountryFilterDropdown onChange={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'All marksandspencer.com' })
    ).toBeVisible();
    expect(screen.queryByText('UK only marksandspencer')).not.toBeVisible();
    expect(screen.queryByText('IE only marksandspencer')).not.toBeVisible();
  });

  it('should open the dropdown and display the options when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CountryFilterDropdown onChange={jest.fn()} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    expect(screen.queryByText('UK only marksandspencer')).not.toBeVisible();
    expect(screen.queryByText('IE only marksandspencer')).not.toBeVisible();

    await user.click(dropdownButton);

    expect(screen.getByText('UK only marksandspencer')).toBeVisible();
    expect(screen.getByText('IE only marksandspencer')).toBeVisible();
  });

  it('should change the selected option when an option is clicked, and close the dropdown', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<CountryFilterDropdown onChange={onChange} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    await user.click(dropdownButton);

    const showUK = screen.getByText('UK only marksandspencer');

    await user.click(showUK);

    expect(onChange).toHaveBeenCalledWith('UK');
  });

  it('should close dropdown when button is clicked again when already open', async () => {
    const user = userEvent.setup();
    render(<CountryFilterDropdown onChange={jest.fn()} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should close the dropdown when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<CountryFilterDropdown onChange={jest.fn()} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'All marksandspencer.com',
    });

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
  });
});

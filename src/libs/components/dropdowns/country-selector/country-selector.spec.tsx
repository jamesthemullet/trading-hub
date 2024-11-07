import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CountrySelectorDropdown } from './country-selector';

describe('Country Selection Dropdown', () => {
  it('should render the dropdown', () => {
    render(<CountrySelectorDropdown onChange={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'select market' })).toBeVisible();
    expect(screen.queryByLabelText('select UK market only')).not.toBeVisible();
    expect(screen.queryByLabelText('select IE market only')).not.toBeVisible();
  });

  it('should open the dropdown and display the options when button is clicked', async () => {
    const user = userEvent.setup();
    render(<CountrySelectorDropdown onChange={jest.fn()} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'select market',
    });

    expect(screen.queryByLabelText('select UK market only')).not.toBeVisible();
    expect(screen.queryByLabelText('select IE market only')).not.toBeVisible();

    await user.click(dropdownButton);

    expect(screen.getByLabelText('select UK market only')).toBeVisible();
    expect(screen.getByLabelText('select IE market only')).toBeVisible();
  });

  it('should change the selected option when an option is clicked, and close the dropdown', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<CountrySelectorDropdown onChange={onChange} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'select market',
    });

    await user.click(dropdownButton);

    const showUK = screen.getByLabelText('select UK market only');

    await user.click(showUK);

    expect(onChange).toHaveBeenCalledWith('UK');
  });

  it('should close dropdown when button is clicked again when already open', async () => {
    const user = userEvent.setup();
    render(<CountrySelectorDropdown onChange={jest.fn()} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'select market',
    });

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should close the dropdown when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<CountrySelectorDropdown onChange={jest.fn()} />);

    const dropdownButton = screen.getByRole('button', {
      name: 'select market',
    });

    await user.click(dropdownButton);

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    expect(dropdownButton).toHaveAttribute('aria-expanded', 'false');
  });
});

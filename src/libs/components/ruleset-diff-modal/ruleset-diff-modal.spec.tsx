import '@testing-library/jest-dom';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';
import { renderWithProviders } from '@/test/render-with-providers';

import { RulesetDiffModal } from './ruleset-diff-modal';

const mockDiffItems: DiffItem[] = [
  { type: 'added', label: 'Pinned product', description: 'prod1' },
  { type: 'removed', label: 'Blocked product', description: 'prod2' },
  {
    type: 'changed',
    label: 'Start date',
    description: '2024-01-01T00:00:00.000Z → 2024-06-01T00:00:00.000Z',
  },
];

describe('RulesetDiffModal', () => {
  it('should render the modal when opened', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Review changes', level: 2 })
    ).toBeVisible();

    expect(
      screen.getByText(/The following changes will go live/)
    ).toBeVisible();
  });

  it('should not render the modal when closed', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened={false}
        diffItems={mockDiffItems}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(
      screen.queryByRole('dialog', { name: 'Review changes' })
    ).not.toBeInTheDocument();
  });

  it('should display diff items', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const diffList = screen.getByRole('list');
    expect(within(diffList).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Added Pinned product')).toBeVisible();
    expect(screen.getByText('prod1')).toBeVisible();
    expect(screen.getByText('Removed Blocked product')).toBeVisible();
    expect(screen.getByText('prod2')).toBeVisible();
    expect(
      screen.getByText('2024-01-01T00:00:00.000Z → 2024-06-01T00:00:00.000Z')
    ).toBeVisible();
  });

  it('should render icons for known labels', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getAllByTestId('change-type-icon')).toHaveLength(3);
  });

  it('should render icons for added and removed keyword labels', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={[
          { type: 'added', label: 'Keyword', description: 'boots' },
          { type: 'removed', label: 'Keyword', description: 'shoes' },
        ]}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getAllByTestId('change-type-icon')).toHaveLength(2);
  });

  it('should mark descending order icons for rotation', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={[
          {
            type: 'changed',
            label: 'Value order down',
            description: 'Highest to lowest',
          },
          {
            type: 'changed',
            label: 'Facet order up',
            description: 'Lowest to highest',
          },
        ]}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    const [descendingIcon, ascendingIcon] =
      screen.getAllByTestId('change-type-icon');

    expect(descendingIcon.closest('span')).toHaveAttribute(
      'data-rotated',
      'true'
    );
    expect(ascendingIcon.closest('span')).not.toHaveAttribute('data-rotated');
  });

  it('should not render an icon for unknown labels', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={[
          {
            type: 'changed',
            label: 'Custom rule',
            description: 'some value',
          },
        ]}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.queryByTestId('change-type-icon')).not.toBeInTheDocument();
  });

  it('should show "No changes detected" when diff is empty', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={[]}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText('No changes detected.')).toBeVisible();
  });

  it('should show the global warning text when showGlobalWarning is true', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        showGlobalWarning
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(
      screen.getByText(
        /This action will apply live changes on the M&S website and app/
      )
    ).toBeVisible();
  });

  it('should not show the global warning text by default', () => {
    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(
      screen.queryByText(
        /This action will apply live changes on the M&S website and app/
      )
    ).not.toBeInTheDocument();
  });

  it('should call onConfirm when "Save changes" is clicked', async () => {
    const user = userEvent.setup();
    const mockConfirm = jest.fn();

    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        onConfirm={mockConfirm}
        onCancel={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(mockConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when "Cancel" is clicked', async () => {
    const user = userEvent.setup();
    const mockCancel = jest.fn();

    renderWithProviders(
      <RulesetDiffModal
        opened
        diffItems={mockDiffItems}
        onConfirm={jest.fn()}
        onCancel={mockCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });
});

import { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RuleSet } from '@/libs/api';
import { renderWithProviders } from '@/test/render-with-providers';

import { BulkActions } from './index';

const mockRules: RuleSet = {
  rules: {
    pinnedProducts: [],
    boosts: { alphanumeric: [], numeric: [], product: [] },
    buries: { alphanumeric: [], numeric: [], product: [] },
    blockedProducts: [],
    includes: {},
    excludes: {},
  },
  isEnabled: true,
};

const mockProps = {
  dispatch: jest.fn(),
  onReset: jest.fn(),
  ruleset: mockRules,
  selectedProducts: ['abc123'],
  hasRestore: false,
};

describe('Product bulk actions', () => {
  it('should render correctly', () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    expect(screen.getByText('1 item selected')).toBeVisible();
  });

  it('should bulk boost', async () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const boostToTop = screen.getByRole('button', { name: 'Boost to Top' });

    act(() => {
      boostToTop.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Apply action',
    });

    act(() => {
      confirmButton.click();
    });

    await waitFor(async () => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        payload: { change: 'add', ids: ['abc123'], operation: 'boost' },
        type: 'product',
      });
    });
  });

  it('should bulk bury', async () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const buryToBottom = screen.getByRole('button', { name: 'Bury to Bottom' });

    act(() => {
      buryToBottom.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Apply action',
    });

    act(() => {
      confirmButton.click();
    });

    await waitFor(async () => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        payload: { change: 'add', ids: ['abc123'], operation: 'bury' },
        type: 'product',
      });
    });
  });

  it('should bulk block', async () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const block = screen.getByRole('button', { name: 'Block Product' });

    act(() => {
      block.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Apply action',
    });

    act(() => {
      confirmButton.click();
    });

    await waitFor(async () => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        payload: { change: 'add', ids: ['abc123'], operation: 'block' },
        type: 'product',
      });
    });
  });

  it('should bulk restore', async () => {
    renderWithProviders(<BulkActions {...mockProps} hasRestore={true} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const restoreButton = screen.getByRole('button', { name: 'Restore' });

    act(() => {
      restoreButton.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    const confirmButton = screen.getByRole('button', {
      name: 'Apply action',
    });

    act(() => {
      confirmButton.click();
    });

    await waitFor(async () => {
      expect(mockProps.dispatch).toHaveBeenCalledWith({
        payload: { change: 'remove', ids: ['abc123'], operation: 'all' },
        type: 'product',
      });
    });
  });

  it('should cancel bulk action', async () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const boostToTop = screen.getByRole('button', { name: 'Boost to Top' });

    act(() => {
      boostToTop.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
    });

    act(() => {
      cancelButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Apply new bulk action')).not.toBeVisible();
    });
  });

  it('should deselect products', () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const deselectButton = screen.getByRole('button', {
      name: 'Deselect',
    });

    act(() => {
      deselectButton.click();
    });

    expect(mockProps.onReset).toHaveBeenCalled();
  });

  it('should close the bulk action popup', () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const bulkActionHeading = screen.getByRole('heading', {
      name: 'Bulk actions',
    });

    expect(bulkActionHeading).toBeVisible();

    const menuOverlay = screen.getByLabelText('menu overlay');

    act(() => {
      menuOverlay.click();
    });

    expect(bulkActionHeading).not.toBeVisible();
  });

  it('should close the apply bulk actions modal', async () => {
    renderWithProviders(<BulkActions {...mockProps} />);

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const block = screen.getByRole('button', { name: 'Block Product' });

    act(() => {
      block.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    await userEvent.keyboard('{Escape}');

    await waitFor(async () => {
      expect(
        screen.queryByRole('heading', { name: 'Apply new bulk action' })
      ).not.toBeVisible();
    });
  });

  it('should show that previously positioned products will be overwritten', async () => {
    renderWithProviders(
      <BulkActions
        {...mockProps}
        selectedProducts={['foo', 'bar', 'baz', 'qux']}
        ruleset={{
          ...mockProps.ruleset,
          rules: {
            ...mockProps.ruleset.rules,
            pinnedProducts: [{ id: 'foo' }],
            blockedProducts: [{ id: 'bar' }],
            boosts: {
              ...mockProps.ruleset.rules.boosts,
              product: [{ id: 'baz', weight: 100 }],
            },
            buries: {
              ...mockProps.ruleset.rules.buries,
              product: [{ id: 'quz', weight: 100 }],
            },
          },
        }}
      />
    );

    const bulkActionsButton = screen.getByRole('button', {
      name: 'Bulk actions',
    });

    act(() => {
      bulkActionsButton.click();
    });

    const block = screen.getByRole('button', { name: 'Block Product' });

    act(() => {
      block.click();
    });

    await waitFor(async () => {
      expect(
        await screen.findByRole('heading', { name: 'Apply new bulk action' })
      ).toBeVisible();
    });

    const message = screen.getByText('Are you sure you want to proceed?', {
      exact: false,
      collapseWhitespace: false,
    });
    expect(message.textContent?.replace(/\u00a0/g, ' ')).toEqual(
      'Are you sure you want to proceed? This action will apply to 4 items and will overwrite existing actions on 3 items.'
    );
  });
});

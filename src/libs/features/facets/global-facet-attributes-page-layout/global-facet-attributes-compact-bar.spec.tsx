import type { ReactElement } from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithProviders } from '@/test/render-with-providers';

import { GlobalFacetAttributesCompactBar } from './global-facet-attributes-compact-bar';

const render = (ui: ReactElement) => renderWithProviders(ui);

const defaultProps = {
  onClose: jest.fn(),
  onSave: jest.fn(),
  onMergeClick: jest.fn(),
  onSearchChange: jest.fn(),
  isWriteEnabled: true,
  isMergeDisabled: true,
  checkedRows: 0,
  isPinned: true,
  onTogglePin: jest.fn(),
};

describe('GlobalFacetAttributesCompactBar', () => {
  it('renders merge, search, cancel, save and unpin buttons', () => {
    render(<GlobalFacetAttributesCompactBar {...defaultProps} />);

    expect(screen.getByRole('button', { name: /Merge/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Unpin top bar' })
    ).toBeInTheDocument();
  });

  it('disables merge button when isMergeDisabled is true', () => {
    render(
      <GlobalFacetAttributesCompactBar {...defaultProps} isMergeDisabled />
    );
    expect(screen.getByRole('button', { name: /Merge/i })).toBeDisabled();
  });

  it('enables merge button when isMergeDisabled is false', () => {
    render(
      <GlobalFacetAttributesCompactBar
        {...defaultProps}
        isMergeDisabled={false}
      />
    );
    expect(screen.getByRole('button', { name: /Merge/i })).toBeEnabled();
  });

  it('disables save button when isWriteEnabled is false', () => {
    render(
      <GlobalFacetAttributesCompactBar
        {...defaultProps}
        isWriteEnabled={false}
      />
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('calls onClose when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(
      <GlobalFacetAttributesCompactBar {...defaultProps} onClose={onClose} />
    );
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when save is clicked', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(
      <GlobalFacetAttributesCompactBar {...defaultProps} onSave={onSave} />
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onMergeClick when merge is clicked and enabled', async () => {
    const user = userEvent.setup();
    const onMergeClick = jest.fn();
    render(
      <GlobalFacetAttributesCompactBar
        {...defaultProps}
        isMergeDisabled={false}
        onMergeClick={onMergeClick}
      />
    );
    await user.click(screen.getByRole('button', { name: /Merge/i }));
    expect(onMergeClick).toHaveBeenCalledTimes(1);
  });

  it('does not show selected count when checkedRows is 0', () => {
    render(
      <GlobalFacetAttributesCompactBar {...defaultProps} checkedRows={0} />
    );
    expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
  });

  it('shows selected count when checkedRows > 0', () => {
    render(
      <GlobalFacetAttributesCompactBar {...defaultProps} checkedRows={3} />
    );
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('calls onTogglePin when pin button is clicked', async () => {
    const user = userEvent.setup();
    const onTogglePin = jest.fn();
    render(
      <GlobalFacetAttributesCompactBar
        {...defaultProps}
        onTogglePin={onTogglePin}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Unpin top bar' }));
    expect(onTogglePin).toHaveBeenCalledTimes(1);
  });
});

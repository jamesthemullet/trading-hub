import '@testing-library/jest-dom';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { DiffItem } from '@/libs/hooks/use-ruleset-diff';
import { renderWithProviders } from '@/test/render-with-providers';

import { ConflictModal } from './conflict-modal';

const MODAL_NAME = 'This ruleset was changed by someone else';

const diffItems: DiffItem[] = [
  { type: 'added', label: 'Category', description: 'cat1' },
  { type: 'added', label: 'Pinned product', description: 'xyz0' },
  { type: 'changed', label: 'Unknown', description: 'no icon' },
];

const baseProps = {
  opened: true,
  diffItems,
  onDiscard: jest.fn(),
  onOverwrite: jest.fn(),
  onClose: jest.fn(),
};

describe('ConflictModal', () => {
  it('shows the conflict message with the editor name and the change list', () => {
    renderWithProviders(<ConflictModal {...baseProps} changedBy="Jane" />);

    const dialog = screen.getByRole('dialog', { name: MODAL_NAME });
    expect(
      within(dialog).getByRole('heading', { level: 2, name: MODAL_NAME })
    ).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Someone else (Jane) saved changes');
    expect(dialog).toHaveTextContent(
      'Changes made by Jane since you opened this ruleset'
    );

    const diffList = within(dialog).getByRole('list');
    expect(within(diffList).getAllByRole('listitem')).toHaveLength(3);
    expect(diffList).toHaveTextContent('Added Pinned product');
    expect(diffList).toHaveTextContent('xyz0');

    // Icons render for known labels only (Category + Pinned product, not Unknown)
    expect(within(dialog).getAllByTestId('change-type-icon')).toHaveLength(2);
  });

  it('shows a generic message and empty state when there are no diffs', () => {
    renderWithProviders(<ConflictModal {...baseProps} diffItems={[]} />);

    const dialog = screen.getByRole('dialog', { name: MODAL_NAME });
    expect(dialog).toHaveTextContent(
      'Someone else saved changes to this ruleset since you opened it.'
    );
    expect(dialog).toHaveTextContent(
      'The specific changes could not be determined.'
    );
  });

  it('calls onOverwrite and onDiscard when the buttons are clicked', async () => {
    const onOverwrite = jest.fn();
    const onDiscard = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ConflictModal
        {...baseProps}
        onOverwrite={onOverwrite}
        onDiscard={onDiscard}
      />
    );

    await user.click(
      screen.getByRole('button', { name: 'Overwrite with my changes' })
    );
    expect(onOverwrite).toHaveBeenCalledTimes(1);

    await user.click(
      screen.getByRole('button', { name: 'Discard my changes' })
    );
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the modal is dismissed', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(<ConflictModal {...baseProps} onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('disables the actions while saving', () => {
    renderWithProviders(<ConflictModal {...baseProps} isSaving />);

    expect(
      screen.getByRole('button', { name: 'Overwrite with my changes' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Discard my changes' })
    ).toBeDisabled();
  });

  it('does not render when closed', () => {
    renderWithProviders(<ConflictModal {...baseProps} opened={false} />);

    expect(
      screen.queryByRole('dialog', { name: MODAL_NAME })
    ).not.toBeInTheDocument();
  });

  it('renders a message-only modal with a custom entity label when diffItems is omitted', () => {
    renderWithProviders(
      <ConflictModal
        opened
        entityLabel="redirect"
        changedBy="Jane"
        onDiscard={jest.fn()}
        onOverwrite={jest.fn()}
        onClose={jest.fn()}
      />
    );

    const dialog = screen.getByRole('dialog', {
      name: 'This redirect was changed by someone else',
    });
    expect(dialog).toHaveTextContent(
      'Someone else (Jane) saved changes to this redirect since you opened it.'
    );
    // No diff list or empty-state in message-only mode
    expect(within(dialog).queryByRole('list')).not.toBeInTheDocument();
    expect(dialog).not.toHaveTextContent(
      'The specific changes could not be determined.'
    );
    // Actions remain available
    expect(
      within(dialog).getByRole('button', { name: 'Overwrite with my changes' })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: 'Discard my changes' })
    ).toBeInTheDocument();
  });
});

import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { ModalUnsavedChanges } from './modal-unsaved-changes';

describe('ModalUnsavedChanges', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <ModalUnsavedChanges onClose={jest.fn()} onContinue={jest.fn()} />
    );

    expect(screen.getByText('Close without saving edits')).toBeInTheDocument();
  });
});

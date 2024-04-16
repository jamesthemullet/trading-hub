import { screen } from '@testing-library/react';

import { ModalUnsavedChanges } from './modal-unsaved-changes';
import { renderWithProviders } from '../../../test/render-with-providers';

describe('ModalUnsavedChanges', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <ModalUnsavedChanges onClose={jest.fn()} onContinue={jest.fn()} />
    );

    expect(screen.getByText('Close without saving edits')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';

import { ModalUnsavedChanges } from './modal-unsaved-changes';

describe('ModalUnsavedChanges', () => {
  it('should render correctly', () => {
    render(<ModalUnsavedChanges onClose={jest.fn()} onContinue={jest.fn()} />);

    expect(screen.getByText('Close without saving edits')).toBeInTheDocument();
  });
});

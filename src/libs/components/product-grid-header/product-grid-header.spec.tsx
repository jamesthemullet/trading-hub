import { act, render, screen } from '@testing-library/react';

import { ProductGridHeader } from './product-grid-header';

describe('ProductGridHeader', () => {
  it('should render correctly', () => {
    render(<ProductGridHeader onSave={jest.fn()} />);

    expect(screen.getByText('Product Grid')).toBeVisible();
  });

  it('should call save callback on click', () => {
    const mockSave = jest.fn();
    render(<ProductGridHeader onSave={mockSave} />);

    const saveButton = screen.getByText('Save');

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalled();
  });
});

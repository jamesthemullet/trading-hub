import { act, render, screen } from '@testing-library/react';

import { ProductGridHeader } from './product-grid-header';

describe('ProductGridHeader', () => {
  it('should render correctly', () => {
    render(
      <ProductGridHeader
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={jest.fn()}
      />
    );

    expect(screen.getByText('Product Grid')).toBeVisible();
  });

  it('should call save callback on click', () => {
    const mockSave = jest.fn();
    render(
      <ProductGridHeader
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={mockSave}
      />
    );

    const saveButton = screen.getByText('Save');

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalled();
  });

  it('should call preview callback on click', () => {
    const mockPreview = jest.fn();
    render(
      <ProductGridHeader
        hasPreview={true}
        onPreview={mockPreview}
        onSave={jest.fn()}
      />
    );

    const previewButton = screen.getByText('Preview');

    act(() => {
      previewButton.click();
    });

    expect(mockPreview).toHaveBeenCalled();
  });
});

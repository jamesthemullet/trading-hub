import { act, screen } from '@testing-library/react';

import { ProductGridHeader } from './product-grid-header';
import { renderWithProviders } from '../../../test/render-with-providers';

describe('ProductGridHeader', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <ProductGridHeader
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        hasChanges={false}
      />
    );

    expect(screen.getByText('Product Grid')).toBeVisible();
  });

  it('should call save callback on click', () => {
    const mockSave = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={mockSave}
        onCancel={jest.fn()}
        hasChanges={false}
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
    renderWithProviders(
      <ProductGridHeader
        hasPreview={true}
        onPreview={mockPreview}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        hasChanges={false}
      />
    );

    const previewButton = screen.getByText('Preview');

    act(() => {
      previewButton.click();
    });

    expect(mockPreview).toHaveBeenCalled();
  });

  it('should show confirmation modal when cancelling', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');

    act(() => {
      cancelButton.click();
    });

    const confirmCloseButton = screen.getByText('Close without saving');

    act(() => {
      confirmCloseButton.click();
    });

    expect(mockCancel).toHaveBeenCalled();
  });

  it('should not show confirmation modal when cancelling without changes', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={false}
      />
    );

    const cancelButton = screen.getByText('Cancel');

    act(() => {
      cancelButton.click();
    });
    expect(mockCancel).toHaveBeenCalled();
  });

  it('should cancel confirmation modal when shown', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');

    act(() => {
      cancelButton.click();
    });

    const continueEditingButton = screen.getByText('Continue editing');

    act(() => {
      continueEditingButton.click();
    });

    expect(mockCancel).not.toHaveBeenCalled();
  });
});

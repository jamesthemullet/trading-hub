import { act, screen } from '@testing-library/react';

import { renderWithProviders } from '../../../test/render-with-providers';
import { ProductGridHeader } from './product-grid-header';

describe('ProductGridHeader', () => {
  it('should render correctly', () => {
    renderWithProviders(
      <ProductGridHeader
        canSave={false}
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    expect(screen.getByText('Title')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('should show Create for new rulesets', () => {
    renderWithProviders(
      <ProductGridHeader
        canSave
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={true}
        shouldHidePreview={false}
        title="Title"
      />
    );

    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  it('should call save callback on click', () => {
    const mockSave = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave={true}
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={mockSave}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });

    act(() => {
      saveButton.click();
    });

    expect(mockSave).toHaveBeenCalled();
  });

  it('should not call save callback on click if does not have save enabled', () => {
    const mockSave = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave={false}
        hasPreview={false}
        onPreview={jest.fn()}
        onSave={mockSave}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    const saveButton = screen.getByRole('button', { name: 'Save' });

    act(() => {
      saveButton.click();
    });

    expect(mockSave).not.toHaveBeenCalled();
  });

  it('should call preview callback on click', () => {
    const mockPreview = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave={true}
        hasPreview={true}
        onPreview={mockPreview}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    const previewButton = screen.getByRole('button', { name: 'Preview' });

    act(() => {
      previewButton.click();
    });

    expect(mockPreview).toHaveBeenCalled();
  });

  it('should show confirmation modal when cancelling', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave={true}
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={true}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

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
        canSave={true}
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    act(() => {
      cancelButton.click();
    });
    expect(mockCancel).toHaveBeenCalled();
  });

  it('should cancel confirmation modal when shown', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave={true}
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={true}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    act(() => {
      cancelButton.click();
    });

    const continueEditingButton = screen.getByText('Continue editing');

    act(() => {
      continueEditingButton.click();
    });

    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('should not show preview button', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave={true}
        hasPreview={true}
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={true}
        isNewRuleSet={false}
        shouldHidePreview={true}
        title="Title"
      />
    );

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });
});

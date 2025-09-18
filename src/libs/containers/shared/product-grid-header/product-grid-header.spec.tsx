import { act, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

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
        rulesetType="search"
        writeEnabled
      />
    );

    expect(screen.getByText('Title')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('should only display cancel button when writeEnabled=false', () => {
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
        writeEnabled={false}
        rulesetType="search"
      />
    );

    expect(
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
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
        isNewRuleSet
        shouldHidePreview={false}
        title="Title"
        rulesetType="search"
        writeEnabled
      />
    );

    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  it('should call save callback on click', () => {
    const mockSave = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        canSave
        hasPreview
        onPreview={jest.fn()}
        onSave={mockSave}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
        rulesetType="search"
        writeEnabled
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
        rulesetType="global"
        writeEnabled
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
        canSave
        hasPreview
        onPreview={mockPreview}
        onSave={jest.fn()}
        onCancel={jest.fn()}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
        rulesetType="global"
        writeEnabled
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
        canSave
        hasPreview
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
        rulesetType="global"
        writeEnabled
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
        canSave
        hasPreview
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges={false}
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
        rulesetType="category"
        writeEnabled
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
        canSave
        hasPreview
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges
        isNewRuleSet={false}
        shouldHidePreview={false}
        title="Title"
        rulesetType="category"
        writeEnabled
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
        canSave
        hasPreview
        onPreview={jest.fn()}
        onSave={jest.fn()}
        onCancel={mockCancel}
        hasChanges
        isNewRuleSet={false}
        shouldHidePreview
        title="Title"
        rulesetType="redirect"
        writeEnabled
      />
    );

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });
});

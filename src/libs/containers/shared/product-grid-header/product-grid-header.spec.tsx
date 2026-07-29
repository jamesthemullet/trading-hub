import { act, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { ProductGridHeader } from './product-grid-header';

const defaultProps = {
  canSave: false,
  hasPreview: false,
  onPreview: jest.fn(),
  onSave: jest.fn(),
  onCancel: jest.fn(),
  hasChanges: false,
  isNewRuleSet: false,
  shouldHidePreview: false,
  title: 'Title',
  rulesetType: 'search',
  isWriteEnabled: true,
};

describe('ProductGridHeader', () => {
  it('should render correctly', () => {
    renderWithProviders(<ProductGridHeader {...defaultProps} />);

    expect(screen.getByText('Title')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('should only display cancel button when isWriteEnabled=false', () => {
    renderWithProviders(
      <ProductGridHeader {...defaultProps} isWriteEnabled={false} />
    );

    expect(
      screen.queryByRole('button', { name: 'Save' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should show Create for new rulesets', () => {
    renderWithProviders(
      <ProductGridHeader {...defaultProps} canSave isNewRuleSet />
    );

    expect(screen.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  it('should call save callback on click', () => {
    const mockSave = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        {...defaultProps}
        canSave
        hasPreview
        onSave={mockSave}
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
        {...defaultProps}
        onSave={mockSave}
        rulesetType="global"
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
        {...defaultProps}
        canSave
        hasPreview
        onPreview={mockPreview}
        rulesetType="global"
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
        {...defaultProps}
        canSave
        hasPreview
        onCancel={mockCancel}
        hasChanges
        rulesetType="global"
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
        {...defaultProps}
        canSave
        hasPreview
        onCancel={mockCancel}
        rulesetType="category"
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
        {...defaultProps}
        canSave
        hasPreview
        onCancel={mockCancel}
        hasChanges
        rulesetType="category"
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

  it('should not show last saved info when lastChanged is not provided', () => {
    renderWithProviders(<ProductGridHeader {...defaultProps} />);

    expect(screen.queryByText(/Last saved by/)).not.toBeInTheDocument();
  });

  it('should show last saved info when lastChanged is provided', () => {
    renderWithProviders(
      <ProductGridHeader
        {...defaultProps}
        lastChanged={{ date: '2024-01-01T12:30:00Z', user: 'test-user' }}
      />
    );

    expect(screen.getByText(/Last saved by:/)).toBeVisible();
    expect(screen.getByText('test-user')).toBeVisible();
    expect(screen.getByText(/Jan 1, 2024/)).toBeVisible();
  });

  it('should not show last saved info when lastChanged has an invalid date', () => {
    renderWithProviders(
      <ProductGridHeader
        {...defaultProps}
        lastChanged={{ date: 'not-a-date', user: 'test-user' }}
      />
    );

    expect(screen.queryByText(/Last saved by/)).not.toBeInTheDocument();
  });

  it('should not show last saved info when lastChanged has no user', () => {
    renderWithProviders(
      <ProductGridHeader
        {...defaultProps}
        lastChanged={{ date: '2024-01-01T12:30:00Z', user: '' }}
      />
    );

    expect(screen.queryByText(/Last saved by/)).not.toBeInTheDocument();
  });

  it('should not show preview button', () => {
    const mockCancel = jest.fn();
    renderWithProviders(
      <ProductGridHeader
        {...defaultProps}
        canSave
        hasPreview
        onCancel={mockCancel}
        hasChanges
        shouldHidePreview
        rulesetType="redirect"
      />
    );

    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });
});

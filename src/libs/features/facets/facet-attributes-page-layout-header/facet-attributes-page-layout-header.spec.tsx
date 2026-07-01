import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetType } from '@/libs/constants/rule-types';
import { renderWithProviders } from '@/test/render-with-providers';

import { FacetAttributesPageLayoutHeader } from './facet-attributes-page-layout-header';

const onCloseMock = jest.fn();

const defaultProps = {
  algoControlValues: 30,
  includedValues: 22,
  excludedValues: 7,
  displayName: 'Age',
  facetType: FacetType.Global,
  onClose: onCloseMock,
  onSave: jest.fn(),
  isSaveDisabled: false,
  isWriteEnabled: true,
  countryCode: 'UK_IE',
};

describe('Facet Page Layout Header', () => {
  it('should render', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader
        {...defaultProps}
        facetType={FacetType.Category}
        headerText="Category specific text"
      />
    );

    expect(
      screen.getByRole('heading', { name: /Value settings of: Age/i })
    ).toBeVisible();
    expect(screen.getByText('Category specific text')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save' })).toBeVisible();
  });

  it('close button should navigate back to appropriate facets editing page', async () => {
    const user = userEvent.setup();

    renderWithProviders(<FacetAttributesPageLayoutHeader {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => expect(onCloseMock).toHaveBeenCalledWith('global'));
  });

  it('should render UK flag when countryCode is UK', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader {...defaultProps} countryCode="UK" />
    );

    const ukFlag = screen.getByAltText('UK rule');
    expect(ukFlag).toBeVisible();
    expect(ukFlag).toHaveAttribute(
      'src',
      expect.stringContaining('icon-uk-flag')
    );
  });

  it('should render IE flag when countryCode is IE', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader {...defaultProps} countryCode="IE" />
    );

    const ieFlag = screen.getByAltText('IE rule');
    expect(ieFlag).toBeVisible();
    expect(ieFlag).toHaveAttribute(
      'src',
      expect.stringContaining('icon-ie-flag')
    );
  });

  it('should render both UK and IE flags when countryCode is UK_IE', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader {...defaultProps} countryCode="UK_IE" />
    );

    expect(screen.getByAltText('UK rule')).toBeVisible();
    expect(screen.getByAltText('IE rule')).toBeVisible();
  });

  it('should disable save button when isWriteEnabled is false', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader
        {...defaultProps}
        isWriteEnabled={false}
      />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should not render undo button by default', () => {
    renderWithProviders(<FacetAttributesPageLayoutHeader {...defaultProps} />);

    expect(
      screen.queryByRole('button', { name: 'Undo' })
    ).not.toBeInTheDocument();
  });

  it('should render a disabled undo button when isUndoButtonVisible is true and isUndoDisabled is true', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader
        {...defaultProps}
        isUndoButtonVisible
        isUndoDisabled
        onUndo={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Undo' })).toBeDisabled();
  });

  it('should render an enabled undo button when isUndoButtonVisible is true and isUndoDisabled is false', () => {
    renderWithProviders(
      <FacetAttributesPageLayoutHeader
        {...defaultProps}
        isUndoButtonVisible
        isUndoDisabled={false}
        onUndo={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Undo' })).toBeEnabled();
  });

  it('should call onUndo when undo button is clicked', async () => {
    const onUndo = jest.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <FacetAttributesPageLayoutHeader
        {...defaultProps}
        isUndoButtonVisible
        isUndoDisabled={false}
        onUndo={onUndo}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onUndo).toHaveBeenCalledTimes(1);
  });
});

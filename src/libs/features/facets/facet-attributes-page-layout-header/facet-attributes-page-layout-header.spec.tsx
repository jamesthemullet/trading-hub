import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetType } from '@/libs/constants/rule-types';

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
  writeEnabled: true,
  countryCode: 'UK_IE',
};

describe('Facet Page Layout Header', () => {
  it('should render', () => {
    render(
      <FacetAttributesPageLayoutHeader
        {...defaultProps}
        facetType={FacetType.Category}
        headerText="Category specific text"
      />
    );

    expect(screen.getByText('Category specific text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('close button should navigate back to appropriate facets editing page', async () => {
    const user = userEvent.setup();

    render(<FacetAttributesPageLayoutHeader {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => expect(onCloseMock).toHaveBeenCalledWith('global'));
  });

  it('should render UK flag when countryCode is UK', () => {
    render(
      <FacetAttributesPageLayoutHeader {...defaultProps} countryCode="UK" />
    );

    const ukFlag = screen.getByAltText('UK rule');
    expect(ukFlag).toBeInTheDocument();
    expect(ukFlag).toHaveAttribute(
      'src',
      expect.stringContaining('icon-uk-flag')
    );
  });

  it('should render IE flag when countryCode is IE', () => {
    render(
      <FacetAttributesPageLayoutHeader {...defaultProps} countryCode="IE" />
    );

    const ieFlag = screen.getByAltText('IE rule');
    expect(ieFlag).toBeInTheDocument();
    expect(ieFlag).toHaveAttribute(
      'src',
      expect.stringContaining('icon-ie-flag')
    );
  });

  it('should render both UK and IE flags when countryCode is UK_IE', () => {
    render(
      <FacetAttributesPageLayoutHeader {...defaultProps} countryCode="UK_IE" />
    );

    const ukFlag = screen.getByAltText('UK rule');
    const ieFlag = screen.getByAltText('IE rule');
    expect(ukFlag).toBeInTheDocument();
    expect(ieFlag).toBeInTheDocument();
  });

  it('should disable save button when writeEnabled is false', () => {
    render(
      <FacetAttributesPageLayoutHeader {...defaultProps} writeEnabled={false} />
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

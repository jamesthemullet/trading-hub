import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetAttributesPageLayoutHeader } from './facet-attributes-page-layout-header';

const onCloseMock = jest.fn();

const defaultProps = {
  algoControlValues: 30,
  includedValues: 22,
  excludedValues: 7,
  displayName: 'Age',
  facetType: 'global' as const,
  onClose: onCloseMock,
};

describe('Facet Page Layout Header', () => {
  it('should render', () => {
    render(<FacetAttributesPageLayoutHeader {...defaultProps} />);

    expect(screen.getByText('Value settings of: Age')).toBeInTheDocument();

    expect(screen.getByTestId('algo-control-count')).toHaveTextContent(
      '30Algo control'
    );
    expect(screen.getByTestId('include-only-count')).toHaveTextContent(
      '22Include only'
    );
    expect(screen.getByTestId('exclude-only-count')).toHaveTextContent(
      '7Exclude only'
    );
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('close button should navigate back to appropriate facets editing page', async () => {
    const user = userEvent.setup();

    render(<FacetAttributesPageLayoutHeader {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => expect(onCloseMock).toHaveBeenCalledWith('global'));
  });
});

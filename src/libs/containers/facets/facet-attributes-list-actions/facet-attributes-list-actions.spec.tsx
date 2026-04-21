import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FacetAttributesListActions } from './facet-attributes-list-actions';

const defaultProps = {
  onSearchChange: jest.fn(),
  isWriteEnabled: true,
};

describe('FacetAttributesListActions', () => {
  it('renders merge button as disabled', () => {
    render(<FacetAttributesListActions {...defaultProps} />);
    expect(screen.getByText('Merge')).toBeInTheDocument();
    expect(screen.getByText('Merge').closest('button')).toBeDisabled();
  });

  it('renders the search input', () => {
    render(<FacetAttributesListActions {...defaultProps} />);
    // The input is inside the custom Search component, so we check for input presence
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('renders drag and drop text when isMergeHidden is true', () => {
    render(<FacetAttributesListActions {...defaultProps} isMergeHidden />);
    expect(
      screen.getByText('Drag and drop to change ranking below')
    ).toBeInTheDocument();
    expect(screen.queryByText('Merge')).not.toBeInTheDocument();
  });

  it('calls onMergeClick when merge button is clicked', async () => {
    const user = userEvent.setup();
    const onMergeClick = jest.fn();

    render(
      <FacetAttributesListActions
        {...defaultProps}
        onMergeClick={onMergeClick}
        isMergeDisabled={false}
      />
    );

    const mergeButton = screen.getByRole('button', { name: /Merge/i });
    await user.click(mergeButton);

    expect(onMergeClick).toHaveBeenCalledTimes(1);
  });

  it('displays checked rows count when checkedRows > 0', () => {
    render(<FacetAttributesListActions {...defaultProps} checkedRows={3} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('disables merge button when isWriteEnabled is false', () => {
    render(
      <FacetAttributesListActions {...defaultProps} isWriteEnabled={false} />
    );
    expect(screen.getByRole('button', { name: /Merge/i })).toBeDisabled();
  });

  it('enables merge button when both isMergeDisabled is false and isWriteEnabled is true', () => {
    render(
      <FacetAttributesListActions
        {...defaultProps}
        isMergeDisabled={false}
        isWriteEnabled
      />
    );
    expect(screen.getByRole('button', { name: /Merge/i })).toBeEnabled();
  });

  it('displays drag and drop text when checkedRows is 0', () => {
    render(<FacetAttributesListActions {...defaultProps} checkedRows={0} />);
    expect(
      screen.getByText('Drag and drop to change ranking below')
    ).toBeInTheDocument();
  });
});

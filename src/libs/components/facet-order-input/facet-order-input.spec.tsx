import { render, screen } from '@testing-library/react';

import { FacetOrderInput } from './facet-order-input';

describe('FacetOrderInput', () => {
  const defaultProps = {
    displayValue: 'test-attribute',
    order: 5,
    localOrder: 5,
    inputRef: jest.fn(),
    onInputChange: jest.fn(),
    onInputBlur: jest.fn(),
    onInputKeyDown: jest.fn(),
    writeEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render successfully with localOrder value', () => {
    render(<FacetOrderInput {...defaultProps} />);

    const input = screen.getByLabelText('Order for test-attribute');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(5);
  });
});

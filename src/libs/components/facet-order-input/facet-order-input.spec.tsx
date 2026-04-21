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
    isWriteEnabled: true,
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

  it('should render input with correct id and aria-label', () => {
    render(<FacetOrderInput {...defaultProps} />);

    const input = screen.getByLabelText('Order for test-attribute');
    expect(input).toHaveAttribute('id', 'order-input-test-attribute');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '1');
  });

  it('should disable input when isWriteEnabled is false', () => {
    render(<FacetOrderInput {...defaultProps} isWriteEnabled={false} />);

    const input = screen.getByLabelText('Order for test-attribute');
    expect(input).toBeDisabled();
  });

  it('should enable input when isWriteEnabled is true', () => {
    render(<FacetOrderInput {...defaultProps} isWriteEnabled />);

    const input = screen.getByLabelText('Order for test-attribute');
    expect(input).toBeEnabled();
  });
});

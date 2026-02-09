import { render, screen } from '@testing-library/react';

import { Input } from './input';

describe('Input', () => {
  it('should render with label', () => {
    render(<Input id="id" name="input" label="Need input" />);

    expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
  });

  it('should hide label', () => {
    render(<Input id="id" name="input" label="Need input" isLabelHidden />);

    expect(screen.queryByText(/need input/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
  });
});

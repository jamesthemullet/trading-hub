import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/render-with-providers';

import { Input } from './input';

describe('Input', () => {
  it('should render with label', () => {
    renderWithProviders(<Input id="id" name="input" label="Need input" />);

    expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
  });

  it('should support label typography variants', () => {
    renderWithProviders(
      <Input
        id="id"
        name="input"
        label="Need input"
        labelVariant="labelLarge"
      />
    );

    expect(screen.getByText(/need input/i)).toHaveAttribute(
      'data-variant',
      'labelLarge'
    );
  });

  it('should expose size and inline variants as data attributes', () => {
    renderWithProviders(
      <Input id="id" name="input" label="Need input" size="small" isInline />
    );

    expect(screen.getByLabelText(/need input/i)).toHaveAttribute(
      'data-size',
      'small'
    );
    expect(screen.getByLabelText(/need input/i)).toHaveAttribute(
      'data-inline',
      'true'
    );
  });

  it('should hide label', () => {
    renderWithProviders(
      <Input id="id" name="input" label="Need input" isLabelHidden />
    );

    expect(screen.queryByText(/need input/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
  });
});

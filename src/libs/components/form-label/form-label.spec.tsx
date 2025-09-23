import { render, screen } from '@testing-library/react';

import { FormLabel } from './form-label';

describe('FormLabel', () => {
  it('should render successfully', () => {
    render(<FormLabel>hello</FormLabel>);

    expect(screen.getByText('hello')).toBeVisible();
  });

  it('should render successfully with correct cursor', () => {
    render(<FormLabel>hello</FormLabel>);

    expect(screen.getByText('hello')).toHaveStyle('cursor: pointer');
  });

  it('should render for screen readers', () => {
    render(<FormLabel isHidden>hello</FormLabel>);

    expect(screen.getByText('hello')).toHaveStyle('clip: rect(0, 0, 0, 0);');
  });

  it('should render the required state', () => {
    render(<FormLabel isRequired>hello</FormLabel>);

    expect(screen.getByText('hello*')).toBeInTheDocument();
  });

  it('should render the FormLabel visually hidden state for specified breakpoint', () => {
    render(<FormLabel>hello</FormLabel>);

    expect(screen.getByText('hello')).not.toHaveStyle(
      'clip: rect(0, 0, 0, 0);'
    );
  });
});

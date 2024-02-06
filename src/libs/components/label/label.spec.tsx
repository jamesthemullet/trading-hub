import { screen, render } from '@testing-library/react';

import { Label } from './label';

describe('Label', () => {
  it('should render successfully', () => {
    render(<Label>hello</Label>);

    expect(screen.getByText('hello')).toBeVisible();
    expect(screen.getByText('hello')).toHaveStyleRule('font-size', '0.875rem');
    expect(screen.getByText('hello')).toHaveStyleRule(
      'font-family',
      'mnsLondonSemiBold,Helvetica,Arial,sans-serif'
    );
  });

  it('should render successfully with correct cursor', () => {
    render(<Label>hello</Label>);

    expect(screen.getByText('hello')).toHaveStyle('cursor: pointer');
  });

  it('should render successfully with default cursor when disabled', () => {
    render(<Label isDisabled>hello</Label>);

    expect(screen.getByText('hello')).not.toHaveStyle('cursor: pointer');
  });

  it('should render for screen readers', () => {
    render(<Label isHidden>hello</Label>);

    expect(screen.getByText('hello')).toHaveStyle('clip: rect(0, 0, 0, 0);');
  });

  it('should render disabled state', () => {
    render(<Label isDisabled>hello</Label>);

    expect(screen.getByText('hello')).toHaveStyle({ color: '#707070' });
  });

  it('should render the required state', () => {
    render(<Label isRequired>hello</Label>);

    expect(screen.getByText('hello*')).toBeInTheDocument();
  });

  it('should render the label visually hidden state for specified breakpoint', () => {
    render(<Label>hello</Label>);

    expect(screen.getByText('hello')).not.toHaveStyle(
      'clip: rect(0, 0, 0, 0);'
    );
  });
});

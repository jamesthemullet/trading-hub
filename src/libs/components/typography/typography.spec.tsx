import { render, screen } from '@testing-library/react';

import { Typography } from './typography';

describe('Typography', () => {
  it('should render correctly with default props', () => {
    render(<Typography>Test Text</Typography>);
    const element = screen.getByText('Test Text');
    expect(element.tagName).toBe('P');
    expect(element).toHaveAttribute('data-variant', 'bodyMedium');
    expect(element).toHaveAttribute('data-strong', 'false');
    expect(element).toHaveAttribute('data-with-margin', 'false');
    expect(element).toHaveAttribute('data-align', 'left');
  });

  it('should pass className and other props correctly', () => {
    render(
      <Typography
        variant="headlineLarge"
        as="h1"
        isStrong
        hasMargin
        className="custom-class"
        role="heading"
      >
        Custom Text
      </Typography>
    );
    const element = screen.getByText('Custom Text');
    expect(element.tagName).toBe('H1');
    expect(element).toHaveAttribute('data-variant', 'headlineLarge');
    expect(element).toHaveAttribute('data-strong', 'true');
    expect(element).toHaveAttribute('data-with-margin', 'true');
    expect(element).toHaveAttribute('data-align', 'left');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveAttribute('role', 'heading');
  });
});

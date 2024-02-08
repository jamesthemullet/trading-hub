import { render, screen } from '@testing-library/react';

import { VisuallyHide } from './visually-hide';

describe('Visually Hide', () => {
  it('should set the hidden styles on the rendered element', () => {
    render(<VisuallyHide as="h2">Accessibility text</VisuallyHide>);
    const hiddenElement = screen.getByText('Accessibility text');

    expect(hiddenElement).toBeInTheDocument();
    expect(hiddenElement).toHaveStyleRule('position', 'absolute');
    expect(hiddenElement).toHaveStyleRule('left', '-999px');
  });
});

import { screen, render } from '@testing-library/react';

import type { MessagingProps } from './messaging';
import { Messaging } from './messaging';

const props = {
  variant: 'info' as MessagingProps['variant'],
  children: 'Message content',
};

describe('Messaging', () => {
  it('should render info message', () => {
    render(<Messaging {...props} hasIcon />);
    const infoIcon = screen.getByRole('presentation').parentElement;
    const element = screen.getByText(/message content/i).parentElement;

    expect(screen.getByText(/message content/i)).toBeInTheDocument();
    expect(element?.parentElement).toHaveStyleRule(
      'background-color',
      '#eaf0f3'
    );
    expect(infoIcon).toHaveStyleRule('align-self', 'flex-start');
  });

  it('should render error message with a role of "alert"', () => {
    render(<Messaging {...props} variant="error" hasIcon />);
    const element = screen.getByText(/message content/i).parentElement;

    expect(screen.getByRole('alert')).toHaveTextContent(/message content/i);
    expect(element?.parentElement).toHaveStyleRule(
      'background-color',
      '#fff3f4'
    );
  });

  it('should render a success message', () => {
    render(<Messaging {...props} variant="success" hasIcon />);
    const element = screen.getByText(/message content/i).parentElement;

    expect(screen.getByText(/message content/i)).toBeInTheDocument();
    expect(element?.parentElement).toHaveStyleRule(
      'background-color',
      '#f4faed'
    );
  });

  it('should render without a background colour', () => {
    render(<Messaging {...props} variant="success" hasBackground={false} />);
    const content =
      screen.getByText(/message content/i).parentElement?.parentElement;

    expect(content).not.toHaveStyleRule('background-color', '#f4faed');
  });

  it('should handle invalid variant', () => {
    const invalidVariant = 'invalid-variant' as 'info';
    render(<Messaging {...props} variant={invalidVariant} />);

    expect(screen.queryByRole('presentation')).toBe(null);
  });

  it('should render icon aligned centrally', () => {
    render(<Messaging {...props} hasIcon isIconAlignedCentrally />);
    const icon = screen.getByRole('presentation').parentElement;

    expect(icon).toHaveStyleRule('align-self', 'center');
  });

  it('should render an inline error message', () => {
    render(<Messaging {...props} variant="inlineError" />);
    const span = screen.getByText((_, element) => {
      return element?.tagName.toLowerCase() === 'span';
    });

    expect(span).toHaveStyleRule('top', '0');
  });
});

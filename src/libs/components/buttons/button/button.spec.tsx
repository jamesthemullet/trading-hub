import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from './button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>foo</Button>);

    expect(screen.getByText('foo')).toBeInTheDocument();
  });

  it('should render as a link', () => {
    render(
      <Button as="a" href="/bar" theme="primary">
        foo
      </Button>
    );

    expect(screen.getByText('foo').getAttribute('href')).toBe('/bar');
  });

  it('should call an onclick handler', async () => {
    const mockClickHandler = jest.fn();
    render(<Button onClick={mockClickHandler}>foo</Button>);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('foo'));

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should not call an onclick handler when disabled', async () => {
    const mockClickHandler = jest.fn();
    render(
      <Button onClick={mockClickHandler} isDisabled={true}>
        foo
      </Button>
    );

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByText('foo'));

    expect(mockClickHandler).not.toHaveBeenCalled();
  });
});

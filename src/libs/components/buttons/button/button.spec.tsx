import { render, screen } from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';

import { Button } from './button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<Button>foo</Button>);

    expect(screen.getByRole('button', { name: 'foo' })).toBeInTheDocument();
  });

  it('should render as a link', () => {
    render(
      <Button as="a" href="/bar" theme="primary">
        foo
      </Button>
    );

    expect(screen.getByRole('link', { name: 'foo' }).getAttribute('href')).toBe(
      '/bar'
    );
  });

  it('should render a tertiary button', () => {
    render(
      <>
        <Button theme="tertiary">foo</Button>

        <Button theme="tertiary" isDisabled>
          bar
        </Button>
      </>
    );

    expect(screen.getByRole('button', { name: 'foo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'bar' })).toBeVisible();
  });

  it('should call an onclick handler', async () => {
    const mockClickHandler = jest.fn();
    render(<Button onClick={mockClickHandler}>foo</Button>);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: 'foo' }));

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should not call an onclick handler when disabled', async () => {
    const mockClickHandler = jest.fn();
    render(
      <Button onClick={mockClickHandler} isDisabled={true}>
        foo
      </Button>
    );

    const button = screen.getByRole('button', { name: 'foo' });
    await userEvent.click(button, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    expect(mockClickHandler).not.toHaveBeenCalled();
  });
});

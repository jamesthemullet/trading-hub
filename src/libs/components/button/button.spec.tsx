import { render, screen } from '@testing-library/react';
import userEvent, {
  PointerEventsCheckLevel,
} from '@testing-library/user-event';

import { Button, ButtonDeprecated } from './button';

describe('Button', () => {
  it('should render correctly', () => {
    render(<ButtonDeprecated>foo</ButtonDeprecated>);

    expect(screen.getByRole('button', { name: 'foo' })).toBeInTheDocument();
  });

  it('should render button correctly', () => {
    render(<Button>foo</Button>);

    expect(screen.getByRole('button', { name: 'foo' })).toBeInTheDocument();
  });

  it('should render tertiary', () => {
    render(
      <>
        <ButtonDeprecated theme="tertiary">foo</ButtonDeprecated>

        <ButtonDeprecated theme="tertiary" isDisabled>
          bar
        </ButtonDeprecated>
      </>
    );

    expect(screen.getByRole('button', { name: 'foo' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'bar' })).toBeVisible();
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
    render(<ButtonDeprecated onClick={mockClickHandler}>foo</ButtonDeprecated>);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: 'foo' }));

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should call a button onclick handler', async () => {
    const mockClickHandler = jest.fn();
    render(<Button onClick={mockClickHandler}>foo</Button>);

    const user = userEvent.setup({ delay: null });
    await user.click(screen.getByRole('button', { name: 'foo' }));

    expect(mockClickHandler).toHaveBeenCalled();
  });

  it('should not call an onclick handler when disabled', async () => {
    const mockClickHandler = jest.fn();
    render(
      <ButtonDeprecated onClick={mockClickHandler} isDisabled>
        foo
      </ButtonDeprecated>
    );

    const button = screen.getByRole('button', { name: 'foo' });
    await userEvent.click(button, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    expect(mockClickHandler).not.toHaveBeenCalled();
  });

  it('should not call a button onclick handler when disabled', async () => {
    const mockClickHandler = jest.fn();
    render(
      <Button onClick={mockClickHandler} isDisabled>
        foo
      </Button>
    );

    const button = screen.getByRole('button', { name: 'foo' });
    await userEvent.click(button, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    });

    expect(mockClickHandler).not.toHaveBeenCalled();
  });

  describe('link', () => {
    it('should render as a link', () => {
      render(
        <ButtonDeprecated as="a" href="/bar" theme="primary">
          foo
        </ButtonDeprecated>
      );

      expect(screen.getByRole('link', { name: 'foo' })).toHaveAttribute(
        'href',
        '/bar'
      );
    });

    it('should render button as a link', () => {
      render(
        <Button as="a" href="/bar" theme="primary">
          foo
        </Button>
      );

      expect(screen.getByRole('link', { name: 'foo' })).toHaveAttribute(
        'href',
        '/bar'
      );
    });

    it('should render as disabled link', () => {
      render(
        <ButtonDeprecated as="a" href="/bar" theme="primary" isDisabled>
          foo
        </ButtonDeprecated>
      );

      expect(screen.getByRole('link', { name: 'foo' })).toHaveAttribute(
        'href',
        '/bar'
      );
      expect(screen.getByRole('link', { name: 'foo' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });

    it('should render button as disabled link', () => {
      render(
        <Button as="a" href="/bar" theme="primary" isDisabled>
          foo
        </Button>
      );

      expect(screen.getByRole('link', { name: 'foo' })).toHaveAttribute(
        'href',
        '/bar'
      );
      expect(screen.getByRole('link', { name: 'foo' })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });
});

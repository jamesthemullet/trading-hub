import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dropdown } from './dropdown';

const defaultProps = {
  isOpen: false,
  onOpen: jest.fn(),
  label: 'dropdown',
  onClose: jest.fn(),
};

describe('Filter dropdown', () => {
  afterEach(() => {
    defaultProps.onOpen.mockClear();
    defaultProps.onClose.mockClear();
  });

  it('should render the button without children', () => {
    render(
      <Dropdown {...defaultProps}>
        <div>Content</div>
      </Dropdown>
    );

    expect(screen.queryByText('Content')).not.toBeVisible();
  });

  it('should render the button with children', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Dropdown {...defaultProps}>
        <div>Content</div>
      </Dropdown>
    );

    await user.click(screen.getByRole('button'));
    expect(defaultProps.onOpen).toHaveBeenCalled();
    rerender(
      <Dropdown {...defaultProps} isOpen>
        <div>Content</div>
      </Dropdown>
    );
    expect(screen.queryByText('Content')).toBeVisible();
  });

  it('should close dropdown when button is clicked again when already open', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Dropdown {...defaultProps} isOpen>
        <div>Content</div>
      </Dropdown>
    );

    await user.click(screen.getByRole('button'));
    expect(defaultProps.onClose).toHaveBeenCalled();
    rerender(
      <Dropdown {...defaultProps}>
        <div>Content</div>
      </Dropdown>
    );
    expect(screen.queryByText('Content')).not.toBeVisible();
  });

  it('should render the footerContent with children', () => {
    render(
      <Dropdown
        {...defaultProps}
        footerContent={
          <footer>
            <button>Done</button>
          </footer>
        }
        isOpen
      >
        <div>Content</div>
      </Dropdown>
    );

    expect(screen.queryByText('Content')).toBeVisible();
    expect(screen.queryByText('Done')).toBeVisible();
  });

  it('should render content starting from left', () => {
    render(
      <Dropdown {...defaultProps} isOpen>
        Content
      </Dropdown>
    );

    expect(screen.queryByText('Content')).toBeVisible();
    expect(screen.getByText('Content').parentElement).toHaveStyleRule(
      'left',
      '0'
    );
  });

  it('should align content from right', () => {
    render(
      <Dropdown {...defaultProps} alignContentTowards="right" isOpen>
        Content
      </Dropdown>
    );

    expect(screen.queryByText('Content')).toBeVisible();
    expect(screen.getByText('Content').parentElement).toHaveStyleRule(
      'right',
      '0'
    );
  });

  it('should close dropdown when escape is pressed', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps} isOpen>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.keyboard('{Escape}');
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should not call onClose when dropdown is not open', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps}>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.keyboard('{Escape}');
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should open on space key when already closed', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps}>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.keyboard(' ');
    expect(defaultProps.onOpen).toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should close on space key when already open', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps} isOpen>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.keyboard(' ');
    expect(defaultProps.onOpen).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should close on shift tab when already open', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps} isOpen>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.tab({ shift: true });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('should not close on non-shift tab when already open', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps} isOpen>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.tab();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should not close on shift tab when already closed', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown {...defaultProps}>
        <div>Content</div>
      </Dropdown>
    );

    const dialogButton = screen.getByRole('button');
    dialogButton.focus();
    await user.tab({ shift: true });
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});

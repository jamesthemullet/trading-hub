import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useOnOutsideClick } from './use-on-outside-click';

const handlerFn = jest.fn();

const TestComponent = (props: { shouldEnableOutsideClick?: boolean }) => {
  const ref = useOnOutsideClick<HTMLDivElement>({
    handler: handlerFn,
    ...props,
  });
  return (
    <div>
      <span>Outside content</span>
      <div ref={ref}>
        <span>Content</span>
      </div>
    </div>
  );
};

describe('useOnOutsideClick', () => {
  it('should not add listeners when enableOutsideClick is false', async () => {
    const user = userEvent.setup();
    render(<TestComponent shouldEnableOutsideClick={false} />);

    await user.click(screen.getByText('Outside content'));
    expect(handlerFn).not.toHaveBeenCalled();
  });

  it('should add listeners when enableOutsideClick is true', async () => {
    const user = userEvent.setup();
    render(<TestComponent />);

    await user.click(screen.getByText('Content'));
    expect(handlerFn).not.toHaveBeenCalled();
    await user.click(screen.getByText('Outside content'));
    expect(handlerFn).toHaveBeenCalled();
  });
});

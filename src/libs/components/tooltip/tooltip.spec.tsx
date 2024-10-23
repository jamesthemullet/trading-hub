import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Tooltip, tooltipAriaLabelledBy } from './tooltip';

describe('Tooltip', () => {
  it('should render with a right aligned arrow', () => {
    render(<Tooltip text="Some text" id="inputId" arrowAlignment="right" />);
    const openButton = screen.getByLabelText('Open tooltip');
    const closeButton = screen.getByLabelText('Close tooltip');
    const tooltipText = screen.getByText('Some text');
    const tooltip = tooltipText.parentElement;

    expect(openButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
    expect(tooltipText).toHaveAttribute('id', 'inputId-tooltip');
    expect(tooltip).toHaveStyleRule('display', 'none');
    expect(tooltip).toHaveStyleRule('right', 'calc(0.75rem - 2px)', {
      target: ':after',
    });
  });

  it('should render with a left aligned arrow', () => {
    render(<Tooltip text="Some text" id="inputId" arrowAlignment="left" />);
    const tooltip = screen.getByText('Some text').parentElement;

    expect(tooltip).toHaveStyleRule('display', 'none');
    expect(tooltip).toHaveStyleRule('left', 'calc(0.75rem + 2px)', {
      target: ':after',
    });
  });

  it('should render with a middle aligned arrow', () => {
    render(<Tooltip text="Some text" id="inputId" arrowAlignment="middle" />);
    const tooltip = screen.getByText('Some text').parentElement;

    expect(tooltip).toHaveStyleRule('display', 'none');
    expect(tooltip).toHaveStyleRule('left', 'calc(7rem + 2px)', {
      target: ':after',
    });
  });

  describe('Click behaviour', () => {
    it('should show and hide the tooltip when the info icon is clicked', async () => {
      const user = userEvent.setup();
      render(<Tooltip text="Some text" id="inputId" />);
      const openButton = screen.getByLabelText('Open tooltip');
      const tooltipText = screen.getByText('Some text').parentElement;

      await user.click(openButton);
      expect(tooltipText).toHaveStyleRule('display', 'inline-flex');

      await user.click(openButton);
      expect(tooltipText).toHaveStyleRule('display', 'none');
    });

    it('should hide the tooltip when the close icon is clicked', async () => {
      const user = userEvent.setup();
      render(<Tooltip text="Some text" id="inputId" />);
      const openButton = screen.getByLabelText('Open tooltip');
      const closeButton = screen.getByLabelText('Close tooltip');
      const tooltipText = screen.getByText('Some text').parentElement;

      await user.click(openButton);
      expect(tooltipText).toHaveStyleRule('display', 'inline-flex');

      await user.click(closeButton);
      expect(tooltipText).toHaveStyleRule('display', 'none');
    });

    it('should hide the tooltip when a click is made anywhere outside of the tooltip', async () => {
      const user = userEvent.setup();
      render(<Tooltip text="Some text" id="inputId" />);
      const openButton = screen.getByLabelText('Open tooltip');
      const tooltipText = screen.getByText('Some text').parentElement;
      const bodyElement =
        tooltipText?.parentElement?.parentElement?.parentElement;
      await user.click(openButton);

      expect(tooltipText).toHaveStyleRule('display', 'inline-flex');
      expect(bodyElement).toBeDefined();
      if (bodyElement) {
        await user.click(bodyElement);
      }
      expect(tooltipText).toHaveStyleRule('display', 'none');
    });
  });

  it('should output the string for the aria-labelledby for form fields', () => {
    expect(tooltipAriaLabelledBy('inputId')).toEqual({
      'aria-labelledby': 'inputId inputId-tooltip',
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input, InputDeprecated } from './input';

describe('Input', () => {
  describe('InputDeprecated', () => {
    it('should render with label', () => {
      render(<InputDeprecated id="id" name="input" label="Need input" />);

      expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
    });

    it('should hide label', () => {
      render(
        <InputDeprecated
          id="id"
          name="input"
          label="Need input"
          isLabelHidden
        />
      );

      expect(screen.queryByText(/need input/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
    });

    it('should toggle focus styling', async () => {
      const user = userEvent.setup();
      render(<InputDeprecated id="id" label="Need input" />);
      const input = screen.getByLabelText('Need input');
      await user.click(input);

      expect(input).toHaveStyle(`
      padding: 0.5rem;
      width: 100%;
      height: 3rem;
      font-size: 1rem;
      border-color: #999999;
      background: rgb(255, 255, 255);
    `);

      expect(input).toHaveStyleRule('cursor', 'not-allowed', {
        target: ':disabled',
      });
      expect(input).toHaveStyleRule('border-color', '#ccc', {
        target: ':disabled',
      });
      expect(input).toHaveStyleRule('color', '#ccc', {
        target: ':placeholder',
      });
      expect(input).toHaveStyleRule('box-shadow', 'none', { target: ':focus' });
    });

    it('Should set isEmpty state on initial render', () => {
      render(<InputDeprecated id="id" label="input" />);
      const input = screen.getByLabelText('input');
      expect(input).toHaveStyleRule('border', '1px solid #ccc');
      expect(input).not.toHaveStyleRule('border-color', '#100e0e');
    });

    it('Should update the isEmpty state on change', async () => {
      const user = userEvent.setup();
      render(<InputDeprecated id="id" label="input" />);
      const input = screen.getByLabelText('input');
      await user.type(input, 'input now contains text');
      expect(input).toHaveStyleRule('border-color', '#999999');
    });

    it('Should invoke a provided onChange callback', async () => {
      const onChangeHandler = jest.fn();
      const user = userEvent.setup();
      render(
        <InputDeprecated id="id" label="input" onChange={onChangeHandler} />
      );
      const input = screen.getByLabelText('input');
      await user.type(input, 'input now contains text');
      expect(onChangeHandler).toHaveBeenCalled();
    });
  });

  describe('Input', () => {
    it('should render with label', () => {
      render(<Input id="id" name="input" label="Need input" />);

      expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
    });

    it('should hide label', () => {
      render(<Input id="id" name="input" label="Need input" isLabelHidden />);

      expect(screen.queryByText(/need input/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
    });

    it('should toggle focus styling', async () => {
      const user = userEvent.setup();
      render(<InputDeprecated id="id" label="Need input" />);
      const input = screen.getByLabelText('Need input');
      await user.click(input);

      expect(input).toHaveStyle(`
      padding: 0.5rem;
      width: 100%;
      height: 3rem;
      font-size: 1rem;
      border-color: #999999;
      background: rgb(255, 255, 255);
    `);

      expect(input).toHaveStyleRule('cursor', 'not-allowed', {
        target: ':disabled',
      });
      expect(input).toHaveStyleRule('border-color', '#ccc', {
        target: ':disabled',
      });
      expect(input).toHaveStyleRule('color', '#ccc', {
        target: ':placeholder',
      });
      expect(input).toHaveStyleRule('box-shadow', 'none', { target: ':focus' });
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Input } from './input';

describe('Input', () => {
  it('should render successfully', () => {
    render(<Input id="id" name="input" label="Need input" />);

    expect(screen.getByLabelText(/need input/i)).toBeInTheDocument();
  });

  it('should hide label', () => {
    render(
      <Input id="id" name="input" label="Need input" isLabelHidden={true} />
    );

    expect(screen.getByText('Need input')).toHaveStyle(
      'clip: rect(0, 0, 0, 0);'
    );
  });

  it('should toggle focus styling', async () => {
    const user = userEvent.setup();
    render(<Input id="id" label="Need input" />);
    const input = screen.getByLabelText('Need input');
    await user.click(input);

    expect(input).toHaveStyle(`
      padding: 0.5rem;
      width: 100%;
      height: 3rem;
      font-size: 1rem;
      border-color: #999;
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
    render(<Input id="id" label="input" />);
    const input = screen.getByLabelText('input');
    expect(input).toHaveStyleRule('border', '1px solid #ccc');
    expect(input).not.toHaveStyleRule('border-color', '#100e0e');
  });

  it('Should update the isEmpty state on change', async () => {
    const user = userEvent.setup();
    render(<Input id="id" label="input" />);
    const input = screen.getByLabelText('input');
    await user.type(input, 'input now contains text');
    expect(input).toHaveStyleRule('border-color', '#999');
  });

  it('Should invoke a provided onChange callback', async () => {
    const onChangeHandler = jest.fn();
    const user = userEvent.setup();
    render(<Input id="id" label="input" onChange={onChangeHandler} />);
    const input = screen.getByLabelText('input');
    await user.type(input, 'input now contains text');
    expect(onChangeHandler).toHaveBeenCalled();
  });

  it('Should be able to display an error message and change border colour', () => {
    render(
      <Input
        id="id"
        label="input"
        message={{ text: 'Error message', variant: 'error' }}
      />
    );
    const input = screen.getByLabelText('input');
    expect(input).toHaveStyleRule('border-color', '#ea122a');
    expect(input.nextSibling).toHaveTextContent('Error message');
  });

  it('Should be able to display an inline error message and change border colour', () => {
    render(
      <Input
        id="id"
        label="input"
        message={{ text: 'Error message', variant: 'inlineError' }}
      />
    );
    const input = screen.getByLabelText('input');
    expect(input).toHaveStyleRule('border-color', '#ea122a');
    expect(input.nextSibling).toHaveTextContent('Error message');
  });

  it('Should restrict to maxLength when characters > maxLength', async () => {
    const user = userEvent.setup();
    const onChangeHandler = jest.fn();
    render(
      <Input id="id" label="input" onChange={onChangeHandler} maxLength={12} />
    );
    const input = screen.getByLabelText('input');
    await user.type(input, 'this is more than 12 characters long');
    expect(input).toHaveValue('this is more');
  });

  it('Should not restrict length when maxLength is not provided', async () => {
    const onChangeHandler = jest.fn();
    const user = userEvent.setup();
    render(<Input id="id" label="input" onChange={onChangeHandler} />);
    const input = screen.getByLabelText('input');
    await user.type(input, 'this is more than 12 characters long');
    expect(input).toHaveValue('this is more than 12 characters long');
  });

  it('Should not restrict to maxLength when characters <= maxLength', async () => {
    const onChangeHandler = jest.fn();
    const user = userEvent.setup();
    render(
      <Input id="id" label="input" onChange={onChangeHandler} maxLength={12} />
    );
    const input = screen.getByLabelText('input');
    await user.type(input, 'lt 12 chars');
    expect(input).toHaveValue('lt 12 chars');
  });

  it('Should update state to defaultValue when it is provided', () => {
    const onChangeHandler = jest.fn();
    render(
      <Input
        id="id"
        label="input"
        onChange={onChangeHandler}
        defaultValue="test value"
      />
    );
    const input = screen.getByLabelText('input');
    expect(input).toHaveValue('test value');
  });

  it('should display a tooltip component when passed', () => {
    render(
      <Input
        id="inputId"
        label="input"
        tooltip={{ text: 'An additional help message' }}
      />
    );

    expect(screen.getByLabelText('Open tooltip')).toBeInTheDocument();
    expect(screen.getByText('An additional help message')).toBeInTheDocument();
    expect(screen.getByRole('textbox').getAttribute('aria-labelledby')).toEqual(
      'inputId inputId-tooltip'
    );
  });

  it('should display the character limit count when the maxLength prop is truthy', () => {
    render(<Input id="inputId" label="input" maxLength={10} />);

    expect(screen.getByText('10 Characters left')).toBeInTheDocument();
  });

  it('should not display the character limit when the maxLength prop is falsy', () => {
    render(<Input id="inputId" label="input" maxLength={0} />);

    expect(screen.queryByText('0 Characters left')).not.toBeInTheDocument();
  });

  it('should update the character limit as the user types', async () => {
    render(<Input id="inputId" label="input" maxLength={10} />);
    const user = userEvent.setup();

    const input = screen.getByLabelText('input');
    await user.type(input, 'hello');
    expect(screen.getByText('5 Characters left')).toBeInTheDocument();
  });

  it("should display 'character' instead of 'characters' when there is a single character left", async () => {
    render(<Input id="inputId" label="input" maxLength={10} />);

    const user = userEvent.setup();
    const input = screen.getByLabelText('input');
    await user.type(input, '123456789');

    expect(screen.getByText('1 Character left')).toBeInTheDocument();
  });

  it('should prevent further typing when the user reaches the character limit', async () => {
    render(<Input id="inputId" label="input" maxLength={5} />);

    const user = userEvent.setup();
    const input = screen.getByLabelText('input');
    await user.type(input, 'hello there');

    expect(screen.getByText('0 Characters left')).toBeInTheDocument();
    expect(input).toHaveValue('hello');
  });
});

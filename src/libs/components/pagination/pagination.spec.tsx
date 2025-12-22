import { act, render, screen } from '@testing-library/react';

import { Pagination } from './pagination';

describe('Pagination', () => {
  it('should render successfully', () => {
    render(<Pagination current={1} total={1} onClick={jest.fn()} />);
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
  });

  it('should render the correct page number', () => {
    const onClickCallback = jest.fn();
    render(<Pagination current={2} total={5} onClick={onClickCallback} />);

    act(() => {
      screen.getByRole('button', { name: 'Next page' }).click();
    });

    expect(onClickCallback).toHaveBeenCalledWith(3);

    act(() => {
      screen.getByRole('button', { name: 'Previous page' }).click();
    });

    expect(onClickCallback).toHaveBeenCalledWith(1);
  });
});

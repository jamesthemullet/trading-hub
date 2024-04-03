import { act } from 'react-dom/test-utils';
import { render, screen } from '@testing-library/react';

import { Pagination } from './pagination';

describe('Pagination', () => {
  it('should render successfully', () => {
    render(
      <Pagination
        current={1}
        total={1}
        onClick={() => {
          // empty
        }}
      />
    );
    expect(screen.getByText('Page 1 of 1')).toBeTruthy();
  });

  it('should render the correct page number', () => {
    const onClickCallback = jest.fn();
    const { container } = render(
      <Pagination current={2} total={5} onClick={onClickCallback} />
    );

    const nextPageButton = container.querySelector<HTMLButtonElement>(
      'button[name="next-button"]'
    );

    if (!nextPageButton) {
      throw new Error('Next page button not found');
    }

    act(() => {
      nextPageButton.click();
    });

    expect(onClickCallback).toHaveBeenCalledWith(expect.anything(), 3);

    const prevPageButton = container.querySelector<HTMLButtonElement>(
      'button[name="prev-button"]'
    );

    if (!prevPageButton) {
      throw new Error('Prev page button not found');
    }

    act(() => {
      prevPageButton.click();
    });

    expect(onClickCallback).toHaveBeenCalledWith(expect.anything(), 1);
  });
});

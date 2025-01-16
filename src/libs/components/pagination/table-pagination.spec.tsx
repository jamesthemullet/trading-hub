import { act, render, screen, waitFor } from '@testing-library/react';

import { TablePagination } from './table-pagination';

const pageSizes = [10, 20, 50, 100];

describe('TablePagination', () => {
  it('should open and close sizes menu', async () => {
    const mockProps = {
      pagination: {
        totalItems: 0,
      },
      currentPage: 1,
      currentPageSize: pageSizes[0],
      handlePageChange: jest.fn(),
      pageSizes,
    };

    const { container } = render(<TablePagination {...mockProps} />);

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    const label = await screen.findByText('100');

    expect(label).toBeVisible();

    act(() => {
      dropdown.click();
    });

    expect(await screen.findByText('100')).not.toBeVisible();
  });

  it('should open select item and change page size', async () => {
    const handlePageChangeSpy = jest.fn();
    const mockProps = {
      pagination: {
        totalItems: 0,
      },
      currentPage: 1,
      currentPageSize: pageSizes[0],
      handlePageChange: handlePageChangeSpy,
      pageSizes,
    };

    const { container } = render(<TablePagination {...mockProps} />);

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    const label = await screen.findByText('100');

    expect(label).toBeVisible();

    act(() => {
      label.click();
    });

    expect(handlePageChangeSpy).toHaveBeenCalledWith(1, 100);
  });

  it('should change current page', () => {
    const handlePageChangeSpy = jest.fn();

    const mockProps = {
      pagination: {
        totalItems: 97,
      },
      currentPage: 2,
      currentPageSize: pageSizes[0],
      handlePageChange: handlePageChangeSpy,
      pageSizes,
    };

    render(<TablePagination {...mockProps} />);
    const text = 'Page 2 of 10';

    expect(screen.getByText(text)).toBeVisible();

    act(() => {
      screen.getByRole('button', { name: 'Next page' }).click();
    });
    expect(handlePageChangeSpy).toHaveBeenCalledWith(3, 10);

    act(() => {
      screen.getByRole('button', { name: 'Previous page' }).click();
    });

    expect(handlePageChangeSpy).toHaveBeenCalledWith(1, 10);
  });

  it('should change page to 1 when there is no items on current page due to page sizes change', async () => {
    const handlePageChangeSpy = jest.fn();

    const mockProps = {
      pagination: {
        totalItems: 13,
      },
      currentPage: 2,
      currentPageSize: pageSizes[0],
      handlePageChange: handlePageChangeSpy,
      pageSizes,
    };
    const { container } = render(<TablePagination {...mockProps} />);

    const newText = 'Page 2 of 2';
    expect(await screen.findByText(newText)).toBeVisible();

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    const label = await screen.findByText('100');

    expect(label).toBeVisible();

    act(() => {
      label.click();
    });

    expect(handlePageChangeSpy).toHaveBeenCalledWith(1, 100);
  });

  it('should not change page to 1 when there are still items on current page due to page sizes change', async () => {
    const handlePageChangeSpy = jest.fn();

    const mockProps = {
      pagination: {
        totalItems: 80,
      },
      currentPage: 2,
      currentPageSize: pageSizes[0],
      pageSizes,
      handlePageChange: handlePageChangeSpy,
    };
    const { container } = render(<TablePagination {...mockProps} />);

    const newText = 'Page 2 of 8';
    expect(await screen.findByText(newText)).toBeVisible();

    const dropdown = container.querySelector<HTMLElement>(
      'span[name="ChevronDownDefault"]'
    );

    if (!dropdown) {
      throw new Error('Dropdown not found');
    }

    act(() => {
      dropdown.click();
    });

    await waitFor(() => {
      expect(screen.getByText('20')).toBeVisible();
    });

    const label = await screen.findByText('20');

    act(() => {
      label.click();
    });

    expect(handlePageChangeSpy).toHaveBeenCalledWith(2, 20);
  });
});

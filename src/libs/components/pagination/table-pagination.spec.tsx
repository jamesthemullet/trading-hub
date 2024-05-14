import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';

import { TablePagination } from './table-pagination';

const pageSizes = [10, 20, 50, 100];

describe('TablePagination', () => {
  it('should open and close sizes menu', async () => {
    const mockProps = {
      pagination: {
        totalItems: 0,
      },
      currentPage: 0,
      currentPageSize: pageSizes[0],
      setCurrentPage: jest.fn(),
      setCurrentPageSize: jest.fn(),
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
    const pageSizeSpy = jest.fn();
    const mockProps = {
      pagination: {
        totalItems: 0,
      },
      currentPage: 0,
      currentPageSize: pageSizes[0],
      setCurrentPage: jest.fn(),
      setCurrentPageSize: pageSizeSpy,
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

    expect(pageSizeSpy).toHaveBeenCalledWith(100);
  });

  it('should change current page', () => {
    const pageSpy = jest.fn();

    const mockProps = {
      pagination: {
        totalItems: 97,
      },
      currentPage: 2,
      currentPageSize: pageSizes[0],
      setCurrentPage: pageSpy,
      setCurrentPageSize: jest.fn(),
      pageSizes,
    };

    const { container } = render(<TablePagination {...mockProps} />);
    const text = 'Page 2 of 10';

    expect(screen.getByText(text)).toBeVisible();

    const nextPageButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Next page"]'
    );

    if (!nextPageButton) {
      throw new Error('Next page button not found');
    }

    act(() => {
      nextPageButton.click();
    });
    expect(pageSpy).toHaveBeenCalledWith(3);

    const prevPageButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Previous page"]'
    );

    if (!prevPageButton) {
      throw new Error('Prev page button not found');
    }

    act(() => {
      prevPageButton.click();
    });

    expect(pageSpy).toHaveBeenCalledWith(1);
  });

  it('should change page to 1 when there is no items on current page due to page sizes change', async () => {
    const setPageSpy = jest.fn();
    const setPageSizeSpy = jest.fn();

    const mockProps = {
      pagination: {
        totalItems: 13,
      },
      currentPage: 2,
      currentPageSize: pageSizes[0],
      setCurrentPage: setPageSpy,
      setCurrentPageSize: setPageSizeSpy,
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

    expect(setPageSpy).toHaveBeenCalledWith(1);
    expect(setPageSizeSpy).toHaveBeenCalledWith(100);
  });

  it('should not change page to 1 when there are still items on current page due to page sizes change', async () => {
    const setPageSpy = jest.fn();
    const setPageSizeSpy = jest.fn();

    const mockProps = {
      pagination: {
        totalItems: 80,
      },
      currentPage: 2,
      currentPageSize: pageSizes[0],
      setCurrentPage: setPageSpy,
      setCurrentPageSize: setPageSizeSpy,
      pageSizes,
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
      expect(screen.queryByText('20')).toBeVisible();
    });

    const label = await screen.findByText('20');

    act(() => {
      label.click();
    });

    expect(setPageSpy).not.toHaveBeenCalled();
    expect(setPageSizeSpy).toHaveBeenCalledWith(20);
  });
});

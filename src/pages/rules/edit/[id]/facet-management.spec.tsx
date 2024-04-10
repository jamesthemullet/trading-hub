// import { act } from 'react-dom/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
// import userEvent from '@testing-library/user-event';

import {
  useFacetsListMockData,
  facetsMockData,
} from '@/libs/hooks/data/mock-use-facets-list';
import { useFacetsList } from '@/libs/hooks';

import { default as FacetManagementPage } from './facet-management.page';

jest.mock('../../../../libs/hooks/use-facets-list', () => ({
  useFacetsList: jest.fn(),
}));

process.env.DEBUG_PRINT_LIMIT = '1000000';

describe('Category facet management', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('displays the list of rules', () => {
    jest.mocked(useFacetsList).mockReturnValue(useFacetsListMockData);
    render(<FacetManagementPage />);

    expect(screen.getByText('Category facet management')).toBeVisible();
  });

  it('should sort the rules by lastChange', async () => {
    jest.mocked(useFacetsList).mockReturnValue({
      facets: facetsMockData,
    });
    render(<FacetManagementPage />);

    expect(await screen.findAllByText('Jan 01, 2021')).not.toHaveLength(0);

    const lastChangedLabel = await screen.findByText('Last changed');
    const identifierLabel = await screen.findByText('Identifier');

    jest.mocked(useFacetsList).mockReturnValue({
      facets: facetsMockData
        .sort((a, b) =>
          new Date(a.lastChanged.date).getTime() <
          new Date(b.lastChanged.date).getTime()
            ? 1
            : -1
        )
        .slice(0, 10),
    });

    act(() => {
      lastChangedLabel.click();
      // now it's sorted by asc by last change
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText('column-lastChanged-order-asc')
      ).toBeInTheDocument();
    });
    act(() => {
      lastChangedLabel.click();
      // now it's sorted by desc by last change
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText('column-lastChanged-order-desc')
      ).toBeInTheDocument();
    });
    act(() => {
      lastChangedLabel.click();
      // now it's sorted by asc by last change
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText('column-lastChanged-order-asc')
      ).toBeInTheDocument();
    });
    act(() => {
      identifierLabel.click();
    });
    await waitFor(() => {
      expect(
        screen.getByLabelText('column-lastChanged-order-unsorted')
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText('column-displayValue-order-asc')
      ).toBeInTheDocument();
    });

    jest.mocked(useFacetsList).mockReturnValue({
      facets: facetsMockData
        .sort((a, b) =>
          new Date(a.lastChanged.date).getTime() <
          new Date(b.lastChanged.date).getTime()
            ? -1
            : 1
        )
        .slice(0, 10),
    });

    expect(await screen.findAllByText('Jan 01, 2021')).not.toHaveLength(0);
  });
});

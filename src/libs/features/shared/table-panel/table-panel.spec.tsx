import { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import type { MerchandisingReturnedCategoryRuleSet } from '@/libs/api';
import { track } from '@/libs/hooks/utils/analytics';
import { renderWithProviders } from '@/test/render-with-providers';

import { TablePanel } from './table-panel';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/utils/analytics', () => ({
  ...jest.requireActual('@/libs/hooks/utils/analytics'),
  track: jest.fn(),
}));

const headings = [
  'Identifier',
  'Breadcrumb',
  'Schedule',
  'Enable',
  'Last Changed',
  'User',
  'Actions',
];

const mockId1 = 'ewfw-e3f23-f23f2-3cwef3';
const mockId2 = 'ewfw-e3f23-f23f2-3cwef4';

const mockRules = {
  pinnedProducts: [],
  blockedProducts: [],
  boosts: { numeric: [], alphanumeric: [], product: [] },
  buries: { numeric: [], alphanumeric: [], product: [] },
  includes: {
    alphanumeric: [],
  },
  excludes: {
    alphanumeric: [],
  },
};

const mockRow1: MerchandisingReturnedCategoryRuleSet = {
  id: mockId1,
  isEnabled: true,
  lastChanged: {
    user: 'user',
    date: '2021-01-01',
  },
  countryCode: 'UK',
  rules: mockRules,
  categoriesInfo: [
    {
      id: 'xyz',
      name: 'Jeans',
      plpUrl: '/jeans',
    },
  ],
};

const mockRow2: MerchandisingReturnedCategoryRuleSet = {
  id: mockId2,
  isEnabled: true,
  lastChanged: {
    user: 'user',
    date: '2021-01-01',
  },
  rules: mockRules,
  categoriesInfo: [
    {
      id: 'xyz',
      name: 'Jeans',
      plpUrl: '/jeans',
    },
  ],
};

const mappingMock = {
  getEmptyRuleSet: jest.fn(),
  queryAllRuleSets: jest.fn(),
  deleteRuleSetById: jest.fn(),
  queryRuleSetById: jest.fn(),
  updateRuleSetById: jest.fn(),
  newRuleSet: jest.fn(),
  ruleSetToRow: (ruleSet: any) => ({
    ...ruleSet,
    identifier: 'foo | bar',
    url: `/category/rulesets/edit/${ruleSet.id}`,
  }),
  toggleRuleSet: (ruleSet: any) => ({
    ...ruleSet,
    isEnabled: !ruleSet.isEnabled,
    url: `/category/edit/${ruleSet.id}`,
  }),
  allToTotalItems: (data: any) => data.pagination.totalItems,
  allToArray: (data: any) => data.ruleSets,
  returnedToRuleSet: (data: any) => data,
  readRole: 'Search.R',
  writeRole: 'Search.W',
};

const mockPush = jest.fn();
const mockRouter = {
  pathname: '/search',
  query: {
    currentPage: '1',
    currentPageSize: '10',
    searchQuery: '',
  },
  isReady: true,
  push: mockPush,
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('TablePanel', () => {
  beforeEach(() => {
    jest.mocked(useRouter as jest.Mock).mockReturnValue(mockRouter);

    jest.mocked(mappingMock.queryAllRuleSets).mockResolvedValue({
      data: {
        ruleSets: [mockRow1, mockRow2],
        pagination: {
          totalItems: 2,
        },
      },
      status: 200,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component', async () => {
    renderWithProviders(
      <TablePanel
        writeEnabled
        basePath="/category"
        headings={headings}
        mapping={mappingMock}
        ruleType="global"
      />
    );
    await waitFor(() => {
      expect(screen.getByText('Add ranking rule')).toBeInTheDocument();
    });
  });

  it('should render the component with no access', async () => {
    renderWithProviders(
      <TablePanel
        writeEnabled={false}
        basePath="/category"
        headings={headings}
        mapping={mappingMock}
        ruleType="global"
      />,
      [],
      {
        featureFlags: { hasAuthorization: true },
      }
    );
    await waitFor(() => {
      expect(screen.queryByText('Add ranking rule')).not.toBeInTheDocument();
    });
  });

  it('should show errors', async () => {
    jest.mocked(mappingMock.queryAllRuleSets).mockRejectedValue({
      error: {
        status: 500,
        message: 'Failed to fetch',
      },
    });

    renderWithProviders(
      <TablePanel
        writeEnabled
        basePath="/category"
        headings={headings}
        mapping={mappingMock}
        ruleType="global"
      />
    );
    await waitFor(() => {
      expect(
        screen.queryByText(
          'Error whilst retrieving ruleset: "Error Failed to fetch 500"'
        )
      ).toBeVisible();
    });
  });

  describe('tracking', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should track creating a new category ranking rule', async () => {
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="categoryRanking"
        />
      );

      const createButton = await screen.findByText('Add ranking rule');
      act(() => {
        createButton.click();
      });

      expect(track).toHaveBeenCalledWith({
        event: 'Add categoryRanking ranking rule',
      });
    });

    it('should track creating a new search facet rule', async () => {
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/search"
          headings={headings}
          mapping={mappingMock}
          ruleType="searchRanking"
        />
      );

      const createButton = await screen.findByText('Add facet rule');
      act(() => {
        createButton.click();
      });

      expect(track).toHaveBeenCalledWith({
        event: 'Add searchRanking facet rule',
      });
    });

    it('should track creating a new redirect rule', async () => {
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/search"
          headings={headings}
          mapping={mappingMock}
          ruleType="redirect"
        />
      );

      const createButton = await screen.findByText('Add redirect rule');
      act(() => {
        createButton.click();
      });
      expect(track).toHaveBeenCalledWith({ event: 'Add redirect rule' });
    });
  });

  describe('toggle functionality', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation(jest.fn());
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should enable or disable a row', async () => {
      jest.mocked(mappingMock.queryRuleSetById).mockResolvedValue({
        data: mockRow1,
        status: 200,
      });
      jest.mocked(mappingMock.updateRuleSetById).mockResolvedValue({
        data: {
          ...mockRow1,
          isEnabled: !mockRow1.isEnabled,
        },
        status: 200,
      });

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="categoryRanking"
        />
      );

      const rulesetToggle = await screen.findAllByTitle('Toggle');
      await userEvent.click(rulesetToggle[0]);

      expect(mappingMock.updateRuleSetById).toHaveBeenCalledWith(mockId1, {
        ...mockRow1,
        isEnabled: !mockRow1.isEnabled,
      });
    });

    it('should enable or disable a global rule row', async () => {
      const user = userEvent.setup();
      jest.mocked(mappingMock.queryRuleSetById).mockResolvedValue({
        data: mockRow1,
        status: 200,
      });
      jest.mocked(mappingMock.updateRuleSetById).mockResolvedValue({
        data: {
          ...mockRow1,
          isEnabled: !mockRow1.isEnabled,
        },
        status: 200,
      });

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const rulesetToggle = await screen.findAllByTitle('Toggle');
      await userEvent.click(rulesetToggle[0]);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Apply global changes',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Apply action' }));

      expect(mappingMock.updateRuleSetById).toHaveBeenCalledWith(mockId1, {
        ...mockRow1,
        isEnabled: !mockRow1.isEnabled,
      });
    });

    it('should close the confirmation modal when cancel button on modal clicked', async () => {
      const user = userEvent.setup({ delay: null });

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const rulesetToggle = await screen.findAllByTitle('Toggle');
      await userEvent.click(rulesetToggle[0]);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Apply global changes',
          })
        ).toBeVisible();
      });

      await user.click(
        screen.getByRole('button', { name: 'Close confirmation modal' })
      );

      expect(mappingMock.updateRuleSetById).not.toHaveBeenCalled();
    });

    it('should display an error message when toggling row fails', async () => {
      const user = userEvent.setup();
      jest.mocked(mappingMock.queryRuleSetById).mockRejectedValue({
        error: {
          status: 500,
          message: 'Error toggling row',
        },
      });

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );
      const rulesetToggle = await screen.findAllByTitle('Toggle');
      await userEvent.click(rulesetToggle[0]);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: 'Apply global changes',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: 'Apply action' }));

      expect(
        await screen.findByText(
          'Error whilst getting ruleSet ewfw-e3f23-f23f2-3cwef3 to toggle: "Error Error toggling row 500"'
        )
      ).toBeVisible();
    });
  });

  describe('duplicate functionality', () => {
    it('should duplicate a row', async () => {
      jest.mocked(mappingMock.queryRuleSetById).mockResolvedValue({
        data: mockRow1,
        status: 200,
      });
      jest.mocked(mappingMock.newRuleSet).mockResolvedValue({
        data: { ...mockRow1, id: 'mockId2' },
        status: 200,
      });
      const user = userEvent.setup();

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const rulesetDropdown = await screen.findAllByTitle('More options');

      await user.click(rulesetDropdown[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Create a duplicate rule' })
        ).toBeVisible();
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Confirm',
      });
      await user.click(confirmButton);
      expect(mappingMock.newRuleSet).toHaveBeenCalledWith({
        ...mockRow1,
        isEnabled: false,
      });
      expect(track).toHaveBeenCalledWith({ event: 'Duplicate global ruleset' });
    });

    it('should render error when duplicate row fails', async () => {
      const user = userEvent.setup();

      jest.mocked(mappingMock.queryRuleSetById).mockRejectedValue({
        error: {
          status: 500,
          message: 'Error while duplicating row',
        },
      });

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const rulesetDropdown = await screen.findAllByTitle('More options');

      await user.click(rulesetDropdown[0]);
      await user.click(screen.getByRole('button', { name: 'Duplicate' }));
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: 'Create a duplicate rule' })
        ).toBeVisible();
      });

      const confirmButton = screen.getByRole('button', {
        name: 'Confirm',
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Failed to get ruleSet ewfw-e3f23-f23f2-3cwef3 to duplicate, "Error Error while duplicating row 500"'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('delete functionality', () => {
    it('should open delete modal and close on cancel', async () => {
      jest.mocked(mappingMock.deleteRuleSetById).mockResolvedValue(undefined);

      const user = userEvent.setup();
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      await user.click((await screen.findAllByTitle('More options'))[0]);
      await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Do you want to delete this rule?',
          })
        ).toBeVisible();
      });

      await user.click(screen.getByTestId('Delete rule'));
      expect(mappingMock.deleteRuleSetById).toHaveBeenCalledWith(mockId1);
      expect(track).toHaveBeenCalledWith({ event: 'Delete global ruleset' });
    });

    it('should display an error message when deleting a ruleset fails', async () => {
      jest.mocked(mappingMock.deleteRuleSetById).mockRejectedValue({
        error: {
          status: 500,
          message: 'Error deleting ruleset',
        },
      });

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const user = userEvent.setup();
      await user.click((await screen.findAllByTitle('More options'))[0]);
      await user.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            level: 3,
            name: 'Do you want to delete this rule?',
          })
        ).toBeVisible();
      });
      await user.click(screen.getByTestId('Delete rule'));

      await waitFor(() => {
        expect(
          screen.getByText(
            'Error whilst deleting ruleset: "Error Error deleting ruleset 500"'
          )
        ).toBeVisible();
      });
    });
  });

  describe('country code functionality', () => {
    it('should display country flags and filter', async () => {
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      expect(await screen.findByAltText('UK rule')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Select country' })
      ).toBeVisible();
    });

    it('should refetch the ruleset list when the country is changed', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const dropdown = screen.getByRole('button', {
        name: 'Select country',
      });

      await user.click(dropdown);

      const showUK = screen.getByText('UK only marksandspencer');
      await user.click(showUK);

      expect(mappingMock.queryAllRuleSets).toHaveBeenCalledWith({
        countryCode: 'UK',
        q: '',
        rows: 10,
        start: 0,
      });
      expect(screen.getAllByText('UK only marksandspencer')[0]).toBeVisible();

      const showIE = screen.getByText('IE only marksandspencer');
      await userEvent.click(showIE);

      expect(mappingMock.queryAllRuleSets).toHaveBeenCalledWith({
        countryCode: 'IE',
        q: '',
        rows: 10,
        start: 0,
      });
      expect(screen.getAllByText('IE only marksandspencer')[0]).toBeVisible();
    });
  });

  describe('searching functionality', () => {
    it('should search', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const search = screen.getByPlaceholderText(/Search\.\.\./i);

      await user.type(search, 'search-search');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/search',
          query: {
            currentPage: 1,
            currentPageSize: 10,
            searchQuery: 'search-search',
          },
        });
      });
    });

    it('should go back to the first page after the user has searched', async () => {
      const pushSpy = jest.fn();
      const mockRouter = {
        pathname: '/category',
        query: {
          currentPage: '4',
          currentPageSize: '10',
          searchQuery: '',
        },
        isReady: true,
        push: pushSpy,
      };
      jest.mocked(useRouter as jest.Mock).mockReturnValue(mockRouter);

      jest.mocked(mappingMock.queryAllRuleSets).mockResolvedValue({
        data: {
          ruleSets: [],
          pagination: {
            totalItems: 80,
          },
          status: 200,
        },
      });

      const user = userEvent.setup();
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      expect(await screen.findByText('Page 4 of 8')).toBeVisible();

      const search = screen.getByPlaceholderText(/Search\.\.\./i);

      await user.type(search, 'search-search');

      await waitFor(() => {
        expect(pushSpy).toHaveBeenCalledWith({
          pathname: '/category',
          query: {
            currentPage: 1,
            currentPageSize: 10,
            searchQuery: 'search-search',
          },
        });
      });
    });
  });

  describe('pagination functionality', () => {
    beforeEach(() => {
      const mockRouter = {
        pathname: '/category',
        query: {},
        push: mockPush,
      };
      jest.mocked(useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('should update correctly if the totalItems is undefined', async () => {
      jest.mocked(mappingMock.queryAllRuleSets).mockResolvedValue({
        data: {
          ruleSets: Array.from(
            { length: 80 },
            (_, i) =>
              ({
                id: `${i}`,
                isEnabled: true,
                lastChanged: {
                  user: 'user',
                  date: '2021-01-01',
                },
                rules: mockRules,
                categoriesInfo: [
                  {
                    id: 'xyz',
                    name: 'Jeans',
                    plpUrl: '/jeans',
                  },
                ],
              }) satisfies MerchandisingReturnedCategoryRuleSet
          ),
          pagination: {
            totalItems: undefined,
          },
        },
        status: 200,
      });
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const dropdown = await screen.findByText('Rows per page');

      await userEvent.click(dropdown);

      const valueToClick = await screen.findByText('100');
      await userEvent.click(valueToClick);

      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/category',
        query: {
          currentPage: 1,
          currentPageSize: 100,
        },
      });
    });

    it('should load default page and page size if not in query', async () => {
      jest.mocked(useRouter as jest.Mock).mockReturnValue({
        pathname: '/search',
        query: {},
        isReady: false,
        push: mockPush,
      });

      const { rerender } = renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );
      jest.mocked(useRouter as jest.Mock).mockReturnValue({
        pathname: '/search',
        query: {},
        isReady: true,
        push: mockPush,
      });

      rerender(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Page 1 of 1')).toBeVisible();
      });
    });

    it('should default to 10 rows per page on search, if no existing url query', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      const search = screen.getByPlaceholderText(/Search\.\.\./i);

      await user.type(search, 'search-search');

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({
          pathname: '/category',
          query: {
            currentPage: 1,
            currentPageSize: 10,
            searchQuery: 'search-search',
          },
        });
      });
    });
  });

  describe('schedule functionality', () => {
    it('displays schedule if a ruleset has a start and end date', async () => {
      const mockId = 'ewfw-e3f23-f23f2-3cwef3';
      const mockRuleset: MerchandisingReturnedCategoryRuleSet = {
        id: mockId,
        isEnabled: true,
        lastChanged: {
          user: 'user',
          date: '2021-01-01',
        },
        rules: mockRules,
        categoriesInfo: [
          {
            id: 'xyz',
            name: 'Jeans',
            plpUrl: '/jeans',
          },
        ],
      };
      jest.mocked(mappingMock.queryAllRuleSets).mockResolvedValue({
        data: {
          ruleSets: [
            mockRuleset,
            {
              ...mockRuleset,
              id: 'foo',
              startDate: '2024-10-14T10:02:38.556Z',
              endDate: '2024-10-15T10:02:38.556Z',
            },
          ],
          pagination: {
            totalItems: 2,
          },
        },
        status: 200,
      });
      renderWithProviders(
        <TablePanel
          writeEnabled
          basePath="/category"
          headings={headings}
          mapping={mappingMock}
          ruleType="global"
        />
      );

      await waitFor(() => {
        const timeElement = screen.getByRole('time');
        expect(timeElement).toHaveTextContent('14 Oct 2024 - 15 Oct 2024');
      });
    });
  });
});

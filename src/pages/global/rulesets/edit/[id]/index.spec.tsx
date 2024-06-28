import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { ReturnedGlobalRuleSet } from '@/libs/api';
import { useGlobalRuleSetDetail } from '@/libs/hooks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

const mockUpdateGlobalRuleSet = jest.fn(() => Promise.resolve());
jest.mock('@/libs/hooks/use-global-rule-set-update', () => ({
  useGlobalRuleSetUpdate: () => {
    return { saveGlobalRuleset: mockUpdateGlobalRuleSet, isSaving: true };
  },
}));

const mockRuleData: ReturnedGlobalRuleSet = {
  rules: {
    pinnedProducts: [],
    blockedProducts: [],
    boosts: { numeric: [], alphanumeric: [], product: [] },
    buries: { numeric: [], alphanumeric: [], product: [] },
  },
  isEnabled: false,
  id: 'df70401f-f89d-45ad-92e7-6e152930ff86',
  lastChanged: { date: '2023-12-06T14:24:17Z', user: 'Mark Spencer' },
};

jest.mock('@/libs/hooks/use-global-rule-set-detail', () => ({
  useGlobalRuleSetDetail: jest.fn(),
}));

describe('Index', () => {
  const mockRouter = {
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should show a loader before any data is fetched', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValueOnce({
      globalRuleSet: mockRuleData,
      error: '',
      isLoading: true,
    });

    render(<Page id={ruleSetId} />);

    expect(screen.getByLabelText('loader')).toBeInTheDocument();
  });

  it('should save ruleset', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValueOnce({
      globalRuleSet: mockRuleData,
      isLoading: false,
      error: '',
    });
    const expectedRuleSet = {
      ruleSet: {
        facets: [],
        isEnabled: false,
        rules: {
          blockedProducts: [],
          boosts: { alphanumeric: [], numeric: [], product: [] },
          buries: { alphanumeric: [], numeric: [], product: [] },
          pinnedProducts: [],
        },
      },
      ruleSetId: '090152b8-2517-4e42-a5f3-48fcab8d9942',
    };
    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getByText('Save'));

    expect(mockUpdateGlobalRuleSet).toHaveBeenCalledWith(expectedRuleSet);
    expect(mockRouter.push).toHaveBeenCalledWith('/global/rulesets');
  });

  it('should cancel changes to a ruleset', async () => {
    jest.mocked(useGlobalRuleSetDetail).mockReturnValueOnce({
      globalRuleSet: mockRuleData,
      isLoading: false,
      error: '',
    });
    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getByText('Cancel'));

    expect(mockRouter.push).toHaveBeenCalledWith('/global/rulesets');
  });

  it('loads the mock data', async () => {
    const mockPageId = 'abc123';
    const context = { query: { id: mockPageId } as ParsedUrlQuery };
    const result = await getServerSideProps(
      context as GetServerSidePropsContext
    );

    if (!('props' in result) || !result.props) {
      throw new Error('No props returned');
    }

    expect((await result.props).id).toBe(mockPageId);
  });
});

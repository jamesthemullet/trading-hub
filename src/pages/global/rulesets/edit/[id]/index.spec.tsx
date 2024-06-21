import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

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

  it('should save ruleset', async () => {
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

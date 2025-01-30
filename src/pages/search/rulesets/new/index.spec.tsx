import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useSearchRuleSetCreate } from '@/libs/hooks';
import { renderWithProviders } from '@/test/render-with-providers';

import RuleSetCreate from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/libs/hooks/search/ruleset/use-search-ruleset-create', () => ({
  useSearchRuleSetCreate: jest.fn(),
}));

const NEW_RULE_BUTTON_TEXT = 'Create';
const MOCK_RULESET_ID = '20';

const mockRouter = {
  push: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
  },
};

describe('Index', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    jest.mocked(useSearchRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(),
      error: '',
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders', () => {
    renderWithProviders(<RuleSetCreate />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Product Grid'
    );
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<RuleSetCreate />, [], {
      featureFlags: {
        hasAuthorization: true,
      },
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('creates a new rule set and redirects to the ruleset list page', async () => {
    const user = userEvent.setup();
    jest.mocked(useSearchRuleSetCreate).mockReturnValue({
      createRuleset: jest.fn(() =>
        Promise.resolve({
          id: MOCK_RULESET_ID,
          isEnabled: true,
          searchTerms: ['socks'],
          rules: {
            pinnedProducts: [],
            boosts: { numeric: [], alphanumeric: [], product: [] },
            buries: { numeric: [], alphanumeric: [], product: [] },
            blockedProducts: [],
            includes: {
              alphanumeric: [],
            },
            excludes: {
              alphanumeric: [],
            },
          },
          lastChanged: {
            date: '12/12/12',
            user: 'me',
          },
        })
      ),
      error: '',
    });
    renderWithProviders(<RuleSetCreate />);

    await user.type(screen.getByLabelText('Add keyword'), 'new keyword{enter}');

    const submit = await screen.findByText(NEW_RULE_BUTTON_TEXT);
    act(() => {
      submit.click();
    });

    expect(await screen.findByText(NEW_RULE_BUTTON_TEXT)).toBeInTheDocument();

    expect(mockRouter.push).toHaveBeenCalledWith('/search/rulesets');
  });

  it('cancels new ruleset creation', async () => {
    renderWithProviders(<RuleSetCreate />);

    const cancel = await screen.findByText('Cancel');

    act(() => {
      cancel.click();
    });

    const confirmCancelButton = await screen.findByText('Close without saving');

    act(() => {
      confirmCancelButton.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith(`/search/rulesets`);
  });
});

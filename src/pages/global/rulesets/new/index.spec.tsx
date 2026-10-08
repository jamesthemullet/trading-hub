import { act } from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useGlobalRuleSetCreate } from '@/libs/hooks';

import { renderWithProviders } from '../../../../test/render-with-providers';
import Page from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/libs/hooks', () => ({
  ...jest.requireActual('@/libs/hooks'),
  useGlobalRuleSetCreate: jest.fn(),
}));

describe('Global Rulesets New', () => {
  const mockRouter = {
    push: jest.fn(),
    query: {},
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useGlobalRuleSetCreate).mockReturnValue({
      createGlobalRuleSet: jest.fn(),
      error: '',
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render page', () => {
    renderWithProviders(<Page />);

    expect(
      screen.getByRole('heading', { name: /Product Grid/i })
    ).toBeInTheDocument();
  });

  it('should render the access denied page', async () => {
    renderWithProviders(<Page />, [], {
      featureFlags: {},
    });

    expect(
      screen.getByText('please contact admin on our teams channel', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('cancels new ruleset creation', async () => {
    renderWithProviders(<Page />);

    const cancel = await screen.findByText('Cancel');

    act(() => {
      cancel.click();
    });

    expect(screen.queryByText('Close without saving')).not.toBeInTheDocument();

    expect(mockRouter.push).toHaveBeenCalledWith(
      '/global?catalogue=CLOTHING_AND_HOME'
    );
  });

  it('cancels new ruleset creation and returns to the cfto tab when open', async () => {
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      query: { catalogue: 'CFTO' },
    });
    renderWithProviders(<Page />);

    const cancel = await screen.findByText('Cancel');

    act(() => {
      cancel.click();
    });

    expect(mockRouter.push).toHaveBeenCalledWith('/global?catalogue=CFTO');
  });

  it('should handle save action and create new global ruleset', async () => {
    const user = userEvent.setup();
    const createGlobalRuleSet = jest.fn().mockResolvedValue({});
    jest.mocked(useGlobalRuleSetCreate).mockReturnValue({
      createGlobalRuleSet,
      error: '',
    });
    renderWithProviders(<Page />);

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    expect(createGlobalRuleSet).toHaveBeenCalled();

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        '/global?catalogue=CLOTHING_AND_HOME'
      );
    });
  });

  it('creates the ruleset with the CFTO catalogue when the CFTO tab was open', async () => {
    const user = userEvent.setup();
    const createGlobalRuleSet = jest.fn().mockResolvedValue({});
    jest.mocked(useGlobalRuleSetCreate).mockReturnValue({
      createGlobalRuleSet,
      error: '',
    });
    (useRouter as jest.Mock).mockReturnValue({
      ...mockRouter,
      query: { catalogue: 'CFTO' },
    });
    renderWithProviders(<Page />);

    const createButton = screen.getByRole('button', { name: /create/i });
    await user.click(createButton);

    expect(createGlobalRuleSet).toHaveBeenCalledWith(expect.anything(), 'CFTO');

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/global?catalogue=CFTO');
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useRedirectDetail, useRedirectUpdate } from '@/libs/hooks';
import { returnedRedirectMock } from '@/pages/api/search/mocks';
import { ruleSetId } from '@/test/data/mock-use-rule-set-preview.data';

import type { GetServerSidePropsContext } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import Page, { getServerSideProps } from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
jest.mock(
  '../../../../../libs/hooks/search/redirect/use-redirect-detail',
  () => ({
    useRedirectDetail: jest.fn(),
  })
);
jest.mock(
  '../../../../../libs/hooks/search/redirect/use-redirect-update',
  () => ({
    useRedirectUpdate: jest.fn(),
  })
);

describe('Edit keyword redirect', () => {
  const mockUpdateRedirect = {
    updateRedirect: jest.fn(() => Promise.resolve(returnedRedirectMock)),
    isSaving: true,
    error: '',
  };

  const mockGetRedirect = {
    redirect: returnedRedirectMock,
    isLoading: false,
    error: '',
  };

  const mockRouter = {
    push: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.mocked(useRedirectDetail).mockImplementation(() => mockGetRedirect);
    jest.mocked(useRedirectUpdate).mockImplementation(() => mockUpdateRedirect);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should save the redirect', async () => {
    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getByText('Save'));

    expect(mockUpdateRedirect.updateRedirect).toHaveBeenCalled();
  });

  it('should cancel changes to a redirect', async () => {
    const user = userEvent.setup({ delay: null });

    render(<Page id={ruleSetId} />);

    await user.click(screen.getByText('Cancel'));

    expect(mockRouter.push).toHaveBeenCalledWith('/search/redirects');
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

  it('shows a loader when saving', async () => {
    const mockGetRedirect = {
      redirect: returnedRedirectMock,
      isLoading: true,
      error: '',
    };
    jest.mocked(useRedirectDetail).mockImplementation(() => mockGetRedirect);

    render(<Page id={ruleSetId} />);

    expect(screen.getByLabelText('loader')).toBeInTheDocument();
  });

  it('should show errors', async () => {
    const mockGetRedirect = {
      redirect: returnedRedirectMock,
      isLoading: false,
      error: 'Error: Bad request',
    };
    jest.mocked(useRedirectDetail).mockImplementation(() => mockGetRedirect);

    render(<Page id={ruleSetId} />);

    expect(await screen.findByText('Error: Bad request')).toBeVisible();
  });
});

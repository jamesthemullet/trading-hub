import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';

import { useProfilePageFlag } from '@/libs/components/feature-flag/feature-flag';
import { saveRowsPerPage } from '@/libs/hooks/use-rows-per-page-setting';
import { renderWithProviders } from '@/test/render-with-providers';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('@/libs/components/feature-flag/feature-flag', () => ({
  ...jest.requireActual('@/libs/components/feature-flag/feature-flag'),
  useProfilePageFlag: jest.fn(),
}));
jest.mock('@/libs/hooks/use-rows-per-page-setting', () => ({
  ...jest.requireActual('@/libs/hooks/use-rows-per-page-setting'),
  saveRowsPerPage: jest.fn(),
}));

import Profile, { normalisePageSize } from './index.page';

const mockReplace = jest.fn();

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
  jest.mocked(useProfilePageFlag).mockReturnValue(true);
});

const renderProfile = () => renderWithProviders(<Profile />);

describe('Profile page', () => {
  it('should normalize valid page sizes', () => {
    expect(normalisePageSize(50)).toBe(50);
    expect(normalisePageSize(100)).toBe(100);
  });

  it('should fall back to the default page size for invalid values', () => {
    expect(normalisePageSize(999)).toBe(10);
  });

  it('should redirect to / when the profile page flag is off', async () => {
    jest.mocked(useProfilePageFlag).mockReturnValue(false);
    renderWithProviders(<Profile />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  it('should render static profile page content', () => {
    renderProfile();

    expect(
      screen.getByRole('heading', { name: 'Profile' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Profile', { selector: 'span[aria-current="page"]' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('Your settings are saved on this device only')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/different computer or browser/)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Settings' })
    ).toBeInTheDocument();
  });

  it('should show the rows per page dropdown defaulting to 10', () => {
    renderProfile();

    expect(
      screen.getByRole('button', {
        name: /select rows per page.*currently 10/i,
      })
    ).toBeInTheDocument();
  });

  it('should default to the stored rows per page value', async () => {
    localStorage.setItem('user-rows-per-page', '50');
    renderProfile();

    expect(
      await screen.findByRole('button', {
        name: /select rows per page.*currently 50/i,
      })
    ).toBeInTheDocument();
  });

  it('should call saveRowsPerPage when a size is selected', async () => {
    const user = userEvent.setup();
    renderProfile();

    await user.click(
      screen.getByRole('button', { name: /select rows per page/i })
    );
    await user.click(screen.getByRole('menuitemradio', { name: '20' }));

    expect(saveRowsPerPage).toHaveBeenCalledWith(20);
  });

  it('should render recently viewed section with empty state', () => {
    renderProfile();

    expect(
      screen.getByRole('heading', { name: 'Recently viewed rulesets' })
    ).toBeInTheDocument();

    expect(
      screen.getByText('No recently viewed rulesets yet.')
    ).toBeInTheDocument();
  });

  it('should show recently viewed rulesets from localStorage', async () => {
    localStorage.setItem(
      'recently-viewed-rulesets',
      JSON.stringify([
        {
          id: 'abc',
          label: 'Cat A | Cat B',
          url: '/category/rulesets/edit/abc',
          type: 'category',
          viewedAt: 1000,
        },
        {
          id: 'xyz',
          label: 'shoes',
          url: '/search/rulesets/edit/xyz',
          type: 'search',
          viewedAt: 2000,
        },
      ])
    );
    renderProfile();

    expect(
      await screen.findByRole('link', { name: /Cat A \| Cat B/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shoes/i })).toBeInTheDocument();
  });

  it('should render most viewed section with empty state', () => {
    renderProfile();

    expect(
      screen.getByRole('heading', { name: /most viewed rulesets/i })
    ).toBeInTheDocument();

    expect(
      screen.getByText('No ruleset views recorded yet.')
    ).toBeInTheDocument();
  });

  it('should show most viewed rulesets sorted by count', async () => {
    const now = Date.now();
    localStorage.setItem(
      'ruleset-visit-counts',
      JSON.stringify([
        {
          id: 'abc',
          label: 'Cat A',
          url: '/category/rulesets/edit/abc',
          type: 'category',
          visits: [now, now],
        },
        {
          id: 'xyz',
          label: 'shoes',
          url: '/search/rulesets/edit/xyz',
          type: 'search',
          visits: [now, now, now],
        },
      ])
    );
    renderProfile();

    await waitFor(() => {
      const labelLinks = screen
        .getAllByRole('link')
        .filter((l) => l.textContent === 'shoes' || l.textContent === 'Cat A');
      expect(labelLinks[0]).toHaveTextContent('shoes');
      expect(labelLinks[1]).toHaveTextContent('Cat A');
    });
  });

  it('should render Ruleset and Facets action links for recently viewed items', async () => {
    localStorage.setItem(
      'recently-viewed-rulesets',
      JSON.stringify([
        {
          id: 'abc',
          label: 'Cat A',
          url: '/category/rulesets/edit/abc',
          type: 'category',
          viewedAt: 1000,
        },
      ])
    );
    renderProfile();

    expect(
      await screen.findByRole('link', { name: 'Ruleset' })
    ).toHaveAttribute('href', '/category/rulesets/edit/abc');
    expect(screen.getByRole('link', { name: 'Facets' })).toHaveAttribute(
      'href',
      '/category/facets/edit/abc'
    );
  });

  it('should not render a Facets action link for recently viewed redirects', async () => {
    localStorage.setItem(
      'recently-viewed-rulesets',
      JSON.stringify([
        {
          id: 'abc',
          label: 'shoes redirect',
          url: '/search/redirects/edit/abc',
          type: 'redirect',
          viewedAt: 1000,
        },
      ])
    );
    renderProfile();

    expect(
      await screen.findByRole('link', { name: 'Ruleset' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Facets' })
    ).not.toBeInTheDocument();
  });

  it('should not render a Facets action link for most viewed redirects', async () => {
    const now = Date.now();
    localStorage.setItem(
      'ruleset-visit-counts',
      JSON.stringify([
        {
          id: 'abc',
          label: 'shoes redirect',
          url: '/search/redirects/edit/abc',
          type: 'redirect',
          visits: [now],
        },
      ])
    );
    renderProfile();

    await waitFor(() => {
      expect(screen.getByText('shoes redirect')).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: 'Facets' })
    ).not.toBeInTheDocument();
  });
});

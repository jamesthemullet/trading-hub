import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { renderWithProviders } from '@/test/render-with-providers';

import FacetConfig from './index.page';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    reload: jest.fn(),
    push: jest.fn(),
    query: {},
    events: { on: jest.fn(), off: jest.fn() },
  })),
}));

const baseUrl = '';

const mockFacets = {
  facets: [
    {
      id: 'facet-1',
      indexPropertyName: 'colour',
      displayValue: 'Colour',
      boosted: [],
      excludedValues: [],
      merged: [{ displayValue: 'Blue', mergedValues: ['Navy', 'Royal Blue'] }],
      version: 3,
      lastChanged: { date: '2024-01-01T00:00:00Z', user: 'test' },
    },
    {
      id: 'facet-2',
      indexPropertyName: 'size',
      displayValue: 'Size',
      boosted: [],
      excludedValues: [],
      merged: [],
      version: 3,
      lastChanged: { date: '2024-01-01T00:00:00Z', user: 'test' },
    },
  ],
};

const server = setupServer(
  http.get(`${baseUrl}/api/search/beta/merchandising/facet`, () =>
    HttpResponse.json(mockFacets)
  )
);

beforeAll(() => {
  server.listen();
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe('Global Facet Config', () => {
  it('should render the page title and facet list', async () => {
    renderWithProviders(<FacetConfig />);

    expect(screen.getByText('Global Facet Configuration')).toBeVisible();

    expect(await screen.findByText('Colour')).toBeVisible();

    expect(screen.getByText('colour')).toBeVisible();
    expect(screen.getByText('Size')).toBeVisible();
    expect(screen.getByText('size')).toBeVisible();
    expect(screen.getByText('1 merge group')).toBeVisible();
    expect(screen.getByText('0 merge groups')).toBeVisible();
  });

  it('should handle facets with no merged field', async () => {
    server.use(
      http.get(`${baseUrl}/api/search/beta/merchandising/facet`, () =>
        HttpResponse.json({
          facets: [
            {
              id: 'facet-3',
              indexPropertyName: 'brand',
              displayValue: 'Brand',
              boosted: [],
              excludedValues: [],
              lastChanged: { date: '2024-01-01T00:00:00Z', user: 'test' },
            },
          ],
        })
      )
    );

    renderWithProviders(<FacetConfig />);

    expect(await screen.findByText('0 merge groups')).toBeVisible();
  });

  it('should render the access denied page', () => {
    renderWithProviders(<FacetConfig />, [], {
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

  it('should show error when facets list fails to load', async () => {
    server.use(
      http.get(`${baseUrl}/api/search/beta/merchandising/facet`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    renderWithProviders(<FacetConfig />);

    expect(
      await screen.findByText('Error whilst retrieving facets:', {
        exact: false,
      })
    ).toBeVisible();
  });

  it('should show edit merge groups buttons for each facet', async () => {
    renderWithProviders(<FacetConfig />);

    expect(await screen.findAllByText('Edit values')).toHaveLength(2);
  });

  it('should show a loader while facets are loading', async () => {
    server.use(
      http.get(`${baseUrl}/api/search/beta/merchandising/facet`, async () => {
        await new Promise(() => {});
      })
    );

    renderWithProviders(<FacetConfig />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should show update error when facet update fails', async () => {
    server.use(
      http.put(`${baseUrl}/api/search/beta/merchandising/facet/:facetId`, () =>
        HttpResponse.json({ error: 'Update failed' }, { status: 500 })
      )
    );

    renderWithProviders(<FacetConfig />);

    await userEvent.click(
      await screen.findByRole('button', {
        name: 'Edit display name for Colour',
      })
    );

    const input = screen.getByRole('textbox', {
      name: 'Edit Colour input field',
    });
    await userEvent.clear(input);
    await userEvent.type(input, 'Colour Updated');
    await userEvent.keyboard('{Enter}');

    await userEvent.click(
      await screen.findByRole('button', { name: 'Save changes' })
    );

    expect(
      await screen.findByText('Error whilst updating facet:', { exact: false })
    ).toBeVisible();
  });

  it('should show View values buttons when user has no write access', async () => {
    renderWithProviders(<FacetConfig />, ['Glob.R'], {
      featureFlags: { hasAuthorization: true },
    });

    expect(await screen.findAllByText('View values')).toHaveLength(2);
  });

  describe('searching', () => {
    it('should filter facets by display value', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderWithProviders(<FacetConfig />);

      const searchInput = await screen.findByPlaceholderText('Search facets');
      await user.type(searchInput, 'Colour');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(await screen.findByText('Colour')).toBeVisible();
      expect(screen.queryByText('Size')).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it('should filter facets by index property name', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

      renderWithProviders(<FacetConfig />);

      const searchInput = await screen.findByPlaceholderText('Search facets');
      await user.type(searchInput, 'size');

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(await screen.findByText('Size')).toBeVisible();
      expect(screen.queryByText('Colour')).not.toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('editing display name', () => {
    it('should save a new display name and update the override', async () => {
      server.use(
        http.put(
          `${baseUrl}/api/search/beta/merchandising/facet/:facetId`,
          () =>
            HttpResponse.json({
              ...mockFacets.facets[0],
              displayValue: 'Colour Updated',
            })
        )
      );

      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Colour Updated');
      await userEvent.keyboard('{Enter}');

      expect(
        await screen.findByText('Colour → Colour Updated')
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: 'Save changes' })
      );

      await waitFor(() => {
        expect(
          screen.queryByText('Error whilst updating facet:', { exact: false })
        ).not.toBeInTheDocument();
      });
    });

    it('should cancel the review modal without saving', async () => {
      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Colour Updated');
      await userEvent.keyboard('{Enter}');

      const dialog = await screen.findByRole('dialog');
      await userEvent.click(
        within(dialog).getByRole('button', { name: 'Cancel' })
      );

      await waitFor(() => {
        expect(
          screen.queryByRole('button', { name: 'Save changes' })
        ).not.toBeInTheDocument();
      });

      expect(screen.getByText('Colour')).toBeVisible();
      expect(screen.queryByText('Colour Updated')).not.toBeInTheDocument();
    });

    it('should revert display name override when update fails', async () => {
      server.use(
        http.put(
          `${baseUrl}/api/search/beta/merchandising/facet/:facetId`,
          () => HttpResponse.json({ error: 'Failed' }, { status: 500 })
        )
      );

      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );
      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');
      await userEvent.keyboard('{Enter}');

      await userEvent.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      expect(
        await screen.findByText('Error whilst updating facet:', {
          exact: false,
        })
      ).toBeVisible();
    });

    it('should preserve the merged group config when renaming a facet', async () => {
      let requestBody: unknown;
      server.use(
        http.put(
          `${baseUrl}/api/search/beta/merchandising/facet/:facetId`,
          async ({ request }) => {
            requestBody = await request.json();
            return HttpResponse.json({
              ...mockFacets.facets[0],
              displayValue: 'Colour Updated',
            });
          }
        )
      );

      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Colour Updated');
      await userEvent.keyboard('{Enter}');

      await userEvent.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      await waitFor(() => {
        expect(requestBody).toMatchObject({
          displayValue: 'Colour Updated',
          merged: mockFacets.facets[0].merged,
        });
      });
    });

    it('should send merged as undefined when the facet has no merged property', async () => {
      server.use(
        http.get(`${baseUrl}/api/search/beta/merchandising/facet`, () =>
          HttpResponse.json({
            facets: [
              {
                id: 'facet-3',
                indexPropertyName: 'brand',
                displayValue: 'Brand',
                boosted: [],
                excludedValues: [],
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'test' },
              },
            ],
          })
        )
      );

      let requestBody: unknown;
      server.use(
        http.put(
          `${baseUrl}/api/search/beta/merchandising/facet/:facetId`,
          async ({ request }) => {
            requestBody = await request.json();
            return HttpResponse.json({
              id: 'facet-3',
              indexPropertyName: 'brand',
              displayValue: 'Brand New',
              boosted: [],
              excludedValues: [],
              lastChanged: { date: '2024-01-01T00:00:00Z', user: 'test' },
            });
          }
        )
      );

      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Brand',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Brand input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Brand New');
      await userEvent.keyboard('{Enter}');

      await userEvent.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      await waitFor(() => {
        expect(requestBody).toMatchObject({ displayValue: 'Brand New' });
      });
      expect(requestBody).not.toHaveProperty('merged');
    });

    it('should show error when display name is set to empty', async () => {
      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);

      expect(await screen.findByText('You must supply a value')).toBeVisible();
    });

    it('should show error when display name is a duplicate', async () => {
      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Size');

      expect(
        await screen.findByText('Size is not a unique value')
      ).toBeVisible();
    });

    it('should clear error when display name is set to a valid value', async () => {
      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Brand New Name');

      await waitFor(() => {
        expect(
          screen.queryByText('You must supply a value')
        ).not.toBeInTheDocument();
      });
    });

    it('should cancel editing and clear errors', async () => {
      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Cancel Colour change' })
      );

      expect(
        screen.queryByRole('textbox', { name: 'Edit Colour input field' })
      ).not.toBeInTheDocument();
    });

    it('should not open the review modal when the display name is unchanged', async () => {
      renderWithProviders(<FacetConfig />);

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );
      await userEvent.keyboard('{Enter}');

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Save changes' })
      ).not.toBeInTheDocument();
    });
  });

  describe('optimistic locking (save conflict)', () => {
    const v1FacetUrl = `${baseUrl}/api/search/merchandising/v1/CLOTHING_AND_HOME/facet/:facetId`;

    const editColourTo = async (newValue: string) => {
      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Colour',
        })
      );
      const input = screen.getByRole('textbox', {
        name: 'Edit Colour input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, newValue);
      await userEvent.keyboard('{Enter}');
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );
    };

    it('saves via the v1 endpoint with the loaded version when the flag is on', async () => {
      let requestBody: unknown;
      server.use(
        http.put(v1FacetUrl, async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json({
            ...mockFacets.facets[0],
            displayValue: 'Colour Updated',
            version: 4,
          });
        })
      );

      renderWithProviders(<FacetConfig />, undefined, {
        featureFlags: { hasOptimisticLocking: true },
      });

      await editColourTo('Colour Updated');

      await waitFor(() =>
        expect(requestBody).toMatchObject({
          displayValue: 'Colour Updated',
          version: 3,
        })
      );
    });

    it('shows the conflict modal when the facet was changed by someone else', async () => {
      server.use(
        http.put(v1FacetUrl, () =>
          HttpResponse.json(
            {
              message: 'Conflict',
              currentEntity: {
                ...mockFacets.facets[0],
                displayValue: 'Colour From Someone Else',
                version: 9,
                lastChanged: {
                  date: '2024-02-02T00:00:00Z',
                  user: 'Other User',
                },
              },
            },
            { status: 409 }
          )
        )
      );

      renderWithProviders(<FacetConfig />, undefined, {
        featureFlags: { hasOptimisticLocking: true },
      });

      await editColourTo('Colour Updated');

      const dialog = await screen.findByRole('dialog', {
        name: 'This facet was changed by someone else',
      });
      const matched = within(dialog).getByText(
        'Colour → Colour From Someone Else'
      );

      expect(matched).toBeInTheDocument();
    });

    it('shows a merge groups diff item when the merge groups changed', async () => {
      server.use(
        http.put(v1FacetUrl, () =>
          HttpResponse.json(
            {
              message: 'Conflict',
              currentEntity: {
                ...mockFacets.facets[0],
                merged: [],
                version: 9,
                lastChanged: {
                  date: '2024-02-02T00:00:00Z',
                  user: 'Other User',
                },
              },
            },
            { status: 409 }
          )
        )
      );

      renderWithProviders(<FacetConfig />, undefined, {
        featureFlags: { hasOptimisticLocking: true },
      });

      await editColourTo('Colour Updated');

      const dialog = await screen.findByRole('dialog', {
        name: 'This facet was changed by someone else',
      });

      expect(within(dialog).getByText('1 → 0')).toBeInTheDocument();
    });

    it('shows a merge groups diff item when the original facet has no merged property', async () => {
      server.use(
        http.get(`${baseUrl}/api/search/beta/merchandising/facet`, () =>
          HttpResponse.json({
            facets: [
              {
                id: 'facet-3',
                indexPropertyName: 'brand',
                displayValue: 'Brand',
                boosted: [],
                excludedValues: [],
                version: 3,
                lastChanged: { date: '2024-01-01T00:00:00Z', user: 'test' },
              },
            ],
          })
        ),
        http.put(v1FacetUrl, () =>
          HttpResponse.json(
            {
              message: 'Conflict',
              currentEntity: {
                id: 'facet-3',
                indexPropertyName: 'brand',
                displayValue: 'Brand',
                boosted: [],
                excludedValues: [],
                merged: [{ displayValue: 'x', mergedValues: ['y'] }],
                version: 9,
                lastChanged: {
                  date: '2024-02-02T00:00:00Z',
                  user: 'Other User',
                },
              },
            },
            { status: 409 }
          )
        )
      );

      renderWithProviders(<FacetConfig />, undefined, {
        featureFlags: { hasOptimisticLocking: true },
      });

      await userEvent.click(
        await screen.findByRole('button', {
          name: 'Edit display name for Brand',
        })
      );
      const input = screen.getByRole('textbox', {
        name: 'Edit Brand input field',
      });
      await userEvent.clear(input);
      await userEvent.type(input, 'Brand Updated');
      await userEvent.keyboard('{Enter}');
      await userEvent.click(
        await screen.findByRole('button', { name: 'Save changes' })
      );

      const dialog = await screen.findByRole('dialog', {
        name: 'This facet was changed by someone else',
      });

      expect(within(dialog).getByText('0 → 1')).toBeInTheDocument();
    });

    it('overwrites with the server version when the user chooses overwrite', async () => {
      let overwriteBody: unknown;
      let callCount = 0;
      server.use(
        http.put(v1FacetUrl, async ({ request }) => {
          callCount += 1;
          if (callCount === 1) {
            return HttpResponse.json(
              {
                message: 'Conflict',
                currentEntity: {
                  ...mockFacets.facets[0],
                  version: 9,
                  lastChanged: {
                    date: '2024-02-02T00:00:00Z',
                    user: 'Other User',
                  },
                },
              },
              { status: 409 }
            );
          }
          overwriteBody = await request.json();
          return HttpResponse.json({
            ...mockFacets.facets[0],
            displayValue: 'Colour Updated',
            version: 10,
          });
        })
      );

      renderWithProviders(<FacetConfig />, undefined, {
        featureFlags: { hasOptimisticLocking: true },
      });

      await editColourTo('Colour Updated');

      const dialog = await screen.findByRole('dialog', {
        name: 'This facet was changed by someone else',
      });
      await userEvent.click(
        within(dialog).getByRole('button', {
          name: 'Overwrite with my changes',
        })
      );

      await waitFor(() => expect(overwriteBody).toMatchObject({ version: 9 }));
    });
  });
});

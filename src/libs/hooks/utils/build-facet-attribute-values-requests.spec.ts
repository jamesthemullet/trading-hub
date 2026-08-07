import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { buildFacetAttributeValuesRequests } from './build-facet-attribute-values-requests';

const baseUrl = 'http://localhost';

const server = setupServer(
  http.get(
    `${baseUrl}/search/beta/merchandising/facet/color-id/attributeValues`,
    ({ request }) => {
      const url = new URL(request.url);
      const catalogue = url.searchParams.get('catalogue');
      const categoryId = url.searchParams.get('categoryId');
      const searchTerm = url.searchParams.getAll('searchTerm');

      return HttpResponse.json(
        {
          values: [
            {
              displayValue: `${catalogue ?? ''}-${categoryId ?? ''}-${searchTerm.join('|')}`,
            },
          ],
          pagination: { totalItems: 1 },
        },
        { status: 200 }
      );
    }
  )
);

describe('buildFacetAttributeValuesRequests', () => {
  beforeAll(() => {
    process.env.MERCHANDISING_PROXY_BASE_URL = baseUrl;
    server.listen();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    delete process.env.MERCHANDISING_PROXY_BASE_URL;
  });

  it('builds one request per category when categories are supplied', async () => {
    const promises = buildFacetAttributeValuesRequests({
      facetId: 'color-id',
      countryCode: 'UK_IE',
      query: '',
      rows: 500,
      categories: ['Cat1', 'IE_Cat2'],
    });

    const results = await Promise.all(promises);

    expect(results).toEqual([
      [{ displayValue: 'MANDSUK-Cat1-' }],
      [{ displayValue: 'MANDSIE-IE_Cat2-' }],
    ]);
  });

  it('builds one request per catalogue and includes searchTerm when categories are not supplied', async () => {
    const promises = buildFacetAttributeValuesRequests({
      facetId: 'color-id',
      countryCode: 'UK_IE',
      query: 'red',
      rows: 500,
      searchTerms: ['term1'],
    });

    const results = await Promise.all(promises);

    expect(results).toEqual([
      [{ displayValue: 'MANDSUK--term1' }],
      [{ displayValue: 'MANDSIE--term1' }],
    ]);
  });

  it('omits searchTerm when not supplied', async () => {
    const promises = buildFacetAttributeValuesRequests({
      facetId: 'color-id',
      countryCode: 'UK',
      query: '',
      rows: 500,
    });

    const results = await Promise.all(promises);

    expect(results).toEqual([[{ displayValue: 'MANDSUK--' }]]);
  });
});

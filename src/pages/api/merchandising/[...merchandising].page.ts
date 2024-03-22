import { AttributesResponse, ProductSearchResponse } from '@/libs/api';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
  /* Mocked response for attributes */

  const match = req.url?.match(/\/merchandising\/category\/(\w+)\/attributes/);
  /* istanbul ignore next */
  if (match) {
    const categoryId = match[1];
    console.warn(
      'WARNING: Replying with mocked attributes for category',
      categoryId
    );
    const mockedResponse: AttributesResponse = {
      attributes: [
        {
          type: 'alphanumeric',
          name: 'Color',
          values: [{ value: 'Red' }, { value: 'Blue' }, { value: 'Green' }],
        },
        {
          type: 'numeric',
          name: 'Size',
          values: [{ value: 'S' }, { value: 'M' }, { value: 'L' }],
        },
        {
          type: 'alphanumeric',
          name: 'Brand',
          values: [{ value: 'Nike' }, { value: 'Adidas' }, { value: 'Puma' }],
        },
        {
          type: 'alphanumeric',
          name: 'Category',
          values: [
            { value: 'Shoes' },
            { value: 'Clothing' },
            { value: 'Accessories' },
          ],
        },
        {
          type: 'numeric',
          name: 'Price',
          values: [
            { value: '0-50' },
            { value: '50-100' },
            { value: '100-200' },
            { value: '200+' },
          ],
        },
      ],
    };
    return res.status(200).json(mockedResponse);
  }

  const token = await getToken({ req });

  const headers = new Headers();

  if (token && typeof token.accessToken === 'string') {
    headers.set('Authorization', `Bearer ${token.accessToken}`);
  }

  if (req.body) {
    headers.set('Content-Type', 'application/json');
  }

  const url = new URL(
    req.url?.replace('/api', '') ?? '',
    process.env.MERCHANDISING_API_BASEURL
  );

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.body ? JSON.stringify(req.body) : undefined,
  });

  let jsonBody = {};
  let jsonText = '';
  try {
    const jsonText = await response.text();
    jsonBody = JSON.parse(jsonText);
  } catch (e) /* istanbul ignore next */ {
    console.error('Error parsing JSON', e);
    console.error('Response text:', jsonText);
  }

  /* workaround for backend not returning metadata for pinned products */
  /* istanbul ignore next */
  if (req.url && req.url.startsWith('/api/merchandising/product')) {
    const { products } = jsonBody as ProductSearchResponse;
    products.forEach((product) => {
      product.metadata = {
        isPinned: product?.metadata?.isPinned ?? false,
      };
    });
  }

  if (!response.ok) {
    console.error(
      'Error fetching from merchandising',
      response.status,
      response.statusText
    );
  }

  return res
    .status(response.status)
    .json(req.method === 'DELETE' ? {} : jsonBody);
};

export default proxy;

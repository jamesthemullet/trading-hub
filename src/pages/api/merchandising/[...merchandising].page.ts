/* istanbul ignore file */
import type { ProductSearchResponse } from '@/libs/api';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.url && req.url.startsWith('/api/merchandising/product')) {
    const mockResponse: ProductSearchResponse = {
      products: [
        {
          id: '123',
          brand: 'brand1',
          imageUrl: ['SD_02_T60_7118B_Y0_X_EC_0'],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '10.00',
          rating: 1,
          title: 'Product 1',
          url: '/product/1',
        },
        {
          id: '456',
          brand: 'brand2',
          imageUrl: ['SD_02_T32_9100S_TM_X_EC_0'],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '20.00',
          rating: 2,
          title: 'Product 2',
          url: '/product/2',
        },
        {
          id: '789',
          brand: 'brand3',
          imageUrl: ['SD_02_T32_9100_QJ_X_EC_0'],
          isInStock: true,
          metadata: {
            isPinned: false,
          },
          price: '30.00',
          rating: 3,
          title: 'Product 3',
          url: '/product/3',
        },
      ],
      pagination: {
        totalItems: 3,
      },
    };

    const responseProducts = mockResponse.products.filter(
      (product) =>
        product.title.includes(req.query.query as string) ||
        product.id.includes(req.query.query as string)
    );

    return res.status(200).json({
      products: responseProducts,
      pagination: {
        totalItems: responseProducts.length,
      },
    });
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

  return res
    .status(response.status)
    .json(req.method === 'DELETE' ? {} : await response.json());
};

export default proxy;

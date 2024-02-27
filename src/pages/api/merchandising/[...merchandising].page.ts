import { ProductSearchResponse } from '@/libs/api';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

export type MerchandisingEnvironment = {
  merchandisingApiBaseUrl: string;
};

const proxy = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const jsonBody = await response.json();

  // test change 1

  if (req.url && req.url.startsWith('/api/merchandising/product')) {
    const { products } = jsonBody as ProductSearchResponse;
    products.forEach((product) => {
      product.metadata = {
        isPinned: product?.metadata?.isPinned ?? false,
      };
    });
  }

  return res
    .status(response.status)
    .json(req.method === 'DELETE' ? {} : jsonBody);
};

export default proxy;

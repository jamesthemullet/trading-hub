/* istanbul ignore file */

export * from './generated/open-api';
import { Api } from './generated/open-api';

export const api = () => {
  return new Api({
    baseUrl: process.env.MERCHANDISING_PROXY_BASE_URL || '/api',
    securityWorker: () => ({ format: 'json' }),
  });
};

export const search = () => api().search;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line functional/immutable-data
  (window as typeof window & { api: unknown }).api = api;
}

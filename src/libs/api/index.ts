export * from './generated/open-api';
import { Api } from './generated/open-api';

export const api = () => {
  return new Api({
    baseUrl: process.env['MERCHANDISING_PROXY_BASE_URL'] || '/api',
    securityWorker: () => ({ format: 'json' }),
  });
};

export const merchandising = () => api().merchandising;

/* istanbul ignore file */

export * from './generated/open-api';
import { reportApiLatency } from '@/libs/utils/dynatrace';

import { Api } from './generated/open-api';

const createTimingFetch = (): typeof fetch => async (input, init) => {
  const start = performance.now();
  const rawUrl = input instanceof Request ? input.url : String(input);
  const method = (init?.method ?? 'GET').toUpperCase();

  const response = await fetch(input, init);

  const durationMs = Math.round(performance.now() - start);
  const { pathname } = new URL(rawUrl, window.location.origin);
  reportApiLatency(pathname, method, response.status, durationMs);

  return response;
};

export const api = () => {
  return new Api({
    baseUrl: process.env.MERCHANDISING_PROXY_BASE_URL ?? '/api',
    securityWorker: () => ({ format: 'json' }),
    ...(typeof window !== 'undefined'
      ? { customFetch: createTimingFetch() }
      : {}),
  });
};

export const search = () => api().search;

if (typeof window !== 'undefined') {
  // eslint-disable-next-line functional/immutable-data
  (window as typeof window & { api: unknown }).api = api;
}

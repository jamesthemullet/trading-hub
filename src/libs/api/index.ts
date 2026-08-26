/* istanbul ignore file */

export * from './generated/open-api';
import { reportApiLatency } from '@/libs/utils/dynatrace';
import { emitSaveSuccess } from '@/libs/utils/toast-events';

import { Api } from './generated/open-api';

// Endpoints known to represent a user-initiated save (create/update) or
// delete — rather than a read-style POST/PUT (e.g. preview, product search).
// Extend these lists as more save/delete flows are wired up to the toast.
const DELETE_ENABLED_ENDPOINT_PATTERNS = [
  /^\/api\/search\/beta\/merchandising\/category\/ruleset(\/|$)/,
  /^\/api\/search\/beta\/merchandising\/keyword\/ruleset(\/|$)/,
  /^\/api\/search\/beta\/merchandising\/global\/ruleset(\/|$)/,
  /^\/api\/search\/merchandising\/v1\/[^/]+\/global\/ruleset(\/|$)/,
  /^\/api\/search\/beta\/merchandising\/keyword\/redirect(\/|$)/,
];

// Non-delete-enabled endpoints that only ever create/update (no delete flow
// wired up to the toast yet).
const SAVE_ONLY_ENDPOINT_PATTERNS = [
  /^\/api\/search\/beta\/merchandising\/facet(\/|$)/,
];

const isSaveOrDeleteRequest = (method: string, pathname: string): boolean => {
  const isDeleteEnabledEndpoint = DELETE_ENABLED_ENDPOINT_PATTERNS.some(
    (pattern) => pattern.test(pathname)
  );

  if (isDeleteEnabledEndpoint) {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  return (
    ['POST', 'PUT', 'PATCH'].includes(method) &&
    SAVE_ONLY_ENDPOINT_PATTERNS.some((pattern) => pattern.test(pathname))
  );
};

const getDeleteSuccessMessage = (pathname: string): string =>
  pathname.includes('/redirect')
    ? 'Redirect deleted successfully'
    : 'Ruleset deleted successfully';

const createTimingFetch = (): typeof fetch => async (input, init) => {
  const start = performance.now();
  const rawUrl = input instanceof Request ? input.url : String(input);
  const method = (init?.method ?? 'GET').toUpperCase();

  const response = await fetch(input, init);

  const durationMs = Math.round(performance.now() - start);
  const { pathname } = new URL(rawUrl, window.location.origin);
  reportApiLatency(pathname, method, response.status, durationMs);

  if (response.ok && isSaveOrDeleteRequest(method, pathname)) {
    if (method === 'DELETE') {
      emitSaveSuccess(getDeleteSuccessMessage(pathname));
    } else {
      emitSaveSuccess();
    }
  }

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

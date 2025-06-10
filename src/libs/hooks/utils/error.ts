import type { MerchandisingErrorResponse } from '@/libs/api';

import { track } from './analytics';

const sendErrorToNewRelic = (err: unknown) => {
  if (window && window.newrelic) {
    if (err instanceof Error || typeof err === 'string') {
      window.newrelic.noticeError(err, {
        application: 'Trading Hub',
        pathname: window.location.pathname,
      });
    } else {
      const errorString = JSON.stringify(err);
      window.newrelic.noticeError(errorString, {
        application: 'Trading Hub',
        pathname: window.location.pathname,
      });
    }
  }
};

const validateErrorResponse = (err: unknown) => {
  if (err && typeof err === 'object' && 'error' in err) {
    return `Error ${(err.error as MerchandisingErrorResponse)?.message} ${(err.error as MerchandisingErrorResponse)?.status}`;
  }
  return 'Unknown error';
};

export const handleError = (err: unknown) => {
  if (window) {
    track({ event: `error: ${err}` });
    sendErrorToNewRelic(err);
  }
  return validateErrorResponse(err);
};

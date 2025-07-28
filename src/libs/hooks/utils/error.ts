import type { MerchandisingErrorResponse } from '@/libs/api';

import { track } from './analytics';

const validateErrorResponse = (err: unknown) => {
  if (err && typeof err === 'object' && 'error' in err) {
    return `Error ${(err.error as MerchandisingErrorResponse)?.message} ${(err.error as MerchandisingErrorResponse)?.status}`;
  }
  return 'Unknown error';
};

export const handleError = (err: unknown) => {
  // istanbul ignore else
  if (window) {
    track({ event: `error: ${err}` });
  }
  return validateErrorResponse(err);
};

import type { MerchandisingErrorResponse } from '@/libs/api';
import { reportErrorToDynatrace } from '@/libs/utils/dynatrace';

import { track } from './analytics';

const validateErrorResponse = (err: unknown) => {
  if (err && typeof err === 'object' && 'error' in err) {
    return `Error ${(err.error as MerchandisingErrorResponse)?.message} ${(err.error as MerchandisingErrorResponse)?.status}`;
  }
  return 'Unknown error';
};

export const handleError = (err: unknown) => {
  const errorMessage = validateErrorResponse(err);

  // istanbul ignore else
  if (window) {
    track({ event: `error: ${err}` });

    // Report to Dynatrace
    const error = err instanceof Error ? err : new Error(errorMessage);
    reportErrorToDynatrace(error);
  }

  return errorMessage;
};

import { ErrorResponse } from '@/libs/api';

export const validateErrorResponse = (err: unknown) => {
  if (err && typeof err === 'object' && 'error' in err) {
    return `Error ${(err.error as ErrorResponse)?.message} ${(err.error as ErrorResponse)?.status}`;
  }
  return 'Unknown error';
};

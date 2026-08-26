import type {
  HttpResponse,
  MerchandisingErrorResponse,
  MerchandisingReturnedGlobalRuleSet,
} from '@/libs/api';

const HTTP_CONFLICT = 409;

type ConflictErrorResponse<T = MerchandisingReturnedGlobalRuleSet> =
  MerchandisingErrorResponse & {
    currentEntity: T;
  };

export type ConflictError<T = MerchandisingReturnedGlobalRuleSet> =
  HttpResponse<unknown, ConflictErrorResponse<T>>;

export const isConflictError = <T = MerchandisingReturnedGlobalRuleSet>(
  error: unknown
): error is ConflictError<T> => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const { status, error: body } = error as {
    status?: unknown;
    error?: unknown;
  };

  return (
    status === HTTP_CONFLICT &&
    typeof body === 'object' &&
    body !== null &&
    'currentEntity' in body &&
    (body as { currentEntity?: unknown }).currentEntity != null
  );
};

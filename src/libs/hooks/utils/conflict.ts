import type {
  HttpResponse,
  MerchandisingErrorResponse,
  MerchandisingReturnedGlobalRuleSet,
} from '@/libs/api';

const HTTP_CONFLICT = 409;

/**
 * The 409 error body returned by the v1 optimistic-locking endpoints. It is the
 * standard error response plus the current server-side state of the entity, so
 * the caller can show the user what changed and retry with the up-to-date
 * version.
 */
type ConflictErrorResponse<T = MerchandisingReturnedGlobalRuleSet> =
  MerchandisingErrorResponse & {
    currentEntity: T;
  };

/**
 * The generated client throws the whole `HttpResponse` (which extends
 * `Response`) on a non-2xx status, carrying `.status` and the parsed body in
 * `.error`. On a version conflict that body is a {@link ConflictErrorResponse}.
 */
export type ConflictError<T = MerchandisingReturnedGlobalRuleSet> =
  HttpResponse<unknown, ConflictErrorResponse<T>>;

/**
 * Type guard for the 409 version-conflict error thrown by the v1 update
 * endpoints. Narrows an unknown caught value so `error.error.currentEntity` is
 * available and typed.
 */
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

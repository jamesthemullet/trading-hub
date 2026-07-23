import { isConflictError } from './conflict';

const currentEntity = { id: 'abc-123', version: 4 };

describe('isConflictError', () => {
  it('returns true for a 409 response carrying a currentEntity', () => {
    expect(
      isConflictError({
        status: 409,
        error: {
          status: 'Conflict',
          message: 'Version conflict',
          currentEntity,
        },
      })
    ).toBe(true);
  });

  it('returns false for a non-409 status', () => {
    expect(
      isConflictError({
        status: 500,
        error: { status: 'Error', message: 'boom', currentEntity },
      })
    ).toBe(false);
  });

  it('returns false when the error body has no currentEntity', () => {
    expect(
      isConflictError({
        status: 409,
        error: { status: 'Conflict', message: 'missing entity' },
      })
    ).toBe(false);
  });

  it('returns false when currentEntity is null', () => {
    expect(
      isConflictError({
        status: 409,
        error: {
          status: 'Conflict',
          message: 'null entity',
          currentEntity: null,
        },
      })
    ).toBe(false);
  });

  it('returns false when the error body is missing', () => {
    expect(isConflictError({ status: 409 })).toBe(false);
  });

  it('returns false when the error body is null', () => {
    expect(isConflictError({ status: 409, error: null })).toBe(false);
  });

  it('returns false for non-object values', () => {
    expect(isConflictError(null)).toBe(false);
    expect(isConflictError(undefined)).toBe(false);
    expect(isConflictError('conflict')).toBe(false);
  });
});

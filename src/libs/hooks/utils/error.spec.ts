import { handleError } from './error';

describe('validateErrorResponse', () => {
  it('should return a formatted error', () => {
    const error = handleError({
      error: { status: 'status', message: 'message' },
    });

    expect(error).toBe('Error message status');
  });

  it('should return a generic error when format incorrect', () => {
    const error = handleError('');

    expect(error).toBe('Unknown error');
  });
});

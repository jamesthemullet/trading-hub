import { reportErrorToDynatrace } from '@/libs/utils/dynatrace';

import { handleError } from './error';

jest.mock('@/libs/utils/dynatrace');

describe('validateErrorResponse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('should call reportErrorToDynatrace with Error object', () => {
    const errorObj = new Error('test error');
    handleError(errorObj);

    expect(reportErrorToDynatrace).toHaveBeenCalledWith(errorObj);
  });

  it('should call reportErrorToDynatrace with formatted error message for non-Error', () => {
    handleError({
      error: { status: 'status', message: 'message' },
    });

    expect(reportErrorToDynatrace).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Error message status',
      })
    );
  });
});

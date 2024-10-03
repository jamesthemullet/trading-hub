import { handleError } from './error';

const noticeErrorMock = jest.fn();

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

  describe('sendErrorToNewRelic', () => {
    beforeAll(() => {
      Object.defineProperty(window, 'newrelic', {
        value: { noticeError: noticeErrorMock },
      });
    });

    beforeEach(() => {
      global.window = Object.create(window);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should send error to new relic if error is a string', () => {
      const error = 'Test error';
      handleError(error);

      expect(noticeErrorMock).toHaveBeenCalledWith(error, {
        application: 'Trading Hub',
        pathname: window.location.pathname,
      });
    });

    it('should send error to new relic if error is an Error object', () => {
      const error = new Error('Test error');
      handleError(error);

      expect(noticeErrorMock).toHaveBeenCalledWith(error, {
        application: 'Trading Hub',
        pathname: window.location.pathname,
      });
    });

    it('should send stringified error to new relic if error is not a string or an Error object', () => {
      const error = { message: 'Test error' };
      handleError(error);

      expect(noticeErrorMock).toHaveBeenCalledWith(JSON.stringify(error), {
        application: 'Trading Hub',
        pathname: window.location.pathname,
      });
    });
  });
});

import { reportErrorToDynatrace, setupGlobalErrorHandlers } from './dynatrace';

describe('dynatrace', () => {
  const mockReportError = jest.fn();
  const mockSendBizEvent = jest.fn();
  const mockEnterAction = jest.fn();
  const mockLeaveAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, 'dtrum', {
      writable: true,
      configurable: true,
      value: {
        reportError: mockReportError,
        enterAction: mockEnterAction,
        leaveAction: mockLeaveAction,
      },
    });

    Object.defineProperty(window, 'dynatrace', {
      writable: true,
      configurable: true,
      value: {
        sendBizEvent: mockSendBizEvent,
      },
    });
  });

  afterEach(() => {
    delete window.dtrum;
    delete window.dynatrace;
    jest.restoreAllMocks();
  });

  describe('reportErrorToDynatrace', () => {
    it('should report an Error to Dynatrace', () => {
      const error = new Error('Test error');
      reportErrorToDynatrace(error);

      expect(mockReportError).toHaveBeenCalledWith(error);
      expect(mockSendBizEvent).toHaveBeenCalledWith(
        'Merchandising Hub JavaScript Error',
        expect.objectContaining({
          'error.message': 'Test error',
          'error.name': 'Error',
        })
      );
    });

    it('should report a string error to Dynatrace', () => {
      reportErrorToDynatrace('String error message');

      expect(mockReportError).toHaveBeenCalledWith('String error message');
      expect(mockSendBizEvent).toHaveBeenCalledWith(
        'Merchandising Hub JavaScript Error',
        expect.objectContaining({
          'error.message': 'String error message',
        })
      );
    });

    it('should not throw if dtrum is not available', () => {
      delete window.dtrum;

      expect(() => reportErrorToDynatrace(new Error('Test'))).not.toThrow();
    });

    it('should sanitize URLs in error messages', () => {
      const error = new Error(
        'Failed to fetch https://example.com/api/user/123'
      );
      reportErrorToDynatrace(error);

      expect(mockSendBizEvent).toHaveBeenCalledWith(
        'Merchandising Hub JavaScript Error',
        expect.objectContaining({
          'error.message': 'Failed to fetch [redacted]',
        })
      );
    });

    it('should sanitize URLs in stack traces', () => {
      const error = new Error('Test');
      error.stack = `Error: Test
    at Object.<anonymous> (https://example.com/app.js:10:15)
    at Module._compile (node:internal/modules/cjs/loader:1159:14)`;

      reportErrorToDynatrace(error);

      const call = mockSendBizEvent.mock.calls[0][1];
      expect(call['error.stack']).toContain('[redacted]:10:15');
      expect(call['error.stack']).not.toContain('https://example.com');
    });

    it('should sanitize file paths in error messages', () => {
      const error = new Error('Error in /usr/local/app/file.js');
      reportErrorToDynatrace(error);

      expect(mockSendBizEvent).toHaveBeenCalledWith(
        'Merchandising Hub JavaScript Error',
        expect.objectContaining({
          'error.message': 'Error in [redacted]',
        })
      );
    });

    it('should truncate very long error messages', () => {
      const longMessage = 'x'.repeat(600);
      const error = new Error(longMessage);
      reportErrorToDynatrace(error);

      const call = mockSendBizEvent.mock.calls[0][1];
      expect(call['error.message']).toHaveLength(501);
      expect(call['error.message']?.endsWith('…')).toBe(true);
    });

    it('should sanitize page URL', () => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: {
          href: 'https://example.com/page?token=secret123',
          pathname: '/page',
        },
      });

      reportErrorToDynatrace(new Error('Test'));

      expect(mockSendBizEvent).toHaveBeenCalledWith(
        'Merchandising Hub JavaScript Error',
        expect.objectContaining({
          'page.url': '[redacted]',
          'page.path': '/page',
        })
      );
    });

    it('should handle errors with undefined stack', () => {
      const error = new Error('Test');
      error.stack = undefined;
      reportErrorToDynatrace(error);

      expect(mockSendBizEvent).toHaveBeenCalledWith(
        'Merchandising Hub JavaScript Error',
        expect.objectContaining({
          'error.stack': undefined,
        })
      );
    });
  });

  describe('setupGlobalErrorHandlers', () => {
    let cleanups: Array<(() => void) | void> = [];

    afterEach(() => {
      cleanups.forEach((cleanup) => cleanup?.());
      cleanups = [];
    });

    it('should return early if window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error Testing SSR scenario
      delete global.window;

      expect(() => setupGlobalErrorHandlers()).not.toThrow();

      global.window = originalWindow;
    });

    it('should set up error event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const cleanup = setupGlobalErrorHandlers();
      cleanups.push(cleanup);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });

    it('should set up unhandledrejection event listener', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const cleanup = setupGlobalErrorHandlers();
      cleanups.push(cleanup);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });

    it('should report errors via error event', () => {
      const cleanup = setupGlobalErrorHandlers();
      cleanups.push(cleanup);

      const error = new Error('Test error');
      const event = new ErrorEvent('error', { error, message: 'Test error' });
      window.dispatchEvent(event);

      expect(mockReportError).toHaveBeenCalledWith(error);
    });

    it('should create Error from message if error is not provided', () => {
      const cleanup = setupGlobalErrorHandlers();
      cleanups.push(cleanup);

      const event = new ErrorEvent('error', { message: 'Error message' });
      window.dispatchEvent(event);

      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error message',
        })
      );
    });

    it('should report unhandled promise rejections with Error', () => {
      const cleanup = setupGlobalErrorHandlers();
      cleanups.push(cleanup);

      const error = new Error('Promise rejection');
      const rejectedPromise = Promise.reject(error);
      rejectedPromise.catch(() => {});

      const event = Object.assign(new Event('unhandledrejection'), {
        reason: error,
        promise: rejectedPromise,
      });
      window.dispatchEvent(event);

      expect(mockReportError).toHaveBeenCalledWith(error);
    });

    it('should wrap non-Error rejection reasons', () => {
      const cleanup = setupGlobalErrorHandlers();
      cleanups.push(cleanup);

      const rejectedPromise = Promise.reject('String rejection reason');
      rejectedPromise.catch(() => {});

      const event = Object.assign(new Event('unhandledrejection'), {
        reason: 'String rejection reason',
        promise: rejectedPromise,
      });
      window.dispatchEvent(event);

      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'String rejection reason',
        })
      );
    });

    it('should return cleanup function that removes event listeners', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const cleanup = setupGlobalErrorHandlers();

      expect(cleanup).toBeInstanceOf(Function);

      cleanup?.();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
    });
  });
});

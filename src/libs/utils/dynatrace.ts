const sanitize = (
  text?: string,
  options?: { maxLength?: number }
): string | undefined => {
  if (!text) return undefined;

  const redacted = text.replace(
    /(https?:\/\/[^\s):]+|[A-Za-z]:\\[^\s):]+|\/[^\s):]+\/[^\s):]+)/g,
    '[redacted]'
  );

  if (options?.maxLength && redacted.length > options.maxLength) {
    return `${redacted.slice(0, options.maxLength)}…`;
  }

  return redacted;
};

export const reportErrorToDynatrace = (
  error: Error | string,
  context?: Record<string, string | number | boolean | undefined | null>
): void => {
  if (typeof window !== 'undefined' && window.dtrum) {
    window.dtrum.reportError(error);

    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const sanitizedStack = sanitize(errorObj.stack);
    const sanitizedMessage = sanitize(errorObj.message, { maxLength: 500 });
    const sanitizedPageUrl = sanitize(window.location.href, { maxLength: 500 });
    const sanitizedReferrer = sanitize(document.referrer, { maxLength: 500 });
    const sanitizedTitle = sanitize(document.title, { maxLength: 200 });
    const sanitizedUserAgent = sanitize(navigator.userAgent, {
      maxLength: 200,
    });

    window.dynatrace?.sendBizEvent('Merchandising Hub JavaScript Error', {
      'error.message': sanitizedMessage,
      'error.name': errorObj.name,
      'error.stack': sanitizedStack,
      'page.url': sanitizedPageUrl,
      'page.path': window.location.pathname,
      'page.title': sanitizedTitle,
      'page.referrer': sanitizedReferrer,
      'client.userAgent': sanitizedUserAgent,
      ...(context ?? {}),
      level: 'error',
    });
  }
};

export const reportApiLatency = (
  endpoint: string,
  method: string,
  status: number,
  durationMs: number
): void => {
  if (typeof window !== 'undefined' && window.dynatrace) {
    window.dynatrace.sendBizEvent('Merchandising Hub API Request', {
      'request.endpoint': endpoint,
      'request.method': method,
      'request.status': status,
      'request.durationMs': durationMs,
    });
  }
};

export const setupGlobalErrorHandlers = (): (() => void) | void => {
  if (typeof window === 'undefined') return;

  const handleError = (event: ErrorEvent | Event): void => {
    const errorEvent = event as ErrorEvent;
    reportErrorToDynatrace(errorEvent.error ?? new Error(errorEvent.message));
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
    reportErrorToDynatrace(error);
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
};

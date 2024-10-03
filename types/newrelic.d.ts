declare module '*.newrelic' {
  export function getBrowserTimingHeader(options: {
    hasToRemoveScriptWrapper: boolean;
  }): string;
}

interface Window {
  newrelic: {
    noticeError: (
      error: Error | string,
      customAttributes?: Record<string, unknown>
    ) => void;
  };
}

interface Agent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on(event: string, callback: (arg: any) => void): void;
  collector: Collector;
}

declare module 'newrelic' {
  export const agent: Agent;
  export function noticeError(
    error: (Error & { statusCode?: number | undefined }) | null | undefined
  ): void;
  export function getBrowserTimingHeader(options?: {
    nonce?: string;
    hasToRemoveScriptWrapper?: boolean;
    allowTransactionlessInjection?: boolean;
  }): string;
}

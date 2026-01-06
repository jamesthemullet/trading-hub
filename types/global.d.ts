declare global {
  interface Window {
    umami: {
      track: (
        event_name: string,
        event_data?: { [key: string]: string }
      ) => void;
    };
    clarity: (arg: string, event: string) => object;
    dtrum?: {
      reportError: (error: Error | string) => void;
      enterAction: (name: string) => number;
      leaveAction: (actionId: number) => void;
    };
    dynatrace?: {
      sendBizEvent: (type: string, data: Record<string, unknown>) => void;
    };
  }
}

export {};

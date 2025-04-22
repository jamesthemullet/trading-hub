declare global {
  interface Window {
    umami: {
      track: (
        event: string,
        url: string,
        options?: Record<string, unknown>
      ) => void;
    };
  }
}

export {};

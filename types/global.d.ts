declare global {
  interface Window {
    umami: {
      track: (
        event_name: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event_data?: { [key: string]: string }
      ) => void;
    };
    clarity: (arg: string, event: string) => object;
  }
}

export {};

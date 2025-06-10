declare global {
  interface Window {
    umami: {
      track: (
        event_name: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        event_data?: { [key: string]: any }
      ) => void;
    };
    clarity: (arg: string, arg: string) => object;
  }
}

export {};

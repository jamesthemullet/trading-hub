declare global {
  interface Window {
    umami: {
      track: (
        event_name: string,
        event_data?: { [key: string]: string }
      ) => void;
    };
    clarity: (arg: string, event: string) => object;
  }
}

export {};

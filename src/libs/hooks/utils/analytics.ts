export const track = ({ event }: { event: string }): void => {
  // istanbul ignore else
  if (typeof window !== 'undefined') {
    window.clarity?.('event', event);
    window.umami?.track(event);
  }
};

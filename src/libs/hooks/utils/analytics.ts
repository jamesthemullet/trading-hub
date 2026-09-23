export const track = ({ event }: { event: string }): void => {
  if (typeof window !== 'undefined') {
    window.clarity?.('event', event);
    window.umami?.track(event);
  }
};

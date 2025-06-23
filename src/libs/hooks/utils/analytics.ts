export const track = ({ event }: { event: string }) => {
  // istanbul ignore else
  if (window) {
    window.clarity?.('event', event);
    window.umami?.track(event);
  }
};

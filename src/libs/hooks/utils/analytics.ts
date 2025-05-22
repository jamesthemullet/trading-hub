export const track = ({ event }: { event: string }) => {
  if (window) {
    window.clarity?.('event', event);
  }
};

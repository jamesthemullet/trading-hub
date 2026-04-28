import { type RefObject, useEffect, useRef } from 'react';

type Options = {
  handler: () => void;
  shouldEnableOutsideClick?: boolean;
};

export const useOnOutsideClick = <T extends HTMLElement = HTMLElement>({
  handler,
  shouldEnableOutsideClick = true,
}: Options): RefObject<T | null> => {
  const wrapperRef = useRef<T | null>(null);

  useEffect(() => {
    if (shouldEnableOutsideClick) {
      const listener = (event: MouseEvent | TouchEvent) => {
        if (
          !wrapperRef.current ||
          wrapperRef.current.contains(event.target as Node)
        ) {
          return;
        }
        handler();
      };

      document.body.addEventListener('mousedown', listener);
      document.body.addEventListener('touchend', listener);

      return () => {
        document.body.removeEventListener('mousedown', listener);
        document.body.removeEventListener('touchend', listener);
      };
    }
    return;
  }, [wrapperRef, handler, shouldEnableOutsideClick]);

  return wrapperRef;
};

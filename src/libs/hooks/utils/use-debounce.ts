import { useCallback, useRef } from 'react';

export const useDebounce = <TCallbackArgs>(
  originalCallback: (...args: TCallbackArgs[]) => void,
  wait: number
) => {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useCallback(
    (...args: TCallbackArgs[]) => {
      const later = () => {
        clearTimeout(timeout.current as NodeJS.Timeout);
        originalCallback(...args);
      };

      clearTimeout(timeout.current as NodeJS.Timeout);

      timeout.current = setTimeout(later, wait);
    },
    [originalCallback, wait]
  );

  return {
    callback,
    cancel: () => clearTimeout(timeout.current as NodeJS.Timeout),
  };
};

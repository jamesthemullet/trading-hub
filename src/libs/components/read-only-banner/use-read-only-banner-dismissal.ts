import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY_PREFIX = 'readOnlyBannerDismissed';

const getStorageKey = (requiredWriteRole: string): string =>
  `${STORAGE_KEY_PREFIX}:${requiredWriteRole}`;

const readIsDismissed = (requiredWriteRole: string): boolean => {
  try {
    // istanbul ignore else -- typeof window is always defined in jsdom tests
    if (typeof window !== 'undefined') {
      return (
        sessionStorage.getItem(getStorageKey(requiredWriteRole)) === 'true'
      );
    }
  } catch (error) {
    console.error('Failed to read read-only banner dismissal state:', error);
  }
  return false;
};

const writeIsDismissed = (requiredWriteRole: string): void => {
  try {
    // istanbul ignore else -- typeof window is always defined in jsdom tests
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(getStorageKey(requiredWriteRole), 'true');
    }
  } catch (error) {
    console.error('Failed to save read-only banner dismissal state:', error);
  }
};

// Dismissal is keyed by requiredWriteRole (e.g. Cat.W/Search.W/Glob.W) so
// dismissing the banner on one section doesn't hide it on another, and it
// resets automatically at the end of the browser session (per tab).
export const useReadOnlyBannerDismissal = (
  requiredWriteRole: string
): {
  isDismissed: boolean;
  dismiss: () => void;
} => {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(readIsDismissed(requiredWriteRole));
  }, [requiredWriteRole]);

  const dismiss = useCallback(() => {
    writeIsDismissed(requiredWriteRole);
    setIsDismissed(true);
  }, [requiredWriteRole]);

  return { isDismissed, dismiss };
};

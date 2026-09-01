import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const UNSAVED_CHANGES_WARNING =
  'You have unsaved changes - are you sure you wish to leave this page?';

export const useUnsavedChangesGuard = (
  hasUnsavedChanges: boolean
): {
  confirmNavigation: () => void;
  resetNavigationConfirmation: () => void;
} => {
  const router = useRouter();
  const isNavigationConfirmedRef = useRef(false);

  useEffect(() => {
    const handleWindowClose = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      // eslint-disable-next-line functional/immutable-data
      event.returnValue = '';
    };

    const handleBrowseAway = () => {
      if (!hasUnsavedChanges) return;
      if (isNavigationConfirmedRef.current) {
        // eslint-disable-next-line functional/immutable-data
        isNavigationConfirmedRef.current = false;
        return;
      }
      if (window.confirm(UNSAVED_CHANGES_WARNING)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);

    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [hasUnsavedChanges, router]);

  // Lets a caller who has already handled its own unsaved-changes
  // confirmation (e.g. a custom "close without saving" modal) skip the
  // native browser confirm() this hook would otherwise show for the
  // in-app navigation that follows.
  const confirmNavigation = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isNavigationConfirmedRef.current = true;
  }, []);

  const resetNavigationConfirmation = useCallback(() => {
    // eslint-disable-next-line functional/immutable-data
    isNavigationConfirmedRef.current = false;
  }, []);

  return { confirmNavigation, resetNavigationConfirmation };
};

import { renderHook } from '@testing-library/react';
import { useRouter } from 'next/router';

import { useUnsavedChangesGuard } from './use-unsaved-changes-guard';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('useUnsavedChangesGuard', () => {
  const routerEvents = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ events: routerEvents });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prevents browser tab close when there are unsaved changes', () => {
    renderHook(() => useUnsavedChangesGuard(true));

    const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
    const preventDefaultSpy = jest.spyOn(beforeUnloadEvent, 'preventDefault');

    window.dispatchEvent(beforeUnloadEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('does not prevent browser tab close when there are no unsaved changes', () => {
    renderHook(() => useUnsavedChangesGuard(false));

    const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
    const preventDefaultSpy = jest.spyOn(beforeUnloadEvent, 'preventDefault');

    window.dispatchEvent(beforeUnloadEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChangesGuard(true));

    unmount();

    const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
    const preventDefaultSpy = jest.spyOn(beforeUnloadEvent, 'preventDefault');

    window.dispatchEvent(beforeUnloadEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
    expect(routerEvents.off).toHaveBeenCalledWith(
      'routeChangeStart',
      expect.any(Function)
    );
  });

  it('does nothing on route change when there are no unsaved changes', () => {
    renderHook(() => useUnsavedChangesGuard(false));

    const handleBrowseAway = routerEvents.on.mock.calls[0][1];
    handleBrowseAway();

    expect(routerEvents.emit).not.toHaveBeenCalled();
  });

  it('allows route change when the user confirms leaving', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderHook(() => useUnsavedChangesGuard(true));

    const handleBrowseAway = routerEvents.on.mock.calls[0][1];

    expect(() => handleBrowseAway()).not.toThrow();
    expect(routerEvents.emit).not.toHaveBeenCalled();
  });

  it('aborts route change when the user cancels leaving', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    renderHook(() => useUnsavedChangesGuard(true));

    const handleBrowseAway = routerEvents.on.mock.calls[0][1];

    expect(() => handleBrowseAway()).toThrow('routeChange aborted.');
    expect(routerEvents.emit).toHaveBeenCalledWith('routeChangeError');
  });

  it('skips the native confirm on route change after confirmNavigation is called', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useUnsavedChangesGuard(true));

    result.current.confirmNavigation();

    const handleBrowseAway = routerEvents.on.mock.calls[0][1];

    expect(() => handleBrowseAway()).not.toThrow();
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(routerEvents.emit).not.toHaveBeenCalled();
  });

  it('restores the native confirm after resetNavigationConfirmation is called', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const { result } = renderHook(() => useUnsavedChangesGuard(true));

    result.current.confirmNavigation();
    result.current.resetNavigationConfirmation();

    const handleBrowseAway = routerEvents.on.mock.calls[0][1];

    expect(() => handleBrowseAway()).not.toThrow();
    expect(confirmSpy).toHaveBeenCalled();
  });
});

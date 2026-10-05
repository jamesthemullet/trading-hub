import { act, renderHook, waitFor } from '@testing-library/react';

import { useReadOnlyBannerDismissal } from './use-read-only-banner-dismissal';

describe('useReadOnlyBannerDismissal', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts as not dismissed when nothing is stored', () => {
    const { result } = renderHook(() => useReadOnlyBannerDismissal('Cat.W'));

    expect(result.current.isDismissed).toBe(false);
  });

  it('marks the banner as dismissed and persists it in sessionStorage', () => {
    const { result } = renderHook(() => useReadOnlyBannerDismissal('Cat.W'));

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isDismissed).toBe(true);
    expect(sessionStorage.getItem('readOnlyBannerDismissed:Cat.W')).toBe(
      'true'
    );
  });

  it('reads a previously persisted dismissal on mount', async () => {
    sessionStorage.setItem('readOnlyBannerDismissed:Search.W', 'true');

    const { result } = renderHook(() => useReadOnlyBannerDismissal('Search.W'));

    await waitFor(() => {
      expect(result.current.isDismissed).toBe(true);
    });
  });

  it('keeps dismissal state separate per requiredWriteRole', () => {
    sessionStorage.setItem('readOnlyBannerDismissed:Glob.W', 'true');

    const { result } = renderHook(() => useReadOnlyBannerDismissal('Cat.W'));

    expect(result.current.isDismissed).toBe(false);
  });

  it('does not throw when sessionStorage access fails', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useReadOnlyBannerDismissal('Cat.W'));

    expect(result.current.isDismissed).toBe(false);
  });

  it('logs an error when persisting the dismissal fails', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { result } = renderHook(() => useReadOnlyBannerDismissal('Cat.W'));

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isDismissed).toBe(true);
    expect(consoleError).toHaveBeenCalledWith(
      'Failed to save read-only banner dismissal state:',
      expect.any(Error)
    );
  });
});

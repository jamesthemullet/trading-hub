import { act, renderHook } from '@testing-library/react';

import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
  const mockFnToDebounce = jest.fn();
  const wait = 100;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should execute callback after wait period', () => {
    const { result } = renderHook(() => useDebounce(mockFnToDebounce, wait));

    result.current.callback();

    expect(mockFnToDebounce).not.toHaveBeenCalled();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockFnToDebounce).toHaveBeenCalledTimes(1);
  });

  it('should not execute callback on being cleared', () => {
    const { result } = renderHook(() => useDebounce(mockFnToDebounce, wait));

    result.current.callback();
    result.current.cancel();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockFnToDebounce).not.toHaveBeenCalled();
  });
});

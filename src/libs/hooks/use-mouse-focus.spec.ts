import type { FocusEvent, MouseEvent } from 'react';
import { act, renderHook } from '@testing-library/react';

import { useMouseFocus } from './use-mouse-focus';

describe('useMouseFocus', () => {
  it('should set `isMouseFocus: true` on mouse down', () => {
    const { result } = renderHook(() => useMouseFocus());
    expect(result.current.isMouseFocus).toEqual(false);

    act(() => {
      result.current.onMouseDown({} as MouseEvent);
    });

    expect(result.current.isMouseFocus).toEqual(true);
  });

  it('should set `isMouseFocus: false` on blur', () => {
    const { result } = renderHook(() => useMouseFocus());

    act(() => {
      result.current.onMouseDown({} as MouseEvent);
      result.current.onBlur({} as FocusEvent);
    });

    expect(result.current.isMouseFocus).toEqual(false);
  });

  describe('when onMouseDown and onBlur are provided', () => {
    it('should call the provided parameters', () => {
      const onBlurMock = jest.fn();
      const onMouseDownMock = jest.fn();
      const { result } = renderHook(() =>
        useMouseFocus({ onBlur: onBlurMock, onMouseDown: onMouseDownMock })
      );

      act(() => {
        result.current.onMouseDown({} as MouseEvent);
        result.current.onBlur({} as FocusEvent);
      });

      expect(onBlurMock).toHaveBeenCalledTimes(1);
      expect(onMouseDownMock).toHaveBeenCalledTimes(1);
    });
  });
});

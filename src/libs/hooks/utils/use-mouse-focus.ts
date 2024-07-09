import type { DOMAttributes } from 'react';
import { useState } from 'react';

type UseMouseFocusParams = Pick<
  DOMAttributes<Element>,
  'onBlur' | 'onMouseDown'
>;

type UseMouseFocusReturn = Required<UseMouseFocusParams> & {
  isMouseFocus: boolean;
};

export const useMouseFocus = ({
  onBlur,
  onMouseDown,
}: UseMouseFocusParams = {}): UseMouseFocusReturn => {
  const [isMouseFocus, setIsMouseFocus] = useState(false);

  return {
    isMouseFocus,
    onBlur: (event) => {
      setIsMouseFocus(false);
      onBlur?.(event);
    },
    onMouseDown: (event) => {
      setIsMouseFocus(true);
      onMouseDown?.(event);
    },
  };
};

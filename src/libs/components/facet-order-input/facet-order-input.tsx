import type React from 'react';

import { StyledInput } from '@/libs/containers/shared/table/table.styles';

type FacetOrderInputProps = {
  displayValue: string;
  order: number;
  localOrder: number | string | undefined;
  inputRef: (el: HTMLInputElement | null) => void;
  onInputChange: (displayValue: string, value: string) => void;
  onInputBlur: (displayValue: string, value: string, order: number) => void;
  onInputKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    displayValue: string,
    order: number
  ) => void;
};

export const FacetOrderInput = ({
  displayValue,
  order,
  localOrder,
  inputRef,
  onInputChange,
  onInputBlur,
  onInputKeyDown,
}: FacetOrderInputProps) => {
  return (
    <StyledInput
      ref={inputRef}
      id={`order-input-${displayValue}`}
      label={`Order for ${displayValue}`}
      isLabelHidden
      type="number"
      value={localOrder}
      min={1}
      aria-label={`Order for ${displayValue}`}
      onFocus={(e) => {
        e.target.select();
      }}
      onChange={(e) => onInputChange(displayValue, e.target.value)}
      onBlur={(e) => onInputBlur(displayValue, e.currentTarget.value, order)}
      onKeyDown={(e) => onInputKeyDown(e, displayValue, order)}
    />
  );
};

import type React from 'react';

import { Input } from '@/libs/containers/shared/input/input';

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
  writeEnabled: boolean;
};

export const FacetOrderInput = ({
  displayValue,
  order,
  localOrder,
  inputRef,
  onInputChange,
  onInputBlur,
  onInputKeyDown,
  writeEnabled,
}: FacetOrderInputProps) => {
  return (
    <Input
      ref={inputRef}
      id={`order-input-${displayValue}`}
      label={`Order for ${displayValue}`}
      isLabelHidden
      type="number"
      value={localOrder}
      min={1}
      aria-label={`Order for ${displayValue}`}
      disabled={!writeEnabled}
      onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
        e.target.select();
      }}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onInputChange(displayValue, e.target.value)
      }
      onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
        onInputBlur(displayValue, e.currentTarget.value, order)
      }
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
        onInputKeyDown(e, displayValue, order)
      }
    />
  );
};

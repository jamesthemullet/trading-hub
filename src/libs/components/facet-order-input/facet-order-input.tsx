import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  RefCallback,
} from 'react';
import { memo } from 'react';

import { Input } from '@/libs/containers/shared/input/input';

type FacetOrderInputProps = {
  displayValue: string;
  order: number;
  localOrder: number | '';
  inputRef: RefCallback<HTMLInputElement>;
  onInputChange: (displayValue: string, value: string) => void;
  onInputBlur: (displayValue: string, value: string, order: number) => void;
  onInputKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    displayValue: string,
    order: number
  ) => void;
  isWriteEnabled: boolean;
};

const FacetOrderInputComponent = ({
  displayValue,
  order,
  localOrder,
  inputRef,
  onInputChange,
  onInputBlur,
  onInputKeyDown,
  isWriteEnabled,
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
      disabled={!isWriteEnabled}
      onFocus={(e: FocusEvent<HTMLInputElement>) => {
        e.target.select();
      }}
      onChange={(e: ChangeEvent<HTMLInputElement>) => {
        onInputChange(displayValue, e.target.value);
      }}
      onBlur={(e: FocusEvent<HTMLInputElement>) =>
        onInputBlur(displayValue, e.currentTarget.value, order)
      }
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
        onInputKeyDown(e, displayValue, order)
      }
    />
  );
};

export const FacetOrderInput = memo(FacetOrderInputComponent);
FacetOrderInput.displayName = 'FacetOrderInput';

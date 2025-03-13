import type { ComponentProps } from 'react';

import { Input, Label, LabelText } from './checkboxes.styles';

type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref'
> & {
  label: string;
  onChange: () => void;
  showLabel?: boolean;
};

export const Checkbox = ({ label, showLabel, ...rest }: InputProps) =>
  showLabel ? (
    <Label>
      <Input type="checkbox" {...rest} aria-label={label} />{' '}
      <LabelText>{label}</LabelText>
    </Label>
  ) : (
    <Input type="checkbox" {...rest} aria-label={label} />
  );

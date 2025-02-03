import { ComponentProps } from 'react';

import { Input } from './checkboxes.styles';

type InputProps = Omit<
  ComponentProps<'input'>,
  'isEmpty' | 'isMouseFocus' | 'ref'
> & {
  label: string;
};

export const Checkbox = ({ label, ...rest }: InputProps) => (
  <Input type="checkbox" {...rest} aria-label={label} />
);

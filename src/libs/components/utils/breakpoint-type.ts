import type { dotcomTheme } from './constants';

export type BreakPoint = keyof (typeof dotcomTheme)['grid']['breakPoints'];
type Sm = 'sm';
type Md = Extract<BreakPoint, 'md'>;
type Lg = Extract<BreakPoint, 'lg'>;
type Xl = Extract<BreakPoint, 'xl'>;

export type ActiveBreakpoints =
  | Sm
  | `${Sm}, ${Md}`
  | `${Sm}, ${Md}, ${Lg}`
  | `${Sm}, ${Md}, ${Lg}, ${Xl}`;

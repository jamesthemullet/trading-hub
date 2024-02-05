/* istanbul ignore file */
const breakpoints = {
  md: 768,
  lg: 1024,
  xl: 1280,
};

export type BreakPoint = keyof typeof breakpoints;
type Sm = 'sm';
type Md = Extract<BreakPoint, 'md'>;
type Lg = Extract<BreakPoint, 'lg'>;
type Xl = Extract<BreakPoint, 'xl'>;

export type ActiveBreakpoints =
  | Sm
  | `${Sm}, ${Md}`
  | `${Sm}, ${Md}, ${Lg}`
  | `${Sm}, ${Md}, ${Lg}, ${Xl}`;

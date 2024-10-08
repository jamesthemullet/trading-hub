/* istanbul ignore file */
type breakpoints = {
  md: 768;
  lg: 1024;
  xl: 1280;
  xxl: 1728;
  xxxl: 1968;
};

export type BreakPoint = keyof breakpoints;
type Sm = 'sm';
type Md = Extract<BreakPoint, 'md'>;
type Lg = Extract<BreakPoint, 'lg'>;
type Xl = Extract<BreakPoint, 'xl'>;

export type BreakPoints =
  | 'mdUp'
  | 'mdDown'
  | 'lgUp'
  | 'lgDown'
  | Sm
  | Md
  | Lg
  | Xl
  | `${Sm}, ${Md}`
  | `${Sm}, ${Lg}`
  | `${Sm}, ${Xl}`
  | `${Md}, ${Lg}`
  | `${Md}, ${Xl}`
  | `${Lg}, ${Xl}`
  | `${Sm}, ${Md}, ${Xl}`
  | `${Sm}, ${Lg}, ${Xl}`
  | `${Md}, ${Lg}, ${Xl}`
  | `${Sm}, ${Md}, ${Lg}`
  | `${Sm}, ${Md}, ${Lg}, ${Xl}`;

export type ActiveBreakpoints =
  | Sm
  | `${Sm}, ${Md}`
  | `${Sm}, ${Md}, ${Lg}`
  | `${Sm}, ${Md}, ${Lg}, ${Xl}`;

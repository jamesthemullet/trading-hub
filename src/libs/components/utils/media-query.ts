import type { BreakPoint } from './breakpoint-type';
import type { dotcomTheme } from './constants';

export const mediaQuery =
  (breakPoint: BreakPoint) =>
  ({ theme }: { theme: typeof dotcomTheme }) =>
    `@media (min-width: ${theme.grid.breakPoints[breakPoint]}px)`;

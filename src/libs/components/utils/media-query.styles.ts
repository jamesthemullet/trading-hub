import type { BreakPoint } from './breakpoint-type';

export const breakPoints = {
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const mediaQuery = (breakPoint: BreakPoint) => () =>
  `@media (min-width: ${breakPoints[breakPoint]}px)`;

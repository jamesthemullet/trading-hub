import type { BreakPoint } from './breakpoint-type';

export const breakPoints = {
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1728,
  xxxl: 1968,
};

export const mediaQuery = (breakPoint: BreakPoint) => () =>
  `@media (min-width: ${breakPoints[breakPoint]}px)`;

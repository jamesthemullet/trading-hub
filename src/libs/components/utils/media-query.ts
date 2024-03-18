import type { BreakPoint } from './breakpoint-type';

const grid = {
  containerMaxWidth: 1280,
  numberOfColumns: 12,
  numberOfColumnsMobile: 4,
  gutterWidth: {
    sm: 16,
    md: 24,
  },
  breakPoints: {
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

export const mediaQuery = (breakPoint: BreakPoint) => () =>
  `@media (min-width: ${grid.breakPoints[breakPoint]}px)`;

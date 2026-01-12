/* istanbul ignore file */
type breakpoints = {
  md: 768;
  lg: 1024;
  xl: 1280;
  xxl: 1728;
  xxxl: 1968;
};

export type BreakPoint = keyof breakpoints;

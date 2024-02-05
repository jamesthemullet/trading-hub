type SpacingNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;

type PercentageDigits = `${SpacingNumber | ''}${SpacingNumber}`;
type PercentageSpacingUnit =
  | `${'-' | ''}${PercentageDigits}%`
  | `${'100%' | '-100%'}`
  | `${PercentageDigits}.${PercentageDigits}%`;

export type FourAndTwelvePixelUnit = 0.5 | -0.5 | 1.5 | -1.5;
export type RoundNumberSpacingUnit =
  | 0
  | 1
  | -1
  | 2
  | -2
  | 3
  | -3
  | 4
  | -4
  | 5
  | -5
  | 6
  | -6
  | 7
  | -7
  | 8
  | -8
  | 9
  | -9
  | 10
  | -10
  | 11
  | -11
  | 12
  | -12
  | 13
  | -13
  | 14
  | -14
  | 15
  | -15
  | 16
  | -16
  | 17
  | -17
  | 18
  | -18
  | 19
  | -19
  | 20
  | -20
  | 27
  | -27
  | 31
  | -31
  | 40
  | -40
  | 44
  | -44
  | 50
  | -50
  | 64
  | -64
  | 72
  | -72;

export type SpacingUnit =
  | PercentageSpacingUnit
  | RoundNumberSpacingUnit
  | FourAndTwelvePixelUnit;

export const spacing = (unit: SpacingUnit) =>
  typeof unit === 'string' ? unit : `${(unit * 8) / 16}rem`;

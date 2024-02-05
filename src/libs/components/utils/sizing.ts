type SizingNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 0;

type SizingDigits = `${SizingNumber | ''}${SizingNumber}`;
type PercentageSizingUnit =
  | `${'-' | ''}${SizingDigits}%`
  | `${'100%' | '-100%'}`
  | `${SizingDigits}.${SizingDigits}%`;

type FourAndTwelvePixelUnit = 0.5 | -0.5 | 1.5 | -1.5;
export type RoundNumberSizingUnit =
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
  | 22
  | -22
  | 23
  | -23
  | 24
  | -24
  | 25
  | -25
  | 27
  | -27
  | 29
  | -29
  | 31
  | -31
  | 35
  | -35
  | 37
  | -37
  | 38
  | -38
  | 40
  | -40
  | 41
  | -41
  | 43
  | -43
  | 44
  | -44
  | 47
  | -47
  | 48
  | -48
  | 50
  | -50
  | 54
  | -54
  | 64
  | -64
  | 66
  | -66
  | 70
  | -70
  | 72
  | -72
  | 80
  | -80
  | 86
  | -86
  | 90
  | -90
  | 91
  | -91
  | 102
  | -102
  | 115
  | -115
  | 117
  | -117
  | 118
  | -118
  | 132
  | -132
  | 134
  | -134
  | 148
  | -148
  | 154
  | -154
  | 156
  | -156
  | 201
  | -201
  | 218
  | -218;

export type SizingUnit =
  | PercentageSizingUnit
  | RoundNumberSizingUnit
  | FourAndTwelvePixelUnit;

export const sizing = (unit: SizingUnit) =>
  typeof unit === 'string' ? unit : `${(unit * 8) / 16}rem`;

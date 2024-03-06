// Note: this will be replaced in favour of typography.styles.tsx

import type {
  AnchorHTMLAttributes,
  ComponentProps,
  CSSProperties,
  DetailedHTMLProps,
  ReactNode,
} from 'react';

import { css } from '@emotion/react';
import type { StyledComponent } from '@emotion/styled';
import styled from '@emotion/styled';
import type { BreakPoint } from '../utils/breakpoint-type';
import { mediaQuery, breakPoints } from '../utils/media-query.styles';
import type { default as NextLink } from 'next/link';

import type {
  FourAndTwelvePixelUnit,
  RoundNumberSpacingUnit,
} from '../utils/spacing';
import { spacing } from '../utils/spacing';
import { type SharedLinkVariants, linkStyles } from '../utils/link-styles';
import {
  type TypographyStyleProps,
  extraSmallTypographyStyles,
  microTypographyStyles,
  smallTypographyStyles,
} from '../utils/shared.styles';
import { colourPalette, fonts, typography } from '../utils/constants';

type Sm = 'sm';
type Md = Extract<BreakPoint, 'md'>;
type Lg = Extract<BreakPoint, 'lg'>;
type Xl = Extract<BreakPoint, 'xl'>;

type VariantsWithMdStyles =
  | 'displayExtraLarge'
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headingLarge'
  | 'headingMedium';

type Variants =
  | 'headingSmall'
  | 'body'
  | 'textSmall'
  | 'textExtraSmall'
  | 'overline'
  | 'micro'
  | 'small'
  | 'extraSmall'
  | VariantsWithMdStyles
  | SharedLinkVariants;

type VariantOptions =
  | Variants
  | Record<Sm | Md, Variants>
  | Record<Sm | Lg, Variants>
  | Record<Sm | Xl, Variants>
  | Record<Sm | Md | Lg, Variants>
  | Record<Sm | Md | Xl, Variants>
  | Record<Sm | Lg | Xl, Variants>
  | Record<Sm | Md | Lg | Xl, Variants>;

type LinkV1Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant?: any;
  as?: never;
  children: ReactNode;
} & (
  | {
      isHrefPassedExternally: true;
      href?: never;
    }
  | {
      href: string;
    }
);

type LinkV1 = StyledComponent<
  LinkV1Props,
  DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>
>;

export type BaseTypographyProps = {
  variant?: VariantOptions;
  isStrong?: TypographyStyleProps['isStrong'];
  gutterBottom?: RoundNumberSpacingUnit | FourAndTwelvePixelUnit;
  letterSpacing?: CSSProperties['letterSpacing'];
  textTransform?: CSSProperties['textTransform'];
  textDecoration?: CSSProperties['textDecoration'];
  textAlign?: CSSProperties['textAlign'];
  color?: CSSProperties['color'];
  backgroundColor?: CSSProperties['backgroundColor'];
  wordBreak?: CSSProperties['wordBreak'];
  hasDropShadow?: boolean;
  shouldRemoveTextDecoration?: boolean;
} & (
  | {
      as: 'a' | typeof NextLink | LinkV1;
      href: string;
      target?: '_blank' | '_top' | '_self' | '_parent';
    }
  | {
      as: React.ElementType;
      href?: never;
    }
);

type VariantStylesType = {
  variant: BaseTypographyProps['variant'];
  backgroundColor?: BaseTypographyProps['backgroundColor'];
  isStrong?: BaseTypographyProps['isStrong'];
};

const getVariantMdStyles = ({ variant }: { variant: VariantsWithMdStyles }) => {
  switch (variant) {
    case 'displayExtraLarge':
      return css`
        font-size: ${fonts.size[1600]};
        line-height: 1.25;
      `;
    case 'displayLarge':
      return css`
        font-size: ${fonts.size[1350]};
        line-height: 1.214;
      `;
    case 'displayMedium':
      return css`
        font-size: ${fonts.size[1200]};
        line-height: 1.25;
      `;
    case 'displaySmall':
      return css`
        font-size: ${fonts.size[1100]};
        line-height: 1.333;
      `;
    case 'headingLarge':
      return css`
        font-size: ${fonts.size[1150]};
        line-height: 1.222;
      `;
    case 'headingMedium':
      return css`
        font-size: ${fonts.size[1000]};
        line-height: 1.357;
      `;
  }
};

const setupMediaQueries = ({
  variant,
  shouldOverride,
}: {
  variant: VariantsWithMdStyles;
  shouldOverride: boolean;
}) =>
  shouldOverride
    ? getVariantMdStyles({ variant })
    : css`
        ${mediaQuery('md')()} {
          ${getVariantMdStyles({ variant })}
        }
      `;

const getVariantStyles = ({
  variant,
  backgroundColor,
  shouldOverride = false,
  isStrong,
}: VariantStylesType & {
  shouldOverride?: boolean;
}) => {
  switch (variant) {
    case 'displayExtraLarge':
      return css`
        font-family: ${typography.primary.display};
        font-size: ${fonts.size[1400]};
        line-height: 1.233;
        ${setupMediaQueries({ variant, shouldOverride })}
      `;
    case 'displayLarge':
      return css`
        font-family: ${typography.primary.display};
        font-size: ${fonts.size[1200]};
        line-height: 1.25;
        ${setupMediaQueries({ variant, shouldOverride })}
      `;
    case 'displayMedium':
      return css`
        font-family: ${typography.primary.display};
        font-size: ${fonts.size[1100]};
        line-height: 1.333;
        ${setupMediaQueries({ variant, shouldOverride })}
      `;
    case 'displaySmall':
      return css`
        font-family: ${typography.primary.display};
        font-size: ${fonts.size[800]};
        line-height: 1.25;
        ${setupMediaQueries({ variant, shouldOverride })}
      `;
    case 'headingLarge':
      return css`
        font-family: ${isStrong
          ? fonts.primary.semiBold
          : typography.primary.heading};
        font-size: ${fonts.size[1000]};
        line-height: 1.286;
        ${setupMediaQueries({ variant, shouldOverride })}
      `;
    case 'headingMedium':
      return css`
        font-family: ${isStrong
          ? fonts.primary.semiBold
          : typography.primary.heading};
        font-size: ${fonts.size[800]};
        line-height: 1.333;
        ${setupMediaQueries({ variant, shouldOverride })}
      `;
    case 'headingSmall':
      return css`
        font-family: ${isStrong
          ? fonts.primary.semiBold
          : typography.primary.heading};
        font-size: ${fonts.size[600]};
        line-height: 1.4;
      `;
    case 'small':
    case 'textSmall':
      return smallTypographyStyles({ isStrong });
    case 'extraSmall':
    case 'textExtraSmall':
      return extraSmallTypographyStyles({ isStrong });
    case 'overline':
      return css`
        font-family: ${fonts.primary.semiBold};
        font-size: ${fonts.size[100]};
        line-height: 1.333;
        letter-spacing: 1px;
        text-transform: uppercase;
      `;
    case 'micro':
      return microTypographyStyles();
    case 'landingPage':
    case 'landingPagePrimary':
    case 'landingPagePrimaryOutline':
      return linkStyles({ backgroundColor })[variant];
    case 'body':
    default:
      return css`
        font-family: ${isStrong
          ? fonts.primary.semiBold
          : typography.primary.bodyText};
        font-size: ${fonts.size[400]};
        line-height: 1.625;
      `;
  }
};

const handleVariantStyles = ({
  variant,
  backgroundColor,
  isStrong,
}: VariantStylesType) => {
  if (typeof variant === 'object') {
    const { md, lg, xl } = breakPoints;
    return css`
      ${getVariantStyles({
        variant: variant.sm,
        backgroundColor,
        isStrong,
      })}
      ${'md' in variant &&
      css`
        @media (min-width: ${md}px) {
          ${getVariantStyles({
            variant: variant.md,
            backgroundColor,
            isStrong,
          })}
        }
      `}
      ${'lg' in variant &&
      css`
        @media (min-width: ${lg}px) {
          ${getVariantStyles({
            variant: variant.lg,
            backgroundColor,
            isStrong,
            shouldOverride: true,
          })}
        }
      `}
      ${'xl' in variant &&
      css`
        @media (min-width: ${xl}px) {
          ${getVariantStyles({
            variant: variant.xl,
            backgroundColor,
            isStrong,
            shouldOverride: true,
          })}
        }
      `}
    `;
  }

  return getVariantStyles({ variant, backgroundColor, isStrong });
};

export const Typography = styled.p<BaseTypographyProps>`
  color: ${colourPalette.tertiary.darkGrey};
  font-weight: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0 0 ${({ gutterBottom = 0 }) => spacing(gutterBottom)};
  ${({
    color,
    letterSpacing,
    textTransform,
    textDecoration,
    textAlign,
    wordBreak,
    shouldRemoveTextDecoration,
  }) =>
    css({
      ...(color && { color }),
      ...(letterSpacing && { letterSpacing }),
      ...(textTransform && { textTransform }),
      ...(textDecoration && { textDecoration }),
      ...(textAlign && { textAlign }),
      ...(wordBreak && { wordBreak }),
      ...(shouldRemoveTextDecoration && { textDecoration: 'none' }),
      ...(shouldRemoveTextDecoration && {
        textDecoration: 'none',
        ':hover': {
          textDecoration: 'underline',
        },
      }),
    })}
  ${({ variant = 'body', backgroundColor, isStrong }) =>
    handleVariantStyles({ variant, backgroundColor, isStrong })}
`;

export type TypographyProps = ComponentProps<typeof Typography>;

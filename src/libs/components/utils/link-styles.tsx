import type { CSSProperties } from 'react';

import { css } from '@emotion/react';
import { colourDictionary, colours, fonts } from '../utils/constants';

import { sizing } from '../utils/sizing';
import { spacing } from '../utils/spacing';
import {
  extraSmallTypographyStyles,
  smallTypographyStyles,
} from './shared.styles';

export type SharedLinkVariants =
  | 'extraSmall'
  | 'small'
  | 'smallEmphasis'
  | 'landingPage'
  | 'landingPagePrimary'
  | 'landingPagePrimaryOutline'
  | 'default';

const defaultButtonLikeStyles = () => css`
  border: 0;
  color: ${colours.text.main};
  font-family: ${fonts.primary.semiBold};
  align-items: center;
  text-decoration: none;
  white-space: nowrap;
  display: inline-flex;
  width: auto;
`;

const defaultLinkLikeStyles = css`
  border: 0;
  height: auto;
  padding: 0;
  text-decoration: underline;
  width: auto;
  :hover {
    text-decoration: underline;
  }
  color: inherit;
`;

export const linkStyles = ({
  backgroundColor,
}: {
  backgroundColor?: CSSProperties['backgroundColor'];
}) => ({
  landingPage: css`
    ${defaultButtonLikeStyles()}
    padding: 0;
    .icon {
      mask-size: contain;
    }
  `,
  landingPagePrimary: css`
    ${defaultButtonLikeStyles()}
    ${backgroundColor && `background-color: ${backgroundColor};`}
    padding: ${spacing(0.5)} ${spacing(3)};
    min-height: ${sizing(5)};
    .icon {
      margin-right: ${spacing(-1)};
      mask-size: contain;
    }
  `,
  landingPagePrimaryOutline: css`
    ${defaultButtonLikeStyles()}
    background-color: ${colourDictionary.white};
    padding: ${spacing(0.5)} ${spacing(3)};
    min-height: ${sizing(5)};
    border: 1px solid ${colourDictionary.black};
    .icon {
      margin-right: ${spacing(-1)};
      mask-size: contain;
    }
  `,
  small: css`
    ${defaultLinkLikeStyles}
    ${smallTypographyStyles({})}
  `,
  smallEmphasis: css`
    ${defaultLinkLikeStyles}
    ${smallTypographyStyles({})}
    font-family: ${fonts.primary.semiBold};
  `,
  extraSmall: css`
    ${defaultLinkLikeStyles}
    ${extraSmallTypographyStyles({})}
  `,
});

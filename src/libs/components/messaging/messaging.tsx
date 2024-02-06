import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Icon } from '../icon/icon';
import { colourDictionary, dotcomTheme } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { sizing } from '../utils/sizing';
import { mediaQuery } from '../utils/media-query';

export type MessagingProps = {
  variant: 'success' | 'info' | 'error' | 'inlineError';
  children: ReactNode;
  hasBackground?: boolean;
  role?: HTMLAttributes<Element>['role'];
  style?: CSSProperties;
} & (
  | {
      hasIcon?: true;
      isIconAlignedCentrally?: boolean;
    }
  | {
      hasIcon?: false;
      isIconAlignedCentrally?: never;
    }
);

type MessagingColours = {
  [key in MessagingProps['variant']]: {
    main: string;
    accent: string;
  };
};

const messagingColours: MessagingColours = {
  error: {
    main: colourDictionary.red[200],
    accent: colourDictionary.red[300],
  },
  inlineError: {
    main: colourDictionary.red[200],
    accent: colourDictionary.red[300],
  },
  info: {
    main: colourDictionary.blue[200],
    accent: colourDictionary.blue[700],
  },
  success: {
    main: colourDictionary.green[100],
    accent: colourDictionary.green[700],
  },
};

const StyledMessagingWrapper = styled.div<{
  variant: MessagingProps['variant'];
  hasBackground?: MessagingProps['hasBackground'];
  theme: typeof dotcomTheme;
}>`
  display: flex;
  flex-direction: column;
  position: relative;
  padding: ${({ variant }) => sizing(variant === 'inlineError' ? 1 : 1.5)}
    ${sizing(2)};
  margin: 0 auto;
  ${mediaQuery('xl')} {
    max-width: ${({ theme }) => theme.grid.containerMaxWidth}px;
  }

  ${({ variant, hasBackground }) =>
    hasBackground
      ? css`
          background-color: ${messagingColours[variant]?.main};
          color: ${messagingColours[variant]?.main};
          border-left: ${sizing(0.5)} solid ${messagingColours[variant]?.accent};
          border-radius: 3px 0 0 3px;
        `
      : css`
          padding: 0;
        `}
`;

const StyledMessaging = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyleIcon = styled.div<{
  variant: MessagingProps['variant'];
  isIconAlignedCentrally: boolean;
}>`
  margin-right: ${spacing(2)};
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: ${({ isIconAlignedCentrally }) =>
    isIconAlignedCentrally ? 'center' : 'flex-start'};
  flex-shrink: 0;
`;

const StyleArrow = styled.span`
  width: ${sizing(2)};
  height: 10px;
  position: absolute;

  ::before {
    content: '';
    display: block;
    width: 0;
    height: 0;
    position: absolute;
    border-right: ${sizing(1)} solid transparent;
    border-left: ${sizing(1)} solid transparent;
    left: ${spacing(0.5)};
    border-bottom: ${sizing(1)} solid;
    border-bottom-color: inherit;
    bottom: 0;
  }

  top: 0;
  transform: translateY(-10px);
`;

const StyleBodyContainer = styled.div<{ theme: typeof dotcomTheme }>`
  color: ${({ theme }) => theme.colours.text.main};
  padding-top: 2px;
  width: calc(${sizing('100%')} - ${sizing(3)});
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  ul {
    margin-top: ${spacing(1)};
    margin-bottom: ${spacing(1)};
  }
`;

const getVariantIconName = (variant: MessagingProps['variant']) => {
  switch (variant) {
    case 'success':
      return 'SuccessCheck';
    case 'info':
      return 'InfoIcon';
    case 'error':
    case 'inlineError':
      return 'ErrorTriangle';
  }
};

export const Messaging = ({
  variant,
  hasIcon = false,
  isIconAlignedCentrally = false,
  children,
  hasBackground = true,
  ...rest
}: MessagingProps) => (
  <StyledMessagingWrapper
    variant={variant}
    hasBackground={hasBackground}
    theme={dotcomTheme}
    {...rest}
  >
    <StyledMessaging>
      {variant === 'inlineError' && hasBackground && <StyleArrow />}
      {hasIcon && (
        <StyleIcon
          variant={variant}
          isIconAlignedCentrally={isIconAlignedCentrally}
        >
          <Icon
            name={getVariantIconName(variant)}
            color={colourDictionary.white}
            size={24}
            shouldRemovePadding
          />
        </StyleIcon>
      )}
      <StyleBodyContainer
        theme={dotcomTheme}
        {...((variant === 'error' || variant === 'inlineError') && {
          role: 'alert',
        })}
      >
        {children}
      </StyleBodyContainer>
    </StyledMessaging>
  </StyledMessagingWrapper>
);

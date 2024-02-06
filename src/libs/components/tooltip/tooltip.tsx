import { useState } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';
import { Typography } from '../typography/typography';
import { colourDictionary } from '../utils/constants';
import { useOnOutsideClick } from '../../hooks/use-on-outside-click';
import { spacing } from '../utils/spacing';
import { sizing } from '../utils/sizing';

export type TooltipProps = {
  text: string;
  arrowAlignment?: 'left' | 'middle' | 'right';
  id: string;
};

export const tooltipAriaLabelledBy = (id: string) => ({
  'aria-labelledby': `${id} ${id}-tooltip`,
});

const tooltipWidth = 31;
const arrowWidth = 1.5;
const offset = '2px';

const StyledTooltipContainer = styled.div<Pick<TooltipProps, 'arrowAlignment'>>`
  display: flex;
  position: absolute;
  top: 0;
  right: ${spacing(-3)};
  height: ${sizing(3)};
`;

const StyledTooltip = styled.div<
  Pick<TooltipProps, 'arrowAlignment'> & {
    isOpen: boolean;
  }
>`
  background-color: ${colourDictionary.black};
  border-radius: 3px;
  color: ${colourDictionary.white};
  display: ${({ isOpen }) => (isOpen ? 'inline-flex' : 'none')};
  padding: ${spacing(1.5)};
  position: absolute;
  bottom: ${spacing(4)};

  &::after {
    border: ${sizing(arrowWidth)} solid transparent;
    border-top-color: ${colourDictionary.black};
    bottom: calc(-${spacing(arrowWidth * 2)} + ${offset});
    content: '';
    height: 0;
    position: absolute;
    width: 0;
  }

  ${({ arrowAlignment }) => {
    const middleCalc = tooltipWidth / 2 - arrowWidth;

    switch (arrowAlignment) {
      case 'left':
        return css`
          right: -${spacing(tooltipWidth - arrowWidth * 3)};
          &::after {
            left: calc(${spacing(1.5)} + ${offset});
          }
        `;
      case 'middle':
        return css`
          right: -${spacing(tooltipWidth / 2 - arrowWidth)};
          &::after {
            left: calc(${spacing(middleCalc)} + ${offset});
          }
        `;
      case 'right':
      default:
        return css`
          right: ${spacing(-1.5)};
          &::after {
            right: calc(${spacing(1.5)} - ${offset});
          }
        `;
    }
  }};
`;

const StyledTypography = styled(Typography)`
  padding-right: ${spacing(4)};
`;

const StyledCloseButton = styled(Button)`
  color: ${colourDictionary.white};
  margin: ${spacing(-0.5)};
`;

export const Tooltip = ({
  arrowAlignment = 'right',
  text,
  id,
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const tooltipRef = useOnOutsideClick<HTMLDivElement>({
    handler: () => setIsOpen(false),
    shouldEnableOutsideClick: isOpen,
  });

  return (
    <StyledTooltipContainer ref={tooltipRef} arrowAlignment={arrowAlignment}>
      <StyledTooltip arrowAlignment={arrowAlignment} isOpen={isOpen}>
        <StyledTypography
          as="p"
          variant="small"
          color={colourDictionary.white}
          id={`${id}-tooltip`}
        >
          {text}
        </StyledTypography>
        <StyledCloseButton onClick={() => setIsOpen(false)}>
          <Icon
            name="CloseSmall"
            widthDeprecated={28}
            role="img"
            aria-label="Close tooltip"
            color={colourDictionary.white}
          />
        </StyledCloseButton>
      </StyledTooltip>
      <Button onClick={() => setIsOpen(!isOpen)}>
        <Icon
          name="Information"
          widthDeprecated={20}
          role="img"
          aria-label="Open tooltip"
        />
      </Button>
    </StyledTooltipContainer>
  );
};

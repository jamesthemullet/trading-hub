import { type HTMLAttributes, forwardRef } from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { colourDictionary } from '../utils/constants';

import iconMapping from './svg-mapping.json';

export type SvgMapping = keyof typeof iconMapping;
export type SvgProps = HTMLAttributes<HTMLSpanElement> & {
  name: SvgMapping;
  color?: string;
  className?: string;
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  outerSvgSize?: number;
  innerSvgSize?: number;
} & (
    | {
        'aria-label'?: never;
        role?: never;
      }
    | {
        'aria-label': string;
        role: HTMLAttributes<Element>['role'];
      }
  );

const numberToStringPixel = (value: SvgProps['width'] | SvgProps['height']) =>
  typeof value === 'string' ? value : `${value}px`;

const StyledSvg = styled.span<SvgProps>`
  display: inline-block;
  flex-shrink: 0;
  ${({ name, color, innerSvgSize }) => {
    const { canBeColoured, url } = iconMapping[name];
    const iconUrl = `url('${url}?key=v3')`;
    return canBeColoured
      ? css`
          background: ${color ?? colourDictionary.black};
          mask-image: ${iconUrl};
          mask-size: ${innerSvgSize
            ? numberToStringPixel(innerSvgSize)
            : 'contain'};
          mask-position: center;
          mask-repeat: no-repeat;
        `
      : css`
          background-image: ${iconUrl};
          background-size: ${innerSvgSize
            ? numberToStringPixel(innerSvgSize)
            : 'contain'};
          background-position: center;
          background-repeat: no-repeat;
        `;
  }}
  ${({ width = 40, height = 40, outerSvgSize }) => {
    return css`
      height: ${numberToStringPixel(outerSvgSize || height)};
      width: ${numberToStringPixel(outerSvgSize || width)};
    `;
  }}
`;

export const RenderSvg = forwardRef<HTMLSpanElement, SvgProps>((props, ref) => {
  const { role = 'presentation', className, ...rest } = props;
  return (
    <StyledSvg
      ref={ref}
      className={className || ''}
      role={role}
      aria-label={rest['aria-label'] || ''}
      {...rest}
    />
  );
});

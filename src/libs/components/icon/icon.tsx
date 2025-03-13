import { forwardRef } from 'react';

import type { SvgProps } from '../svg/render-svg';
import { RenderSvg } from '../svg/render-svg';

export type IconSizes = 16 | 24 | 32 | 40 | 48 | 56 | 64 | 80;
export type IconProps = SvgProps & {
  width?: never;
  height?: never;
} & (
    | {
        size?: IconSizes;
        widthDeprecated?: never;
        shouldAddPadding?: boolean;
        shouldRemovePadding?: boolean;
      }
    | {
        size?: never;
        widthDeprecated?: number;
        shouldAddPadding?: never;
        shouldRemovePadding?: never;
      }
  );

const legacyPaddingMap: { [key: number]: number } = {
  16: 0,
  24: 6,
  32: 8,
  40: 10,
  48: 12,
  56: 16,
  64: 16,
  80: 20,
};
const iconPaddingMap: { [key: number]: number } = {
  16: 4,
  24: 8,
  32: 8,
  40: 16,
  48: 16,
  56: 16,
  64: 20,
  80: 24,
};

const chevronIcons = [
  'ChevronRightDefault',
  'ChevronLeftDefault',
  'ChevronUpDefault',
  'ChevronDownDefault',
  'ChevronRightInactive',
  'ChevronLeftInactive',
  'ChevronUpInactive',
  'ChevronDownInactive',
];

export const Icon = forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
  const {
    className,
    size = 40,
    widthDeprecated,
    shouldAddPadding,
    shouldRemovePadding,
    ...rest
  } = props;
  const isLegacyIcon = !shouldAddPadding && !shouldRemovePadding;
  const dimension = widthDeprecated || size;
  const legacyPadding = widthDeprecated ? 4 : legacyPaddingMap[size];
  const isNotChevron = !chevronIcons.some((iconName) =>
    rest.name.includes(iconName)
  );
  return (
    <RenderSvg
      ref={ref}
      className={`icon ${className || ''}`}
      outerSvgSize={
        shouldAddPadding ? dimension + iconPaddingMap[size] : dimension
      }
      innerSvgSize={
        isLegacyIcon && isNotChevron ? dimension - legacyPadding : dimension
      }
      {...rest}
    />
  );
});

Icon.displayName = 'Icon';

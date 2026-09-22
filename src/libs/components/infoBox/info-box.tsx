import type { ReactElement, ReactNode } from 'react';

import Image from 'next/image';

import { Typography } from '../typography/typography';
import styles from './info-box.module.css';

type Props = {
  text: string;
  title?: string;
  variant?: 'info' | 'error' | 'warning';
  shouldShowIcon?: boolean;
  width?: string;
  height?: string;
  children?: ReactNode;
};

export const InfoBox = ({
  text,
  title,
  variant = 'info',
  shouldShowIcon = true,
  width = '340px',
  height = '56px',
  children,
}: Props): ReactElement => {
  return (
    <div
      className={styles.infoBox}
      data-variant={variant}
      // eslint-disable-next-line react/forbid-dom-props
      style={
        {
          '--info-box-width': width,
          '--info-box-height': height,
        } as React.CSSProperties
      }
    >
      {shouldShowIcon && (
        <Image
          src="/trading-hub/asset/icon-info.svg"
          width={20}
          height={20}
          alt=""
          aria-hidden
        />
      )}
      <div className={styles.content}>
        {title && (
          <Typography
            variant={variant === 'error' ? 'bodyLarge' : 'labelLarge'}
          >
            {title}
          </Typography>
        )}
        <Typography
          variant={variant === 'error' ? 'bodyMedium' : 'labelMedium'}
        >
          {text}
        </Typography>
        {children}
      </div>
    </div>
  );
};

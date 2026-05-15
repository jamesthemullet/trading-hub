import type { ReactNode } from 'react';

import Image from 'next/image';

import { Typography } from '../typography/typography';
import styles from './info-box.module.css';

type Props = {
  text: string;
  title?: string;
  variant?: 'info' | 'error' | 'warning';
  showIcon?: boolean;
  width?: string;
  height?: string;
  children?: ReactNode;
};

export const InfoBox = ({
  text,
  title,
  variant = 'info',
  showIcon = true,
  width = '340px',
  height = '56px',
  children,
}: Props) => {
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
      {showIcon && (
        <Image
          src="/trading-hub/asset/icon-info.svg"
          width={20}
          height={20}
          alt=""
          aria-hidden
        />
      )}
      <div className={styles.content}>
        {title && <Typography variant="titleMedium">{title}</Typography>}
        <Typography variant="bodyMedium">{text}</Typography>
        {children}
      </div>
    </div>
  );
};

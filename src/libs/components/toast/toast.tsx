import { useEffect } from 'react';

import Image from 'next/image';

import { Button } from '../button/button';
import { Typography } from '../typography/typography';
import styles from './toast.module.css';

type Props = {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export const Toast = ({ message, onDismiss, autoDismissMs }: Props) => {
  useEffect(() => {
    if (autoDismissMs === undefined) {
      return undefined;
    }

    const timeoutId = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timeoutId);
  }, [autoDismissMs, onDismiss]);

  return (
    <div className={styles.toast} role="status">
      <Typography
        as="span"
        variant="bodyMedium"
        className={styles.toastMessage}
      >
        {message}
      </Typography>
      <Button
        type="button"
        appearance="plain"
        onClick={onDismiss}
        className={styles.dismissButton}
        aria-label="Dismiss notification"
      >
        <Image
          src="/trading-hub/asset/icon-close.svg"
          width={18}
          height={18}
          alt=""
        />
      </Button>
    </div>
  );
};

import type { ReactElement } from 'react';
import { useEffect, useRef } from 'react';

import Image from 'next/image';

import { Button } from '../button/button';
import { Typography } from '../typography/typography';
import styles from './toast.module.css';

type Props = {
  message: string;
  onDismiss: () => void;
  autoDismissMs?: number;
};

export const Toast = ({
  message,
  onDismiss,
  autoDismissMs,
}: Props): ReactElement => {
  // Keep the latest onDismiss without it being a timer dependency, so a new
  // callback identity from the parent (e.g. a re-render adding another toast)
  // doesn't reset this toast's countdown.
  const onDismissRef = useRef(onDismiss);
  // Only mutates the local ref; does not trigger a re-render.
  // eslint-disable-next-line functional/immutable-data
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (autoDismissMs === undefined) {
      return undefined;
    }

    const timeoutId = setTimeout(() => onDismissRef.current(), autoDismissMs);
    return () => clearTimeout(timeoutId);
  }, [autoDismissMs]);

  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
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

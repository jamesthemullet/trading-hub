import type { ReactElement } from 'react';
import { useState } from 'react';

import { Button, Typography } from '@/libs/components';

import Image from 'next/image';

import styles from './copy-message-box.module.css';

// temp fix as new icon is not loaded from public folder for some reason - to be replaced with direct import when issue is resolved
const CopyIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M16.5 1H4.5C3.4 1 2.5 1.9 2.5 3V17H4.5V3H16.5V1ZM19.5 5H8.5C7.4 5 6.5 5.9 6.5 7V21C6.5 22.1 7.4 23 8.5 23H19.5C20.6 23 21.5 22.1 21.5 21V7C21.5 5.9 20.6 5 19.5 5ZM19.5 21H8.5V7H19.5V21Z"
      fill="#005640"
    />
  </svg>
);

export const CopyMessageBox = ({
  message,
  isMultiline = false,
}: {
  message: string;
  isMultiline?: boolean;
}): ReactElement => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(message);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={styles.copyMessageBox}>
      <Typography variant="bodyMedium">Copy this message below:</Typography>
      <div className={styles.copyInputRow}>
        {isMultiline ? (
          <pre className={styles.copyTextarea}>{message}</pre>
        ) : (
          <input
            type="text"
            readOnly
            value={message}
            className={styles.copyInput}
            aria-label="Copy message"
          />
        )}
        <Button
          type="button"
          appearance="plain"
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label={isCopied ? 'Copied' : 'Copy to clipboard'}
        >
          {isCopied ? (
            <Image
              src="/trading-hub/asset/icon-tick-in-circle-success.svg"
              width={24}
              height={24}
              alt="Copied"
            />
          ) : (
            <CopyIcon />
          )}
        </Button>
      </div>
    </div>
  );
};

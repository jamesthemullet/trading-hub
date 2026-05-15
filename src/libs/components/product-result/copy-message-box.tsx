import { useState } from 'react';

import { Button, Typography } from '@/libs/components';

import Image from 'next/image';

import styles from './product-result.module.css';

export const CopyMessageBox = ({ message }: { message: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.copyMessageBox}>
      <Typography variant="bodyMedium">Copy this message below:</Typography>
      <div className={styles.copyInputRow}>
        <input
          type="text"
          readOnly
          value={message}
          className={styles.copyInput}
          aria-label="Copy message"
        />
        <Button
          type="button"
          appearance="plain"
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
        >
          <Image
            src={
              copied
                ? '/trading-hub/asset/icon-tick-in-circle-success.svg'
                : '/trading-hub/asset/icon-copy.svg'
            }
            width={24}
            height={24}
            alt=""
          />
        </Button>
      </div>
    </div>
  );
};

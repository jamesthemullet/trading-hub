import type { ReactElement } from 'react';

import { Button } from '@/libs/components/button/button';
import { ADMIN_TEAMS_URL } from '@/libs/constants/admin-contact';

import Image from 'next/image';

import styles from './read-only-banner.module.css';
import { useReadOnlyBannerDismissal } from './use-read-only-banner-dismissal';

export const ReadOnlyBanner = ({
  requiredWriteRole,
}: {
  requiredWriteRole: string;
}): ReactElement | null => {
  const { isDismissed, dismiss } =
    useReadOnlyBannerDismissal(requiredWriteRole);

  if (isDismissed) {
    return null;
  }

  return (
    <div
      className={styles.banner}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span>
        You&apos;re viewing this page in read-only mode.{' '}
        <a href={ADMIN_TEAMS_URL}>Contact admin on our Teams channel</a> to
        request the &quot;{requiredWriteRole}&quot; role for write access.
      </span>
      <Button
        appearance="plain"
        aria-label="Dismiss read-only notice"
        onClick={dismiss}
      >
        <Image
          src="/trading-hub/asset/icon-close-black.svg"
          width={18}
          height={18}
          alt=""
        />
      </Button>
    </div>
  );
};

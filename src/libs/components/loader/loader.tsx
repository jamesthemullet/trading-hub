import type { ReactElement } from 'react';

import Image from 'next/image';

import styles from './loader.module.css';

export const Loader = ({
  isInModal = false,
}: {
  isInModal?: boolean;
}): ReactElement => (
  <div
    className={`${styles.wrapper} ${isInModal ? styles.inModal : ''}`}
    role="status"
    aria-label="loading content"
    aria-live="polite"
    aria-busy="true"
  >
    <div className={styles.animatedLoader}>
      <Image
        src="https://static.marksandspencer.com/icons/svgs/Loader.svg"
        alt=""
        width={64}
        height={64}
      />
    </div>
  </div>
);

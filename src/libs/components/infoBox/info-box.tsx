import Image from 'next/image';

import styles from './info-box.module.css';

export const InfoBox = ({ text }: { text: string }) => {
  return (
    <div className={styles.infoBox}>
      <Image
        src="/trading-hub/asset/icon-info.svg"
        width={20}
        height={20}
        alt="IE flag"
      />
      <p className={styles.infoBoxText}>{text}</p>
    </div>
  );
};

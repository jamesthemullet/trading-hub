/* istanbul ignore file */

import { Typography } from '@/libs/components';

import styles from './index.module.css';

const ProductDiscovery = () => {
  return (
    <div className={styles.wrapper}>
      <Typography as="h1" variant="headlineMedium" isStrong>
        Product Discovery
      </Typography>
    </div>
  );
};

export default ProductDiscovery;

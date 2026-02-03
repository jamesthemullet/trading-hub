/* istanbul ignore file */
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { ArrowButton } from '@/libs/components/arrow-button/arrow-button';

import styles from './index.module.css';

const Sandbox = ({ nodeVersion }: { nodeVersion: string }) => {
  return (
    <>
      <h1>Sandbox examples</h1>
      <div className={styles.example}>
        <h3>Running on Node version {nodeVersion}</h3>
      </div>
      <div className={styles.example}>
        <h2>Arrow Button</h2>
        <ArrowButton direction="up" />
        <ArrowButton direction="down" />
        <ArrowButton isDisabled />
      </div>
      <div className={styles.example}>
        <h2>New arrow icons</h2>
        <img src="/trading-hub/asset/icon-boost-button.svg" alt="" />
        <img src="/trading-hub/asset/icon-bury-button.svg" alt="" />
      </div>
    </>
  );
};

export const getServerSideProps = () => {
  return {
    props: {
      nodeVersion: process.version,
    },
  };
};

export default Sandbox;

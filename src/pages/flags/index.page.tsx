/* istanbul ignore file */

import { useCookies } from 'react-cookie';

import { Toggle, Typography } from '@/libs/components';

import dynamic from 'next/dynamic';

import styles from './index.module.css';

const FeatureFlags = () => {
  const [cookies, setCookie] = useCookies(
    ['flagProfilePage', 'flagFavouriteRulesets'],
    {
      doNotUpdate: true,
    }
  );

  const { flagProfilePage, flagFavouriteRulesets } = cookies;

  return (
    <div className={styles.wrapper}>
      <Typography as="h1" variant="headlineMedium" isStrong>
        Feature Flags
      </Typography>
      <div className={styles.flag}>
        <Typography>Profile Page:&nbsp;</Typography>
        <Toggle
          aria-label="Toggle profile page feature flag"
          checked={flagProfilePage}
          onChange={() => {
            setCookie('flagProfilePage', JSON.stringify(!flagProfilePage));
          }}
        />
      </div>
      <div className={styles.flag}>
        <Typography>Favourite Rulesets:&nbsp;</Typography>
        <Toggle
          aria-label="Toggle favourite rulesets feature flag"
          checked={flagFavouriteRulesets}
          onChange={() => {
            setCookie(
              'flagFavouriteRulesets',
              JSON.stringify(!flagFavouriteRulesets)
            );
          }}
        />
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(FeatureFlags), {
  ssr: false,
});

export { getServerSideProps } from './flags-access';

/* istanbul ignore file */

import { useCookies } from 'react-cookie';
import { Select, Stack } from '@mantine/core';

import { Toggle, Typography } from '@/libs/components';

import dynamic from 'next/dynamic';

import styles from './index.module.css';

const FeatureFlags = () => {
  const [cookies, setCookie] = useCookies(
    [
      'flagAuthorization',
      'flagAuthorizationRoleOverride',
      'flagStickyBar',
      'flagStickyBarVariant',
      'flagProfilePage',
    ],
    {
      doNotUpdate: true,
    }
  );

  const { flagAuthorization, flagStickyBar, flagProfilePage } = cookies;

  return (
    <div className={styles.wrapper}>
      <Typography as="h1" variant="headlineMedium" isStrong>
        Feature Flags
      </Typography>
      <div className={styles.flag}>
        <Typography>Authorization:&nbsp;</Typography>
        <Toggle
          checked={flagAuthorization}
          aria-label="Authorization"
          onChange={() => {
            setCookie('flagAuthorization', JSON.stringify(!flagAuthorization));
          }}
        />
      </div>
      {cookies.flagAuthorization && (
        <Stack w={400}>
          <Select
            label="Category ranking role override (this will not modify the access token!)"
            data={[
              { value: 'No Override', label: 'No Override' },
              { value: '', label: '<empty>' },
              { value: 'Cat.R', label: 'Cat.R' },
              { value: 'Cat.W', label: 'Cat.W' },
            ]}
            value={cookies.flagAuthorizationRoleOverride?.catOverride}
            onChange={(value) => {
              setCookie(
                'flagAuthorizationRoleOverride',
                JSON.stringify({
                  ...cookies.flagAuthorizationRoleOverride,
                  catOverride: value,
                })
              );
            }}
          />
          <Select
            label="Search ranking role override"
            data={[
              { value: 'No Override', label: 'No Override' },
              { value: '', label: '<empty>' },
              { value: 'Search.R', label: 'Search.R' },
              { value: 'Search.W', label: 'Search.W' },
            ]}
            value={cookies.flagAuthorizationRoleOverride?.searchOverride}
            onChange={(value) => {
              setCookie(
                'flagAuthorizationRoleOverride',
                JSON.stringify({
                  ...cookies.flagAuthorizationRoleOverride,
                  searchOverride: value,
                })
              );
            }}
          />
          <Select
            label="Global ranking role override"
            data={[
              { value: 'No Override', label: 'No Override' },
              { value: '', label: '<empty>' },
              { value: 'Glob.R', label: 'Glob.R' },
              { value: 'Glob.W', label: 'Glob.W' },
            ]}
            value={cookies.flagAuthorizationRoleOverride?.globalOverride}
            onChange={(value) => {
              setCookie(
                'flagAuthorizationRoleOverride',
                JSON.stringify({
                  ...cookies.flagAuthorizationRoleOverride,
                  globalOverride: value,
                })
              );
            }}
          />
        </Stack>
      )}
      <div className={styles.flag}>
        <Typography>Sticky Bar:&nbsp;</Typography>
        <Toggle
          checked={flagStickyBar}
          aria-label="Sticky Bar"
          onChange={() => {
            setCookie('flagStickyBar', JSON.stringify(!flagStickyBar));
          }}
        />
      </div>
      {cookies.flagStickyBar && (
        <Stack w={400}>
          <Select
            label="Sticky bar variant"
            data={[
              { value: 'variant-a', label: 'Variant A' },
              { value: 'variant-b', label: 'Variant B' },
            ]}
            value={cookies.flagStickyBarVariant ?? 'variant-a'}
            onChange={(value) => {
              setCookie(
                'flagStickyBarVariant',
                JSON.stringify(value ?? 'variant-a')
              );
            }}
          />
        </Stack>
      )}
      <div className={styles.flag}>
        <Typography>Profile Page:&nbsp;</Typography>
        <Toggle
          checked={flagProfilePage}
          aria-label="Profile Page"
          onChange={() => {
            setCookie('flagProfilePage', JSON.stringify(!flagProfilePage));
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

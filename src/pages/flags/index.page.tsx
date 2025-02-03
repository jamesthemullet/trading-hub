/* istanbul ignore file */

import styled from '@emotion/styled';
import { useCookies } from 'react-cookie';
import { Select, Space, Stack } from '@mantine/core';

import { spacing, Toggle } from '@/libs/components';

import dynamic from 'next/dynamic';

const Wrapper = styled.div`
  padding: ${spacing(2)};

  h1 {
    margin-bottom: ${spacing(2)};
  }
`;

const Flag = styled.div`
  display: flex;
  margin-bottom: ${spacing(2)};
  align-items: center;
`;

const FeatureFlags = () => {
  const [cookies, setCookie] = useCookies(
    ['flagAuthorization', 'flagAuthorizationRoleOverride', 'flagBulkActions'],
    {
      doNotUpdate: true,
    }
  );

  const { flagAuthorization, flagBulkActions } = cookies;

  return (
    <Wrapper>
      <h1>Feature Flags</h1>
      <Flag>
        <p>Authorization:&nbsp;</p>
        <Toggle
          checked={flagAuthorization}
          onChange={() => {
            setCookie('flagAuthorization', JSON.stringify(!flagAuthorization));
          }}
        />
      </Flag>
      <Flag>
        <p>Bulk actions:&nbsp;</p>
        <Toggle
          checked={flagBulkActions}
          onChange={() => {
            setCookie('flagBulkActions', JSON.stringify(!flagBulkActions));
          }}
        />
      </Flag>
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
      <Space h={40} />
      <p>
        See changes in{' '}
        <a href="https://github.com/DigitalInnovation/trading-hub/pull/947">
          github.com/DigitalInnovation/trading-hub/issues/947
        </a>{' '}
        to add a feature flag
      </p>
    </Wrapper>
  );
};

export default dynamic(() => Promise.resolve(FeatureFlags), {
  ssr: false,
});

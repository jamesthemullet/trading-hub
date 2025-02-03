/* istanbul ignore file */

import styled from '@emotion/styled';
import { useCookies } from 'react-cookie';

import { spacing, Toggle } from '@/libs/components';

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
  const [cookies, setCookie] = useCookies([
    'flagAuthorization',
    'flagBulkActions',
  ]);

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
    </Wrapper>
  );
};

export default FeatureFlags;

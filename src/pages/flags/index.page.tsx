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
  const [cookies, setCookie] = useCookies(['flagAuthorization']);

  return (
    <Wrapper>
      <h1>Feature Flags</h1>
      <Flag>
        <p>Authorization:&nbsp;</p>
        <Toggle
          checked={cookies.flagAuthorization}
          onChange={() => {
            setCookie(
              'flagAuthorization',
              JSON.stringify(!cookies.flagAuthorization)
            );
          }}
        />
      </Flag>
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

export default FeatureFlags;

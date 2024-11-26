/* istanbul ignore file */

import styled from '@emotion/styled';

import { spacing } from '@/libs/components';

const Wrapper = styled.div`
  padding: ${spacing(2)};

  h1 {
    margin-bottom: ${spacing(2)};
  }
`;

const FeatureFlags = () => {
  return (
    <Wrapper>
      <h1>Feature Flags</h1>
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

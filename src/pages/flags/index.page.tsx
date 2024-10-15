/* istanbul ignore file */

import styled from '@emotion/styled';
import { useCookies } from 'react-cookie';

import { spacing, Toggle } from '@/libs/components';

const Wrapper = styled.div`
  padding: ${spacing(2)};
`;
const Flag = styled.div`
  display: flex;
`;

const FeatureFlags = () => {
  const [cookies, setCookie] = useCookies(['flagScheduling']);

  return (
    <Wrapper>
      <h1>Feature Flags</h1>

      <Flag>
        <div>Scheduling:&nbsp;</div>
        <Toggle
          checked={cookies.flagScheduling}
          onChange={() => {
            setCookie(
              'flagScheduling',
              JSON.stringify(!cookies.flagScheduling)
            );
          }}
        />
      </Flag>
    </Wrapper>
  );
};

export default FeatureFlags;

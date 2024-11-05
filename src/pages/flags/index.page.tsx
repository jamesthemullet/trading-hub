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
    'flagIreland',
    'flagMultipleCategories',
  ]);

  return (
    <Wrapper>
      <h1>Feature Flags</h1>

      <Flag>
        <p>Ireland:&nbsp;</p>
        <Toggle
          checked={cookies.flagIreland}
          onChange={() => {
            setCookie('flagIreland', JSON.stringify(!cookies.flagIreland));
          }}
        />
      </Flag>

      <Flag>
        <p>Multiple categories:&nbsp;</p>
        <Toggle
          checked={cookies.flagMultipleCategories}
          onChange={() => {
            setCookie(
              'flagMultipleCategories',
              JSON.stringify(!cookies.flagMultipleCategories)
            );
          }}
        />
      </Flag>
    </Wrapper>
  );
};

export default FeatureFlags;

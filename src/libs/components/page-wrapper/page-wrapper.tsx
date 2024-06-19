import styled from '@emotion/styled';

import { spacing } from '../utils/spacing';

const PageWrapperStyles = styled.div`
  box-shadow: rgb(0 0 0 / 10%) 0 0 5px 2px;
  margin: ${spacing(2)};
  padding: ${spacing(1.5)} ${spacing(2)} ${spacing(2)};
  border-radius: 4px;
`;

export const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <PageWrapperStyles>{children}</PageWrapperStyles>
);

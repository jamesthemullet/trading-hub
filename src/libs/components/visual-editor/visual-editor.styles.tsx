import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';

export const Layout = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: ${spacing(2)} 0;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(2)};
`;

export const ProductBox = styled.div`
  width: 240px;
  margin: ${spacing(1)};
`;

import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { mediaQuery } from '../utils/media-query';

export const Layout = styled.div`
  max-width: 1024px;
  margin: 0 auto;
  padding: ${spacing(2)} 0;
  display: flex;
  flex-wrap: wrap;
`;

export const ProductBox = styled.div`
  max-width: 235px;
  width: 50%;
  margin: ${spacing(1)};

  ${mediaQuery('lg')} {
    width: 25%;
  }
`;

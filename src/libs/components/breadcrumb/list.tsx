import { css } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

type ListProps = {
  as?: 'ul' | 'ol';
  isUnstyled?: boolean;
  isHorizontal?: true;
  children: ReactNode | ReactNode[];
};

export const List = styled.ul<ListProps>`
  margin: 0;
  padding: 0;
  ${({ isUnstyled, as }) =>
    isUnstyled
      ? css`
          list-style: none;
          > li {
            margin-bottom: 0;
          }
        `
      : css`
          list-style: ${as === 'ol' ? 'decimal' : 'disc'};
        `};
  ${({ isHorizontal }) =>
    isHorizontal &&
    css`
      display: flex;
    `}
`;

import styled from '@emotion/styled';

import { spacing } from '../utils/spacing';

export const ModalAttributesTable = styled.div`
  display: flex;
  flex-direction: column;

  > div > div:first-of-type {
    flex: 2;
  }
`;

export const HeadingAndCloseButton = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing(3)};

  h3 {
    font-size: 1.25em;
  }

  button {
    background: none;
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
    display: flex;
    padding: 0;
    border: none;

    &:hover {
      background: none;
    }
  }
`;

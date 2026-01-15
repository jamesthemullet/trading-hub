import styled from '@emotion/styled';

export const Content = styled.div<{ isDisabled: boolean }>`
  display: flex;
  flex-direction: column;

  ${({ isDisabled }) =>
    isDisabled
      ? `
        pointer-events: none;
        opacity: 0.5;
      `
      : ''}
`;

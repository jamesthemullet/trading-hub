import styled from '@emotion/styled';

import Image from 'next/image';

const Wrapper = styled.div<{ isInModal?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 12;

  ${({ isInModal }) =>
    isInModal
      ? `
      top: 50%;
      position: absolute;
      left: 0%;
      width: 100%;
  `
      : `
    width: 100vw;
    height: 100vh;
    top: 0;
    position: fixed;
    left: 91px;
    background: #ffffff70;
  `}
`;

const AnimatedLoader = styled.div`
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }

  animation: spin 1s linear infinite;
  display: inline-flex;
`;

export const Loader = ({ isInModal = false }: { isInModal?: boolean }) => (
  <Wrapper isInModal={isInModal}>
    <AnimatedLoader aria-label="loading content">
      <Image
        src="https://static.marksandspencer.com/icons/svgs/Loader.svg"
        alt="loader"
        width={64}
        height={64}
      />
    </AnimatedLoader>
  </Wrapper>
);

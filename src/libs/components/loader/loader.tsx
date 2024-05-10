import styled from '@emotion/styled';
import { Icon } from '../icon/icon';

const Wrapper = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff70;
  z-index: 12;
  top: 0;
  left: 64px;
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

export const Loader = () => (
  <Wrapper>
    <AnimatedLoader>
      <Icon name="Loader" size={64} />
    </AnimatedLoader>
  </Wrapper>
);

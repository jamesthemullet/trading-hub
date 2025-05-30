/* istanbul ignore file */
import '@mantine/core/styles.css';
import '@mantine/core/styles/baseline.css';
import '@mantine/core/styles/default-css-variables.css';
import '@mantine/core/styles/global.css';
import '@mantine/dates/styles.css';

import styled from '@emotion/styled';
import { ArrowButton } from '../../libs/components/buttons/button/arrow-button';

const Example = styled.div`
  padding: 20px;
`;

const Sandbox = ({ nodeVersion }: { nodeVersion: string }) => {
  return (
    <>
      <h1>Sandbox examples</h1>
      <Example>
        <h3>Running on Node version {nodeVersion}</h3>
      </Example>
      <Example>
        <h2>Arrow Button</h2>
        <ArrowButton direction="up" />
        <ArrowButton direction="down" />
        <ArrowButton isDisabled />
      </Example>
      <Example>
        <h2>New arrow icons</h2>
        <img src="/trading-hub/asset/icon-boost-button.svg" alt="" />
        <img src="/trading-hub/asset/icon-bury-button.svg" alt="" />
      </Example>
    </>
  );
};

export const getServerSideProps = () => {
  return {
    props: {
      nodeVersion: process.version,
    },
  };
};

export default Sandbox;

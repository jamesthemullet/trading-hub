import { MantineProvider, createTheme } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import '@mantine/core/styles.css';

const theme = createTheme({});

const Sandbox = () => {
  return (
    <div>
      <h1>Sandbox</h1>
      <h2>Calendar Component</h2>
      <MantineProvider theme={theme}>
        <Calendar></Calendar>
      </MantineProvider>
    </div>
  );
};

export const getServerSideProps = () => {
  return {
    props: {},
  };
};

export default Sandbox;

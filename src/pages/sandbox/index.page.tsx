import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import styled from '@emotion/styled';
import { ExampleCalendarDropdown } from './example-calendar-dropdown';
import { ExampleCalendarModal } from './example-calendar-modal';

const Example = styled.div`
  padding: 20px;
`;

const Sandbox = () => {
  return (
    <div>
      <h1>Sandbox</h1>
      <Example>
        <h2>Calendar Component(Dropdown)</h2>
        <ExampleCalendarDropdown />
      </Example>
      <Example>
        <h2>Calendar Component(Modal)</h2>
        <ExampleCalendarModal />
      </Example>
    </div>
  );
};

export const getServerSideProps = () => {
  return {
    props: {},
  };
};

export default Sandbox;

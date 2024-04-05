import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import styled from '@emotion/styled';
import { ExampleCalendarDropdown } from './example-calendar-dropdown';
import { ExampleCalendarModal } from './example-calendar-modal';
import { ArrowButton } from '../../libs/components/buttons/button/arrow-button';

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
      <Example>
        <h2>Arrow Button</h2>
        <ArrowButton direction="up"></ArrowButton>
        <ArrowButton direction="down"></ArrowButton>
        <ArrowButton isDisabled></ArrowButton>
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

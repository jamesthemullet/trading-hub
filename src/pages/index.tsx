import React from 'react';
import styled from '@emotion/styled';

const Heading = styled.h1`
  color: purple;
`;

export default function Home() {
  return (
    <>
      <Heading>Test styled components</Heading>
      <p>Test Version 6</p>
    </>
  );
}

/* istanbul ignore file */

import styled from '@emotion/styled';
import { Header1, Header2, Header3, Text, Title } from '@/libs/components';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 100px;
`;

const Guide = styled.div`
  width: 33%;
  margin: 0 0 16px;
`;

const StyleGuide = () => {
  return (
    <Container>
      <Header1 style={{ width: '100%', marginBottom: '8px' }}>
        Styleguide
      </Header1>
      <Guide>
        <Header1>Header1</Header1>
        <Text>New MS London</Text>
        <Text>Size: 35px</Text>
        <Text>Type: Bold</Text>
        <Text>&lt;Header1 /&gt;</Text>
      </Guide>
      <Guide>
        <Header2>Header2</Header2>
        <Text>New MS London</Text>
        <Text>Size: 25px</Text>
        <Text>Type: Bold</Text>
        <Text>&lt;Header2 /&gt;</Text>
      </Guide>
      <Guide>
        <Header3>Header3</Header3>
        <Text>New MS London</Text>
        <Text>Size: 20px</Text>
        <Text>Type: Bold</Text>
        <Text>&lt;Header3 /&gt;</Text>
      </Guide>
      <Guide>
        <Title>Title</Title>
        <Text>New MS London</Text>
        <Text>Size: 14px</Text>
        <Text>Type: Bold</Text>
        <Text>&lt;Title /&gt;</Text>
      </Guide>
      <Guide>
        <Text>Text</Text>
        <Text>New MS London</Text>
        <Text>Size: 14px</Text>
        <Text>Type: Regular</Text>
        <Text>&lt;Text /&gt;</Text>
      </Guide>
    </Container>
  );
};

export default StyleGuide;

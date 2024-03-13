/* istanbul ignore file */

import styled from '@emotion/styled';
import { Header1, Header2, Header3, Text, Title } from '@/libs/components';
import { color } from '../../../libs/components/utils/constants';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 100px;
`;

const Guide = styled.div`
  width: 33%;
  margin: 0 0 16px;
`;

const Colour = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: block;
`;

const StyleGuide = () => {
  return (
    <Container>
      <Header1 style={{ width: '100%', marginBottom: '8px' }}>
        Styleguide
      </Header1>
      <Header2 style={{ width: '100%', marginBottom: '8px' }}>Headings</Header2>
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

      <Header2 style={{ width: '100%', marginBottom: '8px' }}>Colours</Header2>
      <Guide>
        <Colour style={{ backgroundColor: color.backgroundGrey }} />
        <Text>color.backgroundGrey</Text>
        <Text>{color.backgroundGrey}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.backgroundPink }} />
        <Text>color.backgroundPink</Text>
        <Text>{color.backgroundPink}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.buttonPrimaryHover }} />
        <Text>color.buttonPrimaryHover</Text>
        <Text>{color.buttonPrimaryHover}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.darkHeritageGreen }} />
        <Text>color.darkHeritageGreen</Text>
        <Text>{color.darkHeritageGreen}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.errorRed }} />
        <Text>color.errorRed</Text>
        <Text>{color.errorRed}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.errorRedBackground }} />
        <Text>color.errorRedBackground</Text>
        <Text>{color.errorRedBackground}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.grey }} />
        <Text>color.grey</Text>
        <Text>{color.grey}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.improvedFit }} />
        <Text>color.improvedFit</Text>
        <Text>{color.improvedFit}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.infoBlueBackground }} />
        <Text>color.infoBlueBackground</Text>
        <Text>{color.infoBlueBackground}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.lightGreen }} />
        <Text>color.lightGreen</Text>
        <Text>{color.lightGreen}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.lightGrey }} />
        <Text>color.lightGrey</Text>
        <Text>{color.lightGrey}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.primaryGreen }} />
        <Text>color.primaryGreen</Text>
        <Text>{color.primaryGreen}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.selectionBox }} />
        <Text>color.selectionBox</Text>
        <Text>{color.selectionBox}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.successGreen }} />
        <Text>color.successGreen</Text>
        <Text>{color.successGreen}</Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.successGreenBackground }} />
        <Text>color.successGreenBackground</Text>
        <Text>{color.successGreenBackground}</Text>
      </Guide>
    </Container>
  );
};

export default StyleGuide;

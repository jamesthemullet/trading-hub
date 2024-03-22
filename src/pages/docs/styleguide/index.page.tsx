/* istanbul ignore file */

import styled from '@emotion/styled';
import { color } from '../../../libs/components/utils/constants';
import {
  Button,
  Header1,
  Header2,
  Header3,
  Label,
  Text,
  Title,
} from '@/libs/components';

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
        <Text>
          <code>&lt;Header1 /&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <Header2>Header2</Header2>
        <Text>New MS London</Text>
        <Text>Size: 25px</Text>
        <Text>Type: Bold</Text>
        <Text>
          <code>&lt;Header2 /&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <Header3>Header3</Header3>
        <Text>New MS London</Text>
        <Text>Size: 20px</Text>
        <Text>Type: Bold</Text>
        <Text>
          <code>&lt;Header3 /&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <Title>Title</Title>
        <Text>New MS London</Text>
        <Text>Size: 14px</Text>
        <Text>Type: Bold</Text>
        <Text>
          <code>&lt;Title /&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <Text>Text</Text>
        <Text>New MS London</Text>
        <Text>Size: 14px</Text>
        <Text>Type: Regular</Text>
        <Text>
          <code>&lt;Text /&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <Label>Label</Label>
        <Text>New MS London</Text>
        <Text>Size: 16px</Text>
        <Text>Type: Regular</Text>
        <Text>
          <code>&lt;Label /&gt;</code>
        </Text>
      </Guide>

      <Header2 style={{ width: '100%', marginBottom: '8px' }}>Buttons</Header2>
      <Guide>
        <div style={{ width: '60%' }}>
          <Button isPrimary>Button</Button>
        </div>
        <Text>Primary</Text>
        <Text>
          <code>&lt;Button isPrimary&gt;Button&lt;/Button&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <div style={{ width: '60%' }}>
          <Button>Button</Button>
        </div>
        <Text>Secondary</Text>
        <Text>
          <code>&lt;Button&gt;Button&lt;/Button&gt;</code>
        </Text>
      </Guide>
      <Guide>
        <div style={{ width: '60%' }}>
          <Button isDisabled>Button</Button>
        </div>
        <Text>Inactive</Text>
        <Text>
          <code>&lt;Button isDisabled&gt;Button&lt;/Button&gt;</code>
        </Text>
      </Guide>

      <Header2 style={{ width: '100%', marginBottom: '8px' }}>Colours</Header2>
      <Guide>
        <Colour style={{ backgroundColor: color.backgroundGrey }} />
        <Text>color.backgroundGrey</Text>
        <Text>
          <code>{color.backgroundGrey}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.backgroundPink }} />
        <Text>color.backgroundPink</Text>
        <Text>
          <code>{color.backgroundPink}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.buttonPrimaryHover }} />
        <Text>color.buttonPrimaryHover</Text>
        <Text>
          <code>{color.buttonPrimaryHover}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.darkHeritageGreen }} />
        <Text>color.darkHeritageGreen</Text>
        <Text>
          <code>{color.darkHeritageGreen}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.errorRed }} />
        <Text>color.errorRed</Text>
        <Text>
          <code>{color.errorRed}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.errorRedBackground }} />
        <Text>color.errorRedBackground</Text>
        <Text>
          <code>{color.errorRedBackground}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.grey }} />
        <Text>color.grey</Text>
        <Text>
          <code>{color.grey}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.improvedFit }} />
        <Text>color.improvedFit</Text>
        <Text>
          <code>{color.improvedFit}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.infoBlueBackground }} />
        <Text>color.infoBlueBackground</Text>
        <Text>
          <code>{color.infoBlueBackground}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.lightGreen }} />
        <Text>color.lightGreen</Text>
        <Text>
          <code>{color.lightGreen}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.lightGrey }} />
        <Text>color.lightGrey</Text>
        <Text>
          <code>{color.lightGrey}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.primaryGreen }} />
        <Text>color.primaryGreen</Text>
        <Text>
          <code>{color.primaryGreen}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.selectionBox }} />
        <Text>color.selectionBox</Text>
        <Text>
          <code>{color.selectionBox}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.successGreen }} />
        <Text>color.successGreen</Text>
        <Text>
          <code>{color.successGreen}</code>
        </Text>
      </Guide>
      <Guide>
        <Colour style={{ backgroundColor: color.successGreenBackground }} />
        <Text>color.successGreenBackground</Text>
        <Text>
          <code>{color.successGreenBackground}</code>
        </Text>
      </Guide>
    </Container>
  );
};

export default StyleGuide;

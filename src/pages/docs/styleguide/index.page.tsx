/* istanbul ignore file */

import styled from '@emotion/styled';

import {
  Button,
  Header1,
  Header2,
  Header3,
  Label,
  Text,
  Title,
} from '@/libs/components';

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
        Style guide
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
        <Text isStrong>Text</Text>
        <Text>New MS London</Text>
        <Text>Size: 14px</Text>
        <Text>Type: Regular</Text>
        <Text>
          <code>&lt;Text isStrong /&gt;</code>
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
      <Guide>
        <Label isStrong>Label</Label>
        <Text>New MS London</Text>
        <Text>Size: 16px</Text>
        <Text>Type: Bold</Text>
        <Text>
          <code>&lt;Label isStrong /&gt;</code>
        </Text>
      </Guide>

      <Header2 style={{ width: '100%', marginBottom: '8px' }}>Buttons</Header2>
      <Guide>
        <div style={{ width: '60%' }}>
          <Button isPrimary>Button</Button>
        </div>
        <Text>Primary</Text>
        <Text>
          <code>
            &lt;Button theme=&quot;primary&quot; &gt;Button&lt;/Button&gt;
          </code>
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
      <Guide>
        <div style={{ width: '60%' }}>
          <Button theme="tertiary">Button</Button>
        </div>
        <Text>Tertiary</Text>
        <Text>
          <code>
            &lt;Button theme=&quot;tertiary&quot; &gt;Button&lt;/Button&gt;
          </code>
        </Text>
      </Guide>
      <Guide>
        <div style={{ width: '60%' }}>
          <Button theme="tertiary" isDisabled>
            Button
          </Button>
        </div>
        <Text>Tertiary Inactive</Text>
        <Text>
          <code>
            &lt;Button theme=&quot;tertiary&quot;
            isDisabled&gt;Button&lt;/Button&gt;
          </code>
        </Text>
      </Guide>
      <Guide />
      <Guide>
        <div style={{ width: '60%' }}>
          <Button theme="filled" isInline>
            Button
          </Button>
        </div>
        <Text>Filled</Text>
        <Text>
          <code>
            &lt;Button theme=&quot;filled&quot;
            isInline&gt;Button&lt;/Button&gt;
          </code>
        </Text>
      </Guide>
      <Guide>
        <div style={{ width: '60%' }}>
          <Button theme="outlined" isInline>
            Button
          </Button>
        </div>
        <Text>Outlined</Text>
        <Text>
          <code>
            &lt;Button theme=&quot;outlined&quot;
            isInline&gt;Button&lt;/Button&gt;
          </code>
        </Text>
      </Guide>

      <Header2 style={{ width: '100%', marginBottom: '8px' }}>Colours</Header2>
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
        <Colour style={{ backgroundColor: color.selectionBox }} />
        <Text>color.selectionBox</Text>
        <Text>
          <code>{color.selectionBox}</code>
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

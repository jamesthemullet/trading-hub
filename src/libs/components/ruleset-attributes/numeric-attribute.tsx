import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { color } from '../utils/constants';
import { Label, Text } from '../typography/typography.styles';

const AttributeWrapper = styled.div`
  border: solid 1px #000;
`;

const AttributeHeading = styled.div`
  padding: ${spacing(1)};
  background: #fff;
`;

const AttributeRow = styled.div`
  padding: ${spacing(1)};
  border-top: solid 1px #000;
  background-color: ${color.backgroundGrey};
`;

export const NumericAttribute = ({
  name,
  operation,
  weight = 1.0,
}: {
  name: string;
  operation: 'bury' | 'boost';
  weight?: number;
}) => (
  <AttributeWrapper aria-label="Selected Attribute">
    <AttributeHeading>
      <Label isStrong>{name}</Label>
    </AttributeHeading>
    <AttributeRow>
      <Text>
        Operation{' '}
        <img
          src={`/trading-hub/asset/${operation}.svg`}
          style={{ marginBottom: '-4px' }}
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeRow>
      <Text>Strength {(weight * 100).toFixed(1)}%</Text>
    </AttributeRow>
  </AttributeWrapper>
);

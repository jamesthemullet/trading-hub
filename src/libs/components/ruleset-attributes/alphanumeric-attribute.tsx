import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { color } from '../utils/constants';
import { Text } from '../typography/typography.styles';

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

const AttributeValue = styled.label`
  background-color: #e0e4e7;
  border-radius: 5px;
  padding: ${spacing(1)};
  margin: ${spacing(1)};
  display: inline-block;
`;

export const AlphanumericAttribute = ({
  values,
  operation,
  weight = 1.0,
}: {
  values: string[];
  operation: 'bury' | 'boost';
  weight?: number;
}) => (
  <AttributeWrapper aria-label="Selected Attribute">
    <AttributeHeading>
      {values.map((value) => (
        <AttributeValue key={value}>{value}</AttributeValue>
      ))}
    </AttributeHeading>
    <AttributeRow style={{ padding: spacing(1) }}>
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

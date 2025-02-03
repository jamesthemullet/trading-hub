import styled from '@emotion/styled';

import { Label, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { Checkbox } from './checkbox';

const Row = styled.label`
  border-bottom: solid 1px ${color.grey};
  padding: ${spacing(2)};
  display: flex;
  align-items: center;
  cursor: pointer;
`;

type Value = {
  name: string;
  isSelected: boolean;
};

type Props = {
  values: Value[];
  onSelect: (isChecked: boolean, name: string) => void;
};

export const Checkboxes = ({ values, onSelect }: Props) => {
  return (
    <>
      {values.length ? (
        values.map(({ name, isSelected }) => (
          <Row key={name}>
            <Checkbox
              label={name}
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(!isSelected, name)}
            />
            <Label as="span">{name}</Label>
          </Row>
        ))
      ) : (
        <Text style={{ padding: spacing(2) }}>0 Results</Text>
      )}
    </>
  );
};

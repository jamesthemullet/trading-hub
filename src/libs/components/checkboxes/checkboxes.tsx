import styled from '@emotion/styled';

import { Label, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const Row = styled.label`
  border-bottom: solid 1px ${color.grey};
  padding: ${spacing(2)};
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Input = styled.input`
  appearance: none;
  background-color: #fff;
  margin: 0;
  font: inherit;
  color: currentColor;
  width: 1.15em;
  height: 1.15em;
  border: 0.15em solid currentColor;
  margin-right: ${spacing(1)};

  &::before {
    content: '';
    width: 0.65em;
    height: 0.65em;
    transform: scale(0);
    transition: 120ms transform ease-in-out;
    box-shadow: inset 1em 1em #000;
    margin: 2px 0 0 2px;
    display: block;
  }
  &:checked {
    &::before {
      transform: scale(1);
    }
  }
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
            <Input
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

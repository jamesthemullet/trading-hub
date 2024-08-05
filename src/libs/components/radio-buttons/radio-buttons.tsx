import styled from '@emotion/styled';

import { Label, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const Row = styled.label<{ hasDivider: boolean }>`
  border-bottom: ${({ hasDivider }) =>
    hasDivider ? `solid 1px ${color.grey}` : 'none'};
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
  border-radius: 50%;
  margin-right: ${spacing(1)};
  transform: translateY(0.275em);

  &::before {
    content: '';
    width: 0.65em;
    height: 0.65em;
    border-radius: 50%;
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
  hasDivider: boolean;
  isBold: boolean;
  values: Value[];
  onSelect: (name: string) => void;
};

export const RadioButtons = ({
  hasDivider,
  isBold,
  values,
  onSelect,
}: Props) => (
  <div>
    {values.length ? (
      values.map(({ name, isSelected }) => (
        <Row key={name} hasDivider={hasDivider}>
          <label htmlFor={name} aria-label={name} style={{ cursor: 'pointer' }}>
            <Input
              type="radio"
              id={name}
              checked={isSelected}
              onChange={() => onSelect(name)}
            />
            <Label as="span" isStrong={isBold}>
              {name}
            </Label>
          </label>
        </Row>
      ))
    ) : (
      <Text style={{ padding: spacing(2) }}>0 Results</Text>
    )}
  </div>
);

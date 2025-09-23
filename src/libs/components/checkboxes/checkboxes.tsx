import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';
import { formatHTMLStrings } from '@/libs/utils/format-html-strings';
import { spacing } from '@/libs/utils/spacing';

import { Label, Text } from '../typography/typography.styles';
import { Checkbox } from './checkbox';

const Row = styled.label`
  border-bottom: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
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
    <div>
      {values.length ? (
        values.map(({ name, isSelected }) => (
          <Row key={name}>
            <Checkbox
              label={name}
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(!isSelected, name)}
            />
            <Label as="span">{formatHTMLStrings(name)}</Label>
          </Row>
        ))
      ) : (
        <Text style={{ padding: spacing(2) }}>0 Results</Text>
      )}
    </div>
  );
};

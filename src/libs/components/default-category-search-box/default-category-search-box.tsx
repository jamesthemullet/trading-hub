import styled from '@emotion/styled';
import type { Category } from '@/libs/api';

import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { Label, Text } from '../typography/typography.styles';

const Wrapper = styled.div`
  margin-bottom: ${spacing(1)};

  input {
    min-height: 58px;
  }
`;

const Categories = styled.div`
  border-radius: 4px 4px 0 0;
  background-color: ${color.backgroundGrey};
  border-bottom: 1px solid #b1b1b1;
  padding: ${spacing(1)} ${spacing(1)} 0;
  margin-bottom: ${spacing(1)};
`;

const SelectedCategory = styled(Label)`
  margin-bottom: ${spacing(1)};
  color: #fff;
  background-color: ${color.selectionBox};
  border-radius: 6px;
  padding: ${spacing(1)} ${spacing(2)};
  display: inline-flex;
  align-items: center;
`;

type Props = {
  defaultCategory: Category;
};

export const DefaultCategorySearchBox = ({ defaultCategory }: Props) => {
  return (
    <Wrapper>
      <Text style={{ marginBottom: spacing(1) }}>Category</Text>
      <Categories>
        <SelectedCategory>{defaultCategory.identifier}</SelectedCategory>
      </Categories>
    </Wrapper>
  );
};

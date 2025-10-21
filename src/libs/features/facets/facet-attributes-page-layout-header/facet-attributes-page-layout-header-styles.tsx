import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';

import { Button, Text } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

export const Wrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2.5)};
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: ${spacing(2)};
`;

export const FlagAndButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left: ${spacing(1.5)};
  padding: ${spacing(2)} ${spacing(2)} 0 ${spacing(1)};
`;

export const FlagAndText = styled.div`
  display: flex;
  gap: ${spacing(1)};
`;

export const StyledText = styled(Text)`
  font-size: 28px;
  margin-left: ${spacing(1.5)};
  padding: 0 ${spacing(1)};
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: ${spacing(1)};
`;

export const Summary = styled.div`
  display: flex;
  background-color: ${color.accent.secondary.secondaryContainer};
  padding: ${spacing(1)} ${spacing(1)} ${spacing(2)} ${spacing(2.5)};
`;

export const SummaryBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 82px;
`;

export const CancelButton = styled(Button, {
  shouldForwardProp: (prop) => isPropValid(prop) || prop === 'theme',
})`
  width: 120px;
  text-align: center;
  border-right 1px solid ${color.accent.primary.primary};
`;

export const SaveButton = styled(Button, {
  shouldForwardProp: (prop) => isPropValid(prop) || prop === 'theme',
})`
  width: 168px;
`;

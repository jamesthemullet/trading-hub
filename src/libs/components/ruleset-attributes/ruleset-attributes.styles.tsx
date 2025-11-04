import styled from '@emotion/styled';

import { Text } from '@/libs/components';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

export const AttributeCount = styled(Text)`
  text-align: right;
  font-size: 12px;
  margin: ${spacing(1)} ${spacing(1)} ${spacing(2)};
`;

export const AttributeWrapper = styled.div`
  border: solid 1px #999;
  margin-bottom: 10px;
  width: 100%;
`;

export const AttributeHeading = styled.div`
  margin: ${spacing(1)};
  background: #fff;
`;

export const AttributeRow = styled.div`
  padding: ${spacing(1)};
  border-top: solid 1px #999;
  background-color: ${color.accent.secondary.secondaryContainer};
`;

export const AttributeValueList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: ${spacing(1)};
`;

export const AttributeValuePill = styled.li`
  background-color: ${color.accent.tertiary.tertiaryContainer};
  color: ${color.accent.tertiary.onTertiaryContainer};
  border-radius: 6px;
  padding: ${spacing(1)};
  margin: ${spacing(1)} ${spacing(1)} 0 0;
  font-size: 14px;
  text-align: center;
  display: flex;
  align-items: center;
  max-width: 100%;
  button {
    color: #000;

    &:focus {
      outline: solid #000;
    }
  }
`;

export const AttributeSelection = styled.div`
  max-height: 250px;
  overflow: auto;
`;

export const Buttons = styled.div`
  display: flex;
  align-items: center;
`;

export const RulesetAttributeButton = styled.button`
  border: none;
  background: none;
  display: flex;
`;

export const AlignedText = styled(Text)`
  display: flex;
  align-items: center;
  gap: ${spacing(0.5)};

  img {
    margin-left: ${spacing(1)};
  }
`;

export const ErrorText = styled(Text)`
  color: ${color.state.error.error};
`;

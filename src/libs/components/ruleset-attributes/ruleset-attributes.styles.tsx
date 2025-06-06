import styled from '@emotion/styled';

import { Button as RegularButton } from '../buttons/button/button';
import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export const AttributeCount = styled(Text)`
  text-align: right;
  font-size: 12px;
  margin: ${spacing(1)} ${spacing(1)} ${spacing(2)};
`;

export const AttributeWrapper = styled.div`
  border: solid 1px #999;
  margin-bottom: ${spacing(3)};
  width: 100%;
`;

export const AttributeHeading = styled.div`
  margin: ${spacing(1)};
  background: #fff;
`;

export const AttributeRow = styled.div`
  padding: ${spacing(1)};
  border-top: solid 1px #999;
  background-color: ${color.backgroundGrey};
`;

export const AttributeValue = styled.div`
  background-color: #e0e4e7;
  border-radius: 5px;
  padding: ${spacing(1)};
  margin: ${spacing(1)};
  display: inline-block;
  font-size: 14px;
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
  height: 36px;
  button {
    color: #000;

    &:focus {
      outline: solid #000;
    }
  }
`;

export const RemoveAttributeValuePill = styled.button`
  width: 12px;
  height: 12px;
  padding: 0;
  margin-left: ${spacing(1)};
  background: none;
  outline: none;
  border: none;
  display: flex;

  img {
    width: 12px;
    height: 12px;
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

export const Button = styled.button`
  border: none;
  background: none;
  display: flex;
`;

export const AddAttributeValueButton = styled(RegularButton)`
  margin: ${spacing(1)};
  padding: ${spacing(1)};
  align-items: center;
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  height: 36px;
  width: auto;
`;

export const AddAttributeValueIcon = styled.div`
  width: 18px;
  height: 18px;
  margin-right: ${spacing(0.5)};
`;

export const AlignedText = styled(Text)`
  display: flex;
  align-items: center;
  gap: ${spacing(0.5)};

  img {
    margin-left: ${spacing(1)};
  }
`;

import styled from '@emotion/styled';

import { Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export const AttributeCount = styled(Text)`
  text-align: right;
  font-size: 12px;
  border-bottom: solid 1px ${color.lightGrey};
  margin: 0 ${spacing(1)} ${spacing(1)};
  padding-right: ${spacing(1)};
  padding-bottom: ${spacing(1)};
`;

export const AttributeWrapper = styled.div`
  border: solid 1px #999;
  margin-bottom: ${spacing(2)};
  width: 100%;
`;

export const AttributeHeading = styled.div`
  padding: ${spacing(1)};
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
`;
export const AttributeValuePill = styled.li`
  background-color: #e0e4e7;
  border-radius: 5px;
  padding: ${spacing(1)};
  margin: ${spacing(1)};
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  height: 36px;
  margin-right: ${spacing(1)} button {
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
`;
export const Button = styled.button`
  border: none;
  background: none;
`;

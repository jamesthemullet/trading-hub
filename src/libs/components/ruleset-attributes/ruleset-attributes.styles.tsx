import styled from '@emotion/styled';
import { spacing } from '../utils/spacing';
import { color } from '../utils/constants';
import { Text } from '../typography/typography.styles';

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

export const AttributeValue = styled.label`
  background-color: #e0e4e7;
  border-radius: 5px;
  padding: ${spacing(1)};
  margin: ${spacing(1)};
  display: inline-block;
  font-size: 14px;
`;

export const AttributeSelection = styled.div`
  max-height: 250px;
  overflow: auto;
`;

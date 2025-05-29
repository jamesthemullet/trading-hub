import styled from '@emotion/styled';

import { fontSizes, lineHeights } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

export const Count = styled.span`
  background: ${color.darkHeritageGreen};
  color: #fff;
  margin-left: ${spacing(0.5)};
  border-radius: ${spacing(1)};
  padding: 0 4px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  display: inline-block;
  text-align: center;
  font-size: ${fontSizes['labelSmall']};
  line-height: ${lineHeights['labelSmall']};
`;

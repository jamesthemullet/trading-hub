import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import { fontSizes, lineHeights } from '../typography/typography.styles';

export const Count = styled.span`
  background: ${color.accent.primary.primary};
  color: ${color.accent.primary.onPrimary};
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

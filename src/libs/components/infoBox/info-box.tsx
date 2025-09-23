import styled from '@emotion/styled';

import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

import Image from 'next/image';

import { Text } from '../typography/typography.styles';

const Box = styled.div`
  display: flex;
  align-items: center;
  margin-top: 32px;
  padding: ${spacing(2)} ${spacing(1.5)};
  width: 340px;
  height: 56px;
  background-color: ${color.role.info.infoContainer};
  border-left: 5px solid ${color.role.info.onInfoContainer};

  p {
    margin-left: 18px;
  }
`;

export const InfoBox = ({ text }: { text: string }) => {
  return (
    <Box>
      <Image
        src="/trading-hub/asset/icon-info.svg"
        width={20}
        height={20}
        alt="IE flag"
      />
      <Text>{text}</Text>
    </Box>
  );
};

import styled from '@emotion/styled';

import { Text } from '@/libs/components';

import Image from 'next/image';

import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';

const Box = styled.div`
  display: flex;
  align-items: center;
  margin-top: 32px;
  padding: ${spacing(2)} ${spacing(1.5)};
  width: 340px;
  height: 56px;
  background-color: ${color.infoBoxBlue};
  border-left: 2px solid ${color.infoBoxBorder};

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

import styled from '@emotion/styled';
import { Typography } from '../typography/typography';
import { colourDictionary } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { Breadcrumb } from '../breadcrumb/breadcrumb';
import { Modal } from './modal';

const BreadcrumbText = styled(Typography)`
  color: ${colourDictionary.black};
`;

const HeadingWrapper = styled.div`
  background: ${colourDictionary.white};
  box-shadow: #000 0 0 4px;
  /* height: ${spacing(4)}; */
  padding: 23px;
  display: flex;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 3;
`;

const HeadingSpacer = styled.div`
  height: ${spacing(9)};
`;

type Props = {
  breadcrumbs: string[];
};

export const ModalUnsavedChanges = ({ breadcrumbs }: Props) => {
  return (
    <Modal>
      <p>unsaved text</p>
    </Modal>
  );
};

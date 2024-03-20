import styled from '@emotion/styled';
import { Button } from '../button/button';
import { spacing } from '../utils/spacing';
import { useState } from 'react';
import { color } from '../utils/constants';
import { Label } from '../typography/typography.styles';

const MODAL_WIDTH = 435;

const Wrapper = styled.div`
  position: relative;
`;

const Icon = styled.img`
  margin-right: ${spacing(1)};
  margin-bottom: -2px;
`;

const CreateNew = styled(Button)`
  width: auto;
  margin: ${spacing(3)} auto;
  display: block;
`;

const Modal = styled.div<{ isModalOpen: boolean }>`
  width: ${MODAL_WIDTH}px;
  background-color: #fff;
  z-index: 2;
  height: calc(100vh - 70px);
  position: absolute;
  top: -93px;
  left: 361px;
  transition: opacity 0.1s ease-in;
  opacity: ${({ isModalOpen }) => (isModalOpen ? 1 : 0)};
  visibility: ${({ isModalOpen }) => (isModalOpen ? 'visible' : 'hidden')};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

const ModalSection = styled.div`
  border-bottom: solid 1px ${color.grey};
  padding: ${spacing(2)};
`;

const Number = styled.span<{ isActive: boolean }>`
  background-color: ${({ isActive }) =>
    isActive ? color.lightGreen : color.lightGrey};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
`;

const Divider = styled.span`
  width: 35px;
  border-bottom: solid 1px ${color.grey};
`;

const ModalContent = styled.div`
  transition: transform 0.1s ease-in;
  transform: translateX(-${MODAL_WIDTH}px);
  position: absolute;
  width: 100%;
`;

const ModalFooter = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.grey};
  padding: ${spacing(1)};
  display: flex;
  justify-content: end;
`;

const SectionLabel = ({
  number,
  text,
  isActive,
}: {
  number: number;
  text: string;
  isActive: boolean;
}) => {
  return (
    <>
      <Number isActive={isActive}>
        <Label as="span" isStrong={isActive}>
          {number}
        </Label>
      </Number>
      <Label isStrong={isActive}>{text}</Label>
    </>
  );
};

export const RulesetAttributes = ({}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);

  return (
    <Wrapper>
      <CreateNew onClick={() => setIsModalOpen(!isModalOpen)}>
        <Icon alt="" src="/trading-hub/asset/icon-plus-simple.svg" />
        Create new attribute rule
      </CreateNew>
      <Modal isModalOpen={isModalOpen}>
        <ModalSection>
          <ModalHeader>
            <SectionLabel
              number={1}
              text="Choose type"
              isActive={modalStep === 0}
            />
            <Divider />
            <SectionLabel
              number={2}
              text="Choose value"
              isActive={modalStep === 1}
            />
          </ModalHeader>
        </ModalSection>
        <ModalContent
          style={{ transform: `translateX(${modalStep * MODAL_WIDTH * -1}px)` }}
          {...(modalStep !== 0 && { inert: '' })}
        >
          <ModalSection>
            <button onClick={() => setModalStep(1)}>demo next view</button>
          </ModalSection>
          <ModalSection>
            <p>Step 1 content</p>
          </ModalSection>
        </ModalContent>
        <ModalContent
          style={{
            transform: `translateX(${(modalStep - 1) * MODAL_WIDTH * -1}px)`,
          }}
          {...(modalStep !== 1 && { inert: '' })}
        >
          <ModalSection>
            <button onClick={() => setModalStep(0)}>demo previous view</button>
          </ModalSection>
          <ModalSection>
            <p>Step 2 content</p>
          </ModalSection>
        </ModalContent>
        <ModalFooter>
          <Button onClick={() => setIsModalOpen(false)} isInline={true}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </Wrapper>
  );
};

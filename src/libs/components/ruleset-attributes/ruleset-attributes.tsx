import styled from '@emotion/styled';
import { Modal } from '@mantine/core';
import { Button } from '../button/button';
import { spacing } from '../utils/spacing';
import { useState } from 'react';
import { color } from '../utils/constants';
import { Label, Text } from '../typography/typography.styles';
import { Checkboxes } from '../checkboxes/checkboxes';
import { RadioButtons } from '../radio-buttons/radio-buttons';
import { useAttributes } from '@/libs/hooks';
import { AttributesResponse } from '@/libs/api';

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

const ModalContainer = styled.div`
  height: 600px;
  display: flex;
`;
const ModalSide = styled.div`
  width: 50%;
  position: relative;
  background-color: #fff;
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

const ModalButton = styled(Label)`
  border: none;
  background: none;
  color: ${color.selectionBox};
  width: 100%;
  text-align: left;
  padding-left: 0;
`;

const NextStep = styled(Label)`
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  padding-left: 0;

  &::after {
    content: '';
    background: url('/trading-hub/asset/chevron-right.svg');
    width: 18px;
    height: 18px;
    position: absolute;
    right: ${spacing(5)};
  }
`;

const PreviousStep = styled(NextStep)`
  &::after {
    display: none;
  }
  &::before {
    content: '';
    background: url('/trading-hub/asset/chevron-left.svg');
    width: 12px;
    height: 19px;
    display: inline-block;
    margin-right: ${spacing(1)};
    margin-bottom: -4px;
  }
`;

const Count = styled(Text)`
  position: absolute;
  right: ${spacing(2)};
  top: 18px;
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

export type Props = {
  category?: string;
};

const getNumericAttributes = (attributes: AttributesResponse['attributes']) => {
  return attributes.filter((attribute) => attribute.type === 'numeric');
};

const getAlphanumericAttributes = (
  attributes: AttributesResponse['attributes']
) => {
  return attributes.filter((attribute) => attribute.type === 'alphanumeric');
};

export const RulesetAttributes = ({ category }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const { attributes } = useAttributes(category);
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<
    string[]
  >([]);

  return (
    <Wrapper>
      <CreateNew onClick={() => setIsModalOpen(!isModalOpen)}>
        <Icon alt="" src="/trading-hub/asset/icon-plus-simple.svg" />
        Create new attribute rule
      </CreateNew>
      <Modal.Root
        opened={isModalOpen}
        onClose={
          // istanbul ignore next
          () => setIsModalOpen(false)
        }
        centered
        size={`${2 * MODAL_WIDTH}px`}
        padding={0}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <Modal.Body>
            <ModalContainer>
              <ModalSide style={{ zIndex: 1 }}>
                <p>TODO: attribute preview content</p>
              </ModalSide>
              <ModalSide>
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
                      isActive={modalStep !== 0}
                    />
                  </ModalHeader>
                </ModalSection>

                <ModalContent
                  style={{
                    transform: `translateX(${modalStep * MODAL_WIDTH * -1}px)`,
                  }}
                  {...(modalStep !== 0 && { inert: '' })}
                >
                  <ModalSection>
                    <Label isStrong>Choose attribute type</Label>
                  </ModalSection>
                  <ModalSection>
                    <ModalButton
                      as="button"
                      isStrong
                      onClick={() => setModalStep(1)}
                    >
                      Numeric attributes
                    </ModalButton>
                  </ModalSection>
                  <ModalSection>
                    <ModalButton
                      as="button"
                      isStrong
                      onClick={() => setModalStep(2)}
                    >
                      Product description attributes
                    </ModalButton>
                  </ModalSection>
                </ModalContent>

                <ModalContent
                  style={{
                    transform: `translateX(${(modalStep - 1) * MODAL_WIDTH * -1}px)`,
                  }}
                  {...(modalStep !== 1 && { inert: '' })}
                >
                  <ModalSection>
                    <PreviousStep
                      as="button"
                      isStrong
                      onClick={() => setModalStep(0)}
                    >
                      back
                    </PreviousStep>
                  </ModalSection>
                  <ModalSection>
                    <Label isStrong>Numeric Attributes</Label>
                    <Text>
                      Select one numeric attribute below to boost linearly
                      (larger the value, stronger the boost). Attributes are
                      aggregated from the account level
                    </Text>
                  </ModalSection>
                  <RadioButtons
                    values={getNumericAttributes(attributes).map(
                      (attribute) => ({
                        name: attribute.name,
                        isSelected: false,
                      })
                    )}
                  />
                </ModalContent>

                <ModalContent
                  style={{
                    transform: `translateX(${(modalStep - 2) * MODAL_WIDTH * -1}px)`,
                  }}
                  {...(modalStep !== 2 && { inert: '' })}
                >
                  <ModalSection>
                    <PreviousStep
                      as="button"
                      isStrong
                      onClick={() => setModalStep(0)}
                    >
                      back
                    </PreviousStep>
                  </ModalSection>
                  <ModalSection>
                    <Label isStrong>Product description attributes</Label>
                    <Text>
                      Attributes are aggregated from the account level
                    </Text>
                  </ModalSection>
                  {getAlphanumericAttributes(attributes).map((attribute) => (
                    <ModalSection key={attribute.name}>
                      <NextStep
                        as="button"
                        onClick={() => {
                          setSelectedAttributeValues(
                            attribute.values.map((value) => value.value)
                          );
                          setModalStep(3);
                        }}
                        isStrong
                      >
                        {attribute.name}
                      </NextStep>
                    </ModalSection>
                  ))}
                </ModalContent>

                <ModalContent
                  style={{
                    transform: `translateX(${(modalStep - 3) * MODAL_WIDTH * -1}px)`,
                  }}
                  {...(modalStep !== 3 && { inert: '' })}
                >
                  <ModalSection>
                    <PreviousStep
                      as="button"
                      isStrong
                      onClick={() => setModalStep(2)}
                    >
                      back
                    </PreviousStep>
                    <Count>Showing: 4</Count>
                  </ModalSection>
                  <Checkboxes
                    values={selectedAttributeValues.map((value) => ({
                      name: value,
                      isSelected: false,
                    }))}
                  />
                </ModalContent>

                <ModalFooter>
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalStep(0);
                    }}
                    isInline={true}
                  >
                    Cancel
                  </Button>
                </ModalFooter>
              </ModalSide>
            </ModalContainer>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </Wrapper>
  );
};

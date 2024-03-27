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
import { Search } from '../search/search';
import { Dropdown, DropdownOption } from '../dropdown/dropdown';

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

const SearchWrapper = styled.div`
  padding-top: ${spacing(2)};

  label {
    visibility: hidden;
    display: block;
    height: 0px;
  }
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

const AttributeWrapper = styled.div`
  border: solid 1px #000;
`;

const AttributeHeading = styled.div`
  padding: ${spacing(1)};
  background: #fff;
`;

const AttributeRow = styled.div`
  padding: ${spacing(1)};
  border-top: solid 1px #000;
  background-color: ${color.backgroundGrey};
`;

const AttributeValue = styled.label`
  background-color: #e0e4e7;
  border-radius: 5px;
  padding: ${spacing(1)};
  margin: ${spacing(1)};
  display: inline-block;
`;

const Filters = styled.div`
  display: flex;
`;

const DropdownWrapper = styled.div`
  margin-top: ${spacing(2)};
  margin-right: ${spacing(1)};
  margin-left: -${spacing(1)};
  min-width: 133px;

  button {
    &[aria-haspopup='listbox'] {
      background: none;
      border: solid 1px #000;
      border-radius: 5px;
      text-transform: capitalize;
      height: 40px;
    }
    span {
      font-size: 16px;
    }
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: ${spacing(1)};
  }
`;

const NumericAttribute = ({
  name,
  operation,
}: {
  name: string;
  operation: string;
}) => (
  <AttributeWrapper aria-label="Selected Attribute">
    <AttributeHeading>
      <Label isStrong>{name}</Label>
    </AttributeHeading>
    <AttributeRow>
      <Text>
        Operation{' '}
        <img
          src="/trading-hub/asset/boost.svg"
          style={{ marginBottom: '-4px' }}
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeRow>
      <Text>Strength 1.0%</Text>
    </AttributeRow>
  </AttributeWrapper>
);

const AlphanumericAttribute = ({
  values,
  operation,
}: {
  values: string[];
  operation: string;
}) => (
  <AttributeWrapper aria-label="Selected Attribute">
    <AttributeHeading>
      {values.map((value) => (
        <AttributeValue key={value}>{value}</AttributeValue>
      ))}
    </AttributeHeading>
    <AttributeRow style={{ padding: spacing(1) }}>
      <Text>
        Operation{' '}
        <img
          src={`/trading-hub/asset/${operation}.svg`}
          style={{ marginBottom: '-4px' }}
        />{' '}
        {operation}
      </Text>
    </AttributeRow>
    <AttributeRow>
      <Text>Strength 1.0%</Text>
    </AttributeRow>
  </AttributeWrapper>
);

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
  const [isOperationDropdownOpen, setIsOperationDropdownOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const { attributes } = useAttributes(category);
  const [alphanumericAttributeValues, setAlphanumericAttributeValues] =
    useState<string[]>([]);
  const [numbericSearchValue, setNumericSearchValue] = useState('');
  const [alphanumbericSearchValue, setAlphaNumericSearchValue] = useState('');
  const [alphanumbericFilterValue, setAlphaNumericFilterValue] = useState('');
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<
    string[]
  >([]);
  const [selectedOperation, setSelectedOperation] = useState<'boost' | 'bury'>(
    'boost'
  );
  const [selectedAttributeType, setSelectedAttributeType] = useState<
    'numeric' | 'alphanumeric'
  >();

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
              <ModalSide
                style={{
                  zIndex: 1,
                  padding: `${spacing(10)} ${spacing(2)} ${spacing(2)}`,
                }}
              >
                {selectedAttributeType === 'numeric' &&
                  !!selectedAttributeValues.length && (
                    <NumericAttribute
                      operation={selectedOperation}
                      name={selectedAttributeValues[0]}
                    />
                  )}

                {selectedAttributeType === 'alphanumeric' &&
                  !!selectedAttributeValues.length && (
                    <AlphanumericAttribute
                      operation={selectedOperation}
                      values={selectedAttributeValues}
                    />
                  )}
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
                      onClick={() => {
                        setModalStep(0);
                        setSelectedAttributeValues([]);
                      }}
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

                    <SearchWrapper>
                      <label htmlFor="filerNumericAttributes">
                        Filter numeric attributes
                      </label>
                      <Search
                        name="Filter numeric attributes"
                        id="filerNumericAttributes"
                        value={numbericSearchValue}
                        onChange={(e) => setNumericSearchValue(e.target.value)}
                      />
                    </SearchWrapper>
                  </ModalSection>
                  <RadioButtons
                    values={getNumericAttributes(attributes)
                      .filter((attribute) =>
                        attribute.name
                          .toLowerCase()
                          .includes(numbericSearchValue.toLowerCase())
                      )
                      .map((attribute) => ({
                        name: attribute.name,
                        isSelected:
                          selectedAttributeValues.indexOf(attribute.name) > -1,
                      }))}
                    onSelect={(name) => {
                      setSelectedAttributeValues([name]);
                      setSelectedAttributeType('numeric');
                    }}
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
                      onClick={() => {
                        setSelectedAttributeValues([]);
                        setModalStep(0);
                      }}
                    >
                      back
                    </PreviousStep>
                  </ModalSection>
                  <ModalSection>
                    <Label isStrong>Product description attributes</Label>
                    <Text>
                      Attributes are aggregated from the account level
                    </Text>
                    <Filters>
                      <DropdownWrapper>
                        <Dropdown
                          label={`${selectedOperation}`}
                          icon={selectedOperation}
                          isOpen={isOperationDropdownOpen}
                          onOpen={() => setIsOperationDropdownOpen(true)}
                          onClose={
                            // istanbul ignore next
                            () => setIsOperationDropdownOpen(false)
                          }
                        >
                          <DropdownOption
                            onClick={
                              // istanbul ignore next
                              () => {
                                setIsOperationDropdownOpen(false);
                                setSelectedOperation('boost');
                              }
                            }
                          >
                            <img src="/trading-hub/asset/boost.svg" />
                            Boost
                          </DropdownOption>
                          <DropdownOption
                            onClick={() => {
                              setIsOperationDropdownOpen(false);
                              setSelectedOperation('bury');
                            }}
                          >
                            <img src="/trading-hub/asset/bury.svg" />
                            Bury
                          </DropdownOption>
                        </Dropdown>
                      </DropdownWrapper>
                      <SearchWrapper>
                        <label htmlFor="filerAlphanumericAttributes">
                          Filter alphanumeric attributes
                        </label>
                        <Search
                          name="Filter alphanumeric attributes"
                          id="filerAlphanumericAttributes"
                          value={alphanumbericSearchValue}
                          onChange={(e) =>
                            setAlphaNumericSearchValue(e.target.value)
                          }
                        />
                      </SearchWrapper>
                    </Filters>
                  </ModalSection>
                  {getAlphanumericAttributes(attributes)
                    .filter((attribute) =>
                      attribute.name
                        .toLowerCase()
                        .includes(alphanumbericSearchValue.toLowerCase())
                    )
                    .map((attribute) => (
                      <ModalSection key={attribute.name}>
                        <NextStep
                          as="button"
                          onClick={() => {
                            setAlphanumericAttributeValues(
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
                    <Count>Showing: {alphanumericAttributeValues.length}</Count>
                    <SearchWrapper>
                      <label htmlFor="filerSelectedAttributes">
                        Filter selected attributes
                      </label>
                      <Search
                        name="Filter selected attributes"
                        id="filerSelectedAttributes"
                        value={alphanumbericFilterValue}
                        onChange={(e) =>
                          setAlphaNumericFilterValue(e.target.value)
                        }
                      />
                    </SearchWrapper>
                  </ModalSection>
                  <Checkboxes
                    onSelect={(isSelected, name) => {
                      setSelectedAttributeType('alphanumeric');
                      setSelectedAttributeValues(
                        isSelected
                          ? [...selectedAttributeValues, name]
                          : selectedAttributeValues.filter((i) => i !== name)
                      );
                    }}
                    values={alphanumericAttributeValues
                      .filter((value) =>
                        value
                          .toLowerCase()
                          .includes(alphanumbericFilterValue.toLowerCase())
                      )
                      .map((value) => ({
                        name: value,
                        isSelected: selectedAttributeValues.indexOf(value) > -1,
                      }))}
                  />
                </ModalContent>

                <ModalFooter>
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalStep(0);
                      setSelectedAttributeValues([]);
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

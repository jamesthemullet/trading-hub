import styled from '@emotion/styled';
import { Modal } from '@mantine/core';
const pluralize = require('pluralize');

import { Button } from '../buttons/button/button';
import { spacing } from '../utils/spacing';
import { useState } from 'react';
import { color } from '../utils/constants';
import { Label, Text } from '../typography/typography.styles';
import { Checkboxes } from '../checkboxes/checkboxes';
import { RadioButtons } from '../radio-buttons/radio-buttons';
import { useAttributes } from '@/libs/hooks';
import { AttributesResponse, MerchandisingRules } from '@/libs/api';
import { Search } from '../search/search';
import { Dropdown, DropdownOption } from '../dropdowns/dropdown/dropdown';
import { NumericAttribute } from './numeric-attribute';
import { AlphanumericAttribute } from './alphanumeric-attribute';
import { AttributeCount, AttributesList } from './ruleset-attributes.styles';
import Image from 'next/image';

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

const SelectedAttribute = styled.div`
  border-right: solid 1px ${color.lightGrey};
  height: 100%;
  padding-right: ${spacing(1)};
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

const ModalAttributeHeader = styled.div`
  border-bottom: solid 1px ${color.grey};
  padding: ${spacing(2)};
  display: flex;
  align-items: center;
  background-color: ${color.backgroundGrey};
  margin: 0;
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
      justify-content: left;
    }
  }

  img {
    width: 20px;
    height: 20px;
    margin-right: ${spacing(1)};
    margin-top: 3px;
  }
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
  merchandisingRules: MerchandisingRules;
};

const getNumericAttributes = (attributes: AttributesResponse['attributes']) => {
  return attributes.filter((attribute) => attribute.type === 'numeric');
};

const getAlphanumericAttributes = (
  attributes: AttributesResponse['attributes']
) => {
  return attributes.filter((attribute) => attribute.type === 'alphanumeric');
};

export const RulesetAttributes = ({ category, merchandisingRules }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOperationDropdownOpen, setIsOperationDropdownOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const { attributes } = useAttributes(category);
  const [alphanumericAttributeValues, setAlphanumericAttributeValues] =
    useState<string[]>([]);
  const [numbericSearchValue, setNumericSearchValue] = useState('');
  const [alphanumericSearchValue, setAlphanumericSearchValue] = useState('');
  const [alphanumbericFilterValue, setAlphanumericFilterValue] = useState('');
  const [alphanumericField, setAlphanumericField] = useState<string>('');
  const [selectedAlphanumericValues, setSelectedAlphanumericValues] = useState<
    Array<{
      field: string;
      values: Array<string>;
    }>
  >([]);
  const [selectedNumericField, setSelectedNumericField] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<'boost' | 'bury'>(
    'boost'
  );
  const [selectedAttributeType, setSelectedAttributeType] = useState<
    'numeric' | 'alphanumeric'
  >('numeric');
  /* istanbul ignore next */
  const countOfAttributeChanges =
    (merchandisingRules.boosts?.numeric?.length ?? 0) +
    (merchandisingRules.boosts?.alphanumeric?.length ?? 0) +
    (merchandisingRules.buries?.numeric?.length ?? 0) +
    (merchandisingRules.buries?.alphanumeric?.length ?? 0);
  /* istanbul ignore next */
  const numericBoosts = merchandisingRules.boosts?.numeric ?? [];
  /* istanbul ignore next */
  const alphanumericBoost = merchandisingRules.boosts?.alphanumeric ?? [];
  /* istanbul ignore next */
  const numericBury = merchandisingRules.buries?.numeric ?? [];
  /* istanbul ignore next */
  const alphanumericBuries = merchandisingRules.buries?.alphanumeric ?? [];

  return (
    <Wrapper>
      <CreateNew onClick={() => setIsModalOpen(!isModalOpen)}>
        <Icon alt="" src="/trading-hub/asset/icon-plus-simple.svg" />
        Create new attribute rule
      </CreateNew>
      {countOfAttributeChanges > 0 && (
        <AttributesList aria-label="Ruleset attributes">
          <AttributeCount>
            {countOfAttributeChanges} attribute{' '}
            {pluralize('rule', countOfAttributeChanges)}
          </AttributeCount>
          {(!!alphanumericBoost.length || !!alphanumericBuries.length) && (
            <Label isStrong withMargin>
              Product description attribute rules
            </Label>
          )}
          {!!alphanumericBoost.length &&
            alphanumericBoost.map((attribute) => (
              <AlphanumericAttribute
                key={attribute.fields[0].field}
                isEditable
                fields={attribute.fields}
                operation="boost"
                weight={attribute.weight}
              />
            ))}

          {!!alphanumericBuries.length &&
            alphanumericBuries.map((attribute) => (
              <AlphanumericAttribute
                key={attribute.fields[0].field}
                isEditable
                fields={attribute.fields}
                operation="bury"
                weight={attribute.weight}
              />
            ))}

          {(!!numericBoosts.length || !!numericBury.length) && (
            <Label isStrong withMargin>
              Numeric attribute rules
            </Label>
          )}
          {!!numericBoosts.length &&
            numericBoosts.map((attribute) => (
              <NumericAttribute
                key={attribute.field}
                isEditable
                operation="boost"
                name={attribute.field}
                weight={attribute.weight}
              />
            ))}
          {!!numericBury.length &&
            numericBury.map((attribute) => (
              <NumericAttribute
                key={attribute.field}
                isEditable
                operation="bury"
                name={attribute.field}
                weight={attribute.weight}
              />
            ))}
        </AttributesList>
      )}
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
                aria-label="Selected Attribute"
              >
                <SelectedAttribute>
                  {selectedAttributeType === 'numeric' &&
                    !!selectedNumericField && (
                      <NumericAttribute
                        operation={selectedOperation}
                        name={selectedNumericField}
                      />
                    )}
                  {selectedAttributeType === 'alphanumeric' &&
                    !!selectedAlphanumericValues.length && (
                      <AlphanumericAttribute
                        operation={selectedOperation}
                        fields={selectedAlphanumericValues}
                        weight={1}
                      />
                    )}
                </SelectedAttribute>
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
                        setSelectedNumericField('');
                      }}
                    >
                      Back
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
                  <ModalAttributeHeader>
                    <Label isStrong>Relevant attributes</Label>
                  </ModalAttributeHeader>
                  <RadioButtons
                    values={getNumericAttributes(attributes)
                      .filter((attribute) =>
                        attribute.name
                          .toLowerCase()
                          .includes(numbericSearchValue.toLowerCase())
                      )
                      .map((attribute) => ({
                        name: attribute.name,
                        isSelected: selectedNumericField === attribute.name,
                      }))}
                    onSelect={(name) => {
                      setSelectedNumericField(name);
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
                        setSelectedAlphanumericValues([]);

                        setSelectedNumericField('');
                        setModalStep(0);
                      }}
                    >
                      Back
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
                          icon={`${selectedOperation}-signifier`}
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
                            <Image
                              src="/trading-hub/asset/boost-signifier.svg"
                              alt=""
                              width={20}
                              height={20}
                            />
                            Boost
                          </DropdownOption>
                          <DropdownOption
                            onClick={() => {
                              setIsOperationDropdownOpen(false);
                              setSelectedOperation('bury');
                            }}
                          >
                            <Image
                              src="/trading-hub/asset/bury-signifier.svg"
                              alt=""
                              width={20}
                              height={20}
                            />
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
                          value={alphanumericSearchValue}
                          onChange={(e) =>
                            setAlphanumericSearchValue(e.target.value)
                          }
                        />
                      </SearchWrapper>
                    </Filters>
                  </ModalSection>
                  <ModalAttributeHeader>
                    <Label isStrong>Relevant attributes</Label>
                  </ModalAttributeHeader>
                  {getAlphanumericAttributes(attributes)
                    .filter((attribute) =>
                      attribute.name
                        .toLowerCase()
                        .includes(alphanumericSearchValue.toLowerCase())
                    )
                    .map((attribute) => (
                      <ModalSection key={attribute.name}>
                        <NextStep
                          as="button"
                          onClick={() => {
                            setAlphanumericAttributeValues(
                              attribute.values.map((value) => value.value)
                            );
                            setAlphanumericField(attribute.name);
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
                      {alphanumericField}
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
                          setAlphanumericFilterValue(e.target.value)
                        }
                      />
                    </SearchWrapper>
                  </ModalSection>
                  <ModalAttributeHeader>
                    <Label isStrong>Current matching attribute values</Label>
                  </ModalAttributeHeader>
                  <div aria-label="Selected attributes">
                    <Checkboxes
                      onSelect={(isSelected, name) => {
                        setSelectedAttributeType('alphanumeric');

                        const currentValues =
                          selectedAlphanumericValues.find(
                            (attribute) => attribute.field === alphanumericField
                          )?.values || [];

                        const newValues = isSelected
                          ? [...currentValues, name]
                          : currentValues.filter((i) => i !== name);

                        const updatedField = selectedAlphanumericValues.filter(
                          (attr) => attr.field !== alphanumericField
                        );

                        setSelectedAlphanumericValues([
                          ...updatedField,
                          { field: alphanumericField, values: newValues },
                        ]);
                      }}
                      values={alphanumericAttributeValues
                        .filter((value) =>
                          value
                            .toLowerCase()
                            .includes(alphanumbericFilterValue.toLowerCase())
                        )
                        .map((value) => ({
                          name: value,
                          isSelected:
                            selectedAlphanumericValues
                              .find((attr) => attr.field === alphanumericField)
                              ?.values.includes(value) || false,
                        }))}
                    />
                  </div>
                </ModalContent>

                <ModalFooter>
                  <Button
                    onClick={() => {
                      setIsModalOpen(false);
                      setModalStep(0);

                      setSelectedNumericField('');
                      setSelectedAlphanumericValues([]);
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

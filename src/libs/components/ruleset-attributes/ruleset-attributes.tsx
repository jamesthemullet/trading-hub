import styled from '@emotion/styled';
import { Modal } from '@mantine/core';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pluralize = require('pluralize');

import { useState } from 'react';

import {
  AlphanumericBoostBury,
  AttributeResponseItem,
  MerchandisingRules,
  NumericBoostBury,
} from '@/libs/api';
import { useCategoryAttributes } from '@/libs/hooks';

import Image from 'next/image';

import { EditAttribute } from '../../modules/ruleset/ruleset';
import { Button } from '../buttons/button/button';
import { Checkboxes } from '../checkboxes/checkboxes';
import { Dropdown, DropdownOption } from '../dropdowns/dropdown/dropdown';
import { RadioButtons } from '../radio-buttons/radio-buttons';
import { Search } from '../search/search';
import { Label, Text } from '../typography/typography.styles';
import { color } from '../utils/constants';
import { spacing } from '../utils/spacing';
import { AlphanumericAttribute } from './alphanumeric-attribute';
import { NumericAttribute } from './numeric-attribute';
import {
  AttributeCount,
  AttributeSelection,
} from './ruleset-attributes.styles';

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
  padding: 12px;
  position: relative;
`;

const Number = styled.span<{ isActive: boolean }>`
  background-color: ${({ isActive }) =>
    isActive ? color.lightGreen : color.lightGrey};
  width: 32px;
  height: 32px;
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

const InsetLabel = styled(Label)`
  margin-left: ${spacing(1)};
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
  onChangeAttribute: (args: EditAttribute) => void;
};

const BoostBuryDropdown = ({
  selectedOperation,
  setSelectedOperation,
}: {
  selectedOperation: 'boost' | 'bury';
  setSelectedOperation: (args: 'boost' | 'bury') => void;
}) => {
  const [isOperationDropdownOpen, setIsOperationDropdownOpen] = useState(false);
  return (
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
  );
};

export const RulesetAttributes = ({
  category,
  merchandisingRules,
  onChangeAttribute,
}: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);
  const { attributes: numericAttributes } = useCategoryAttributes(
    category,
    'numeric'
  );
  const { attributes: alphanumericAttributes } = useCategoryAttributes(
    category,
    'alphanumeric'
  );
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
        <div aria-label="Ruleset attributes">
          <AttributeCount>
            {countOfAttributeChanges} attribute{' '}
            {pluralize('rule', countOfAttributeChanges)}
          </AttributeCount>
          {(!!alphanumericBoost.length || !!alphanumericBuries.length) && (
            <InsetLabel isStrong withMargin as="h3">
              Product Description Attribute Rules
            </InsetLabel>
          )}
          {!!alphanumericBoost.length &&
            alphanumericBoost.map(({ fields, weight }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="boost"
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    onChangeAttribute({
                      attribute: { fields, weight: newWeight },
                      change: 'modify',
                      index,
                      operation: 'boosts',
                      type: 'alphanumeric',
                    })
                }
                onDelete={({ fields, weight }: AlphanumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { fields, weight },
                    change: 'remove',
                    operation: 'boosts',
                    type: 'alphanumeric',
                  })
                }
              />
            ))}

          {!!alphanumericBuries.length &&
            alphanumericBuries.map(({ fields, weight }, index) => (
              <AlphanumericAttribute
                key={fields[0].field}
                isEditable
                fields={fields}
                operation="bury"
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    onChangeAttribute({
                      attribute: { fields, weight: newWeight },
                      change: 'modify',
                      index,
                      operation: 'buries',
                      type: 'alphanumeric',
                    })
                }
                onDelete={({ fields, weight }: AlphanumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { fields, weight },
                    change: 'remove',
                    operation: 'buries',
                    type: 'alphanumeric',
                  })
                }
              />
            ))}

          {(!!numericBoosts.length || !!numericBury.length) && (
            <InsetLabel isStrong withMargin as="h3">
              Numeric Attribute Rules
            </InsetLabel>
          )}
          {!!numericBoosts.length &&
            numericBoosts.map(({ field, weight }, index) => (
              <NumericAttribute
                key={field}
                isEditable
                operation="boost"
                name={field}
                weight={weight}
                onChangeAttribute={({ newWeight }: { newWeight: number }) =>
                  onChangeAttribute({
                    attribute: { field, weight: newWeight },
                    change: 'modify',
                    index,
                    operation: 'boosts',
                    type: 'numeric',
                  })
                }
                onDelete={({ field, weight }: NumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { field, weight },
                    change: 'remove',
                    operation: 'boosts',
                    type: 'numeric',
                  })
                }
              />
            ))}
          {!!numericBury.length &&
            numericBury.map(({ field, weight }, index) => (
              <NumericAttribute
                key={field}
                isEditable
                operation="bury"
                name={field}
                weight={weight}
                onChangeAttribute={
                  // istanbul ignore next
                  ({ newWeight }: { newWeight: number }) =>
                    onChangeAttribute({
                      attribute: { field, weight: newWeight },
                      change: 'modify',
                      index,
                      operation: 'buries',
                      type: 'numeric',
                    })
                }
                onDelete={({ field, weight }: NumericBoostBury) =>
                  onChangeAttribute({
                    attribute: { field, weight },
                    change: 'remove',
                    operation: 'buries',
                    type: 'numeric',
                  })
                }
              />
            ))}
        </div>
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
                  padding: `${spacing(8)} ${spacing(2)} ${spacing(2)}`,
                }}
              >
                <SelectedAttribute aria-label="Selected Attribute">
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
                        weight={100}
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
                    <Filters>
                      <BoostBuryDropdown
                        selectedOperation={selectedOperation}
                        setSelectedOperation={setSelectedOperation}
                      />
                      <SearchWrapper>
                        <label htmlFor="filerNumericAttributes">
                          Filter numeric attributes
                        </label>
                        <Search
                          name="Filter numeric attributes"
                          id="filerNumericAttributes"
                          value={numbericSearchValue}
                          onChange={(e) =>
                            setNumericSearchValue(e.target.value)
                          }
                        />
                      </SearchWrapper>
                    </Filters>
                  </ModalSection>
                  <AttributeSelection>
                    <ModalAttributeHeader>
                      <Label isStrong>Relevant attributes</Label>
                    </ModalAttributeHeader>
                    <RadioButtons
                      values={numericAttributes
                        .filter((attribute: AttributeResponseItem) =>
                          attribute.name
                            .toLowerCase()
                            .includes(numbericSearchValue.toLowerCase())
                        )
                        .map((attribute: AttributeResponseItem) => ({
                          name: attribute.name,
                          isSelected: selectedNumericField === attribute.name,
                        }))}
                      onSelect={(name) => {
                        setSelectedNumericField(name);
                        setSelectedAttributeType('numeric');
                      }}
                    />
                  </AttributeSelection>
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
                      <BoostBuryDropdown
                        selectedOperation={selectedOperation}
                        setSelectedOperation={setSelectedOperation}
                      />
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
                  <AttributeSelection style={{ maxHeight: '295px' }}>
                    <ModalAttributeHeader>
                      <Label isStrong>Relevant attributes</Label>
                    </ModalAttributeHeader>
                    {alphanumericAttributes
                      .filter((attribute: AttributeResponseItem) =>
                        attribute.name
                          .toLowerCase()
                          .includes(alphanumericSearchValue.toLowerCase())
                      )
                      .map((attribute: AttributeResponseItem) => (
                        <ModalSection key={attribute.name}>
                          <NextStep
                            as="button"
                            onClick={() => {
                              // istanbul ignore next
                              if (!attribute.values) return;
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
                  </AttributeSelection>
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
                  <AttributeSelection style={{ maxHeight: '380px' }}>
                    <ModalAttributeHeader>
                      <Label isStrong>Current matching attribute values</Label>
                    </ModalAttributeHeader>
                    <div aria-label="Selected attributes">
                      <Checkboxes
                        onSelect={(isSelected, name) => {
                          setSelectedAttributeType('alphanumeric');

                          const currentValues =
                            selectedAlphanumericValues.find(
                              (attribute) =>
                                attribute.field === alphanumericField
                            )?.values || [];

                          const newValues = isSelected
                            ? [...currentValues, name]
                            : currentValues.filter((i) => i !== name);

                          const updatedField =
                            selectedAlphanumericValues.filter(
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
                                .find(
                                  (attr) => attr.field === alphanumericField
                                )
                                ?.values.includes(value) || false,
                          }))}
                      />
                    </div>
                  </AttributeSelection>
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
                  </Button>{' '}
                  {(!!selectedNumericField.length ||
                    !!selectedAlphanumericValues.length) && (
                    <Button
                      onClick={() => {
                        setIsModalOpen(false);
                        setModalStep(0);

                        const attribute =
                          selectedAttributeType === 'alphanumeric'
                            ? {
                                fields: selectedAlphanumericValues,
                                weight: 100,
                              }
                            : {
                                field: selectedNumericField,
                                weight: 100,
                              };

                        onChangeAttribute({
                          attribute,
                          operation:
                            selectedOperation === 'boost' ? 'boosts' : 'buries',
                          change: 'add',
                          type: selectedAttributeType,
                        });

                        setSelectedOperation('boost');
                        setSelectedNumericField('');
                        setSelectedAlphanumericValues([]);
                      }}
                      isInline
                      isPrimary
                      style={{ marginLeft: spacing(1) }}
                    >
                      Done
                    </Button>
                  )}
                </ModalFooter>
              </ModalSide>
            </ModalContainer>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </Wrapper>
  );
};

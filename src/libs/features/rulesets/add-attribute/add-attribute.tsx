import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import type {
  MerchandisingAttributeResponseItem,
  MerchandisingAttributesResponse,
} from '@/libs/api';
import { Button, Label, Text } from '@/libs/components';
import { Checkboxes } from '@/libs/components/checkboxes/checkboxes';
import { OperationSelector } from '@/libs/components/operation-selector/operation-selector';
import { RadioButtons } from '@/libs/components/radio-buttons/radio-buttons';
import { AlphanumericAttribute } from '@/libs/components/ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '@/libs/components/ruleset-attributes/numeric-attribute';
import { AttributeSelection } from '@/libs/components/ruleset-attributes/ruleset-attributes.styles';
import { Search } from '@/libs/components/search/search';
import type { AttributeEdit, RulesetAttribute } from '@/libs/components/types';
import { color } from '@/libs/utils/constants';
import { spacing } from '@/libs/utils/spacing';

const MODAL_WIDTH = 522;

const ModalContainer = styled.div`
  height: 600px;
  display: flex;
`;

const ModalSideBase = styled.section`
  position: relative;
  background-color: #fff;
  overflow: hidden;
  z-index: 1;
`;

const ModalSide = styled(ModalSideBase)`
  padding: ${spacing(8)} ${spacing(2)} ${spacing(2)};
  width: 40%;
`;

const ModalRightSide = styled(ModalSideBase)`
  width: 60%;
`;

const SelectedAttribute = styled.div`
  border-right: solid 1px ${color.lightGrey};
  height: 100%;
  padding-right: ${spacing(1)};
  overflow-y: scroll;
`;

const ModalSection = styled.div`
  border-bottom: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: 12px;
  position: relative;
`;

const StyledNumber = styled.span<{ isActive: boolean }>`
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
  border-bottom: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: ${spacing(2)};
  display: flex;
  align-items: center;
  background-color: ${color.accent.secondary.secondaryContainer};
  margin: 0;
`;

const Divider = styled.span`
  width: 35px;
  border-bottom: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
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
  border-top: solid 1px ${color.surfaceDark.onSurfaceDarkVariant};
  padding: ${spacing(1)};
  display: flex;
  justify-content: end;
  gap: ${spacing(1)};
`;

const Filters = styled.div`
  display: flex;
  align-items: end;
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
      <StyledNumber isActive={isActive}>
        <Label as="span" isStrong={isActive}>
          {number}
        </Label>
      </StyledNumber>
      <Label isStrong={isActive}>{text}</Label>
    </>
  );
};

const StepContent = ({
  stepIndex,
  currentStep,
  children,
}: {
  stepIndex: number;
  currentStep: number;
  children: React.ReactNode;
}) => (
  <ModalContent
    style={{
      transform: `translateX(${(currentStep - stepIndex) * MODAL_WIDTH * -1}px)`,
    }}
    {...(currentStep !== stepIndex && { inert: true })}
  >
    {children}
  </ModalContent>
);

type Props = {
  onCancel: () => void;
  onSelect: (attribute: RulesetAttribute) => void;
  numericAttributes: MerchandisingAttributesResponse['attributes'];
  alphanumericAttributes: MerchandisingAttributesResponse['attributes'];
  isEditMode: boolean;
  editData: AttributeEdit | null;
};
export const AddAttribute = ({
  onCancel,
  onSelect,
  numericAttributes,
  alphanumericAttributes,
  isEditMode,
  editData,
}: Props) => {
  const [modalStep, setModalStep] = useState(0);

  const [numericSearchValue, setNumericSearchValue] = useState('');
  const [alphanumericSearchValue, setAlphanumericSearchValue] = useState('');
  const [alphanumericFilterValue, setAlphanumericFilterValue] = useState('');
  const [alphanumericField, setAlphanumericField] = useState<string>('');
  const [alphanumericAttributeValues, setAlphanumericAttributeValues] =
    useState<string[]>([]);

  const [selectedAlphanumericValues, setSelectedAlphanumericValues] = useState<
    Array<{
      field: string;
      values: Array<string>;
    }>
  >([]);
  const [selectedNumericField, setSelectedNumericField] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState<
    'boost' | 'bury' | 'include' | 'exclude'
  >('boost');
  const [selectedAttributeType, setSelectedAttributeType] = useState<
    'numeric' | 'alphanumeric'
  >(isEditMode ? 'alphanumeric' : 'numeric');

  const [weight, setWeight] = useState(100);

  useEffect(() => {
    if (isEditMode && editData) {
      setSelectedOperation(editData.operation);

      switch (editData.type) {
        case 'numericBoostBury':
          setModalStep(1);
          setSelectedAttributeType('numeric');
          setSelectedNumericField(editData.field.field);
          setWeight(editData.weight);
          break;
        case 'alphanumericBoostBury':
          setModalStep(2);
          setSelectedAttributeType('alphanumeric');
          setSelectedAlphanumericValues(editData.fields);
          setWeight(editData.weight);
          break;
        case 'alphanumericIncludeExclude':
          setModalStep(2);
          setSelectedAttributeType('alphanumeric');
          setSelectedAlphanumericValues(editData.fields);
          break;
      }
    }
  }, [isEditMode, alphanumericAttributes, editData]);

  return (
    <ModalContainer>
      <ModalSide>
        <SelectedAttribute data-testid="Selected Attribute">
          {selectedAttributeType === 'numeric' && !!selectedNumericField && (
            <NumericAttribute
              operation={selectedOperation}
              name={selectedNumericField}
              isEditMode
              weight={weight}
              setWeight={setWeight}
            />
          )}
          {selectedAttributeType === 'alphanumeric' &&
            !!selectedAlphanumericValues.length && (
              <AlphanumericAttribute
                operation={selectedOperation}
                fields={selectedAlphanumericValues}
                isEditMode
                weight={weight}
                setWeight={setWeight}
                canEditWeight={
                  selectedOperation === 'boost' || selectedOperation === 'bury'
                }
              />
            )}
        </SelectedAttribute>
      </ModalSide>

      <ModalRightSide>
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

        <StepContent stepIndex={0} currentStep={modalStep}>
          <ModalSection>
            <Label isStrong as="h4">
              Choose attribute type
            </Label>
          </ModalSection>

          <ModalSection>
            <ModalButton as="button" isStrong onClick={() => setModalStep(1)}>
              Numeric attributes
            </ModalButton>
          </ModalSection>

          <ModalSection>
            <ModalButton as="button" isStrong onClick={() => setModalStep(2)}>
              Product description attributes
            </ModalButton>
          </ModalSection>
        </StepContent>

        <StepContent stepIndex={1} currentStep={modalStep}>
          {!isEditMode && (
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
          )}

          <ModalSection>
            <Label isStrong>Numeric Attributes</Label>
            <Text>
              Select one numeric attribute below to boost linearly (larger the
              value, stronger the boost). Attributes are aggregated from the
              account level
            </Text>
            <Filters>
              <OperationSelector
                hasIncludeExclude={false}
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
                  value={numericSearchValue}
                  onChange={(e) => setNumericSearchValue(e.target.value)}
                />
              </SearchWrapper>
            </Filters>
          </ModalSection>

          <AttributeSelection data-testid="modal numeric attributes list">
            <ModalAttributeHeader>
              <Label isStrong>Relevant attributes</Label>
            </ModalAttributeHeader>
            {numericAttributes.filter(
              (attribute: MerchandisingAttributeResponseItem) =>
                attribute.name
                  .toLowerCase()
                  .includes(numericSearchValue.toLowerCase())
            ).length > 0 ? (
              <RadioButtons
                hasDivider
                isBold
                values={numericAttributes
                  .filter((attribute: MerchandisingAttributeResponseItem) =>
                    attribute.name
                      .toLowerCase()
                      .includes(numericSearchValue.toLowerCase())
                  )
                  .map((attribute: MerchandisingAttributeResponseItem) => ({
                    name: attribute.name,
                    isSelected: selectedNumericField === attribute.name,
                  }))}
                onSelect={(name) => {
                  setSelectedNumericField(name);
                  setSelectedAttributeType('numeric');
                }}
              />
            ) : (
              <Text style={{ padding: spacing(2) }}>0 Results</Text>
            )}
          </AttributeSelection>
        </StepContent>

        <StepContent stepIndex={2} currentStep={modalStep}>
          {!isEditMode && (
            <ModalSection>
              <PreviousStep
                as="button"
                isStrong
                onClick={() => {
                  setSelectedAlphanumericValues([]);
                  setSelectedNumericField('');
                  setModalStep(0);
                  setSelectedOperation('boost');
                }}
              >
                Back
              </PreviousStep>
            </ModalSection>
          )}

          <ModalSection>
            <Label isStrong as="h4">
              Product description attributes
            </Label>
            <Text>Attributes are aggregated from the account level</Text>
            <Filters>
              <OperationSelector
                hasIncludeExclude
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
                  onChange={(e) => setAlphanumericSearchValue(e.target.value)}
                />
              </SearchWrapper>
            </Filters>
          </ModalSection>

          <AttributeSelection
            data-testid="modal alphanumeric attributes list"
            style={{ maxHeight: '290px' }}
          >
            <ModalAttributeHeader>
              <Label isStrong>Relevant attributes</Label>
            </ModalAttributeHeader>
            {alphanumericAttributes
              .filter((attribute: MerchandisingAttributeResponseItem) =>
                attribute.name
                  .toLowerCase()
                  .includes(alphanumericSearchValue.toLowerCase())
              )
              .map((attribute: MerchandisingAttributeResponseItem) => (
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
        </StepContent>

        <StepContent stepIndex={3} currentStep={modalStep}>
          <ModalSection>
            <PreviousStep
              aria-label="Move back to step 2"
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
                value={alphanumericFilterValue}
                onChange={(e) => setAlphanumericFilterValue(e.target.value)}
              />
            </SearchWrapper>
          </ModalSection>

          <AttributeSelection style={{ maxHeight: '360px' }}>
            <ModalAttributeHeader>
              <Label isStrong>Current matching attribute values</Label>
            </ModalAttributeHeader>
            <div data-testid="Selected attributes">
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
                      .includes(alphanumericFilterValue.toLowerCase())
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
          </AttributeSelection>
        </StepContent>

        <ModalFooter>
          <Button
            onClick={() => {
              onCancel();
            }}
            isInline
          >
            Cancel
          </Button>
          {(!!selectedNumericField.length ||
            !!selectedAlphanumericValues.length) && (
            <Button
              onClick={() => {
                const attribute =
                  selectedAttributeType === 'alphanumeric'
                    ? {
                        fields: selectedAlphanumericValues,
                        weight,
                      }
                    : {
                        field: selectedNumericField,
                        weight,
                      };

                onSelect({
                  attribute,
                  change: isEditMode ? 'modify' : 'add',
                  operation: selectedOperation,
                  type: selectedAttributeType,
                });
              }}
              isInline
              theme="primary"
            >
              Done
            </Button>
          )}
        </ModalFooter>
      </ModalRightSide>
    </ModalContainer>
  );
};

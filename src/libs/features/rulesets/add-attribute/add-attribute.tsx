import { useEffect, useReducer, useState } from 'react';

import type {
  MerchandisingAttributeResponseItem,
  MerchandisingAttributesResponse,
} from '@/libs/api';
import { Button, Typography } from '@/libs/components';
import { Checkboxes } from '@/libs/components/checkboxes/checkboxes';
import { OperationSelector } from '@/libs/components/operation-selector/operation-selector';
import { RadioButtons } from '@/libs/components/radio-buttons/radio-buttons';
import { AlphanumericAttribute } from '@/libs/components/ruleset-attributes/alphanumeric-attribute';
import { NumericAttribute } from '@/libs/components/ruleset-attributes/numeric-attribute';
import { Search } from '@/libs/components/search/search';
import type { AttributeEdit, RulesetAttribute } from '@/libs/components/types';
import { addAttributeReducer } from '@/libs/stores/ruleset/add-attribute-reducer';

import styles from './add-attribute.module.css';

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
      <span className={styles.styledNumber} data-is-active={isActive}>
        <Typography as="span" isStrong={isActive} variant="bodySmall">
          {number}
        </Typography>
      </span>
      <Typography isStrong={isActive} variant="bodySmall">
        {text}
      </Typography>
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
}) => {
  const stepOffset = currentStep - stepIndex;

  return (
    <div
      className={styles.modalContent}
      data-step-offset={stepOffset}
      {...(currentStep !== stepIndex && { inert: true })}
    >
      {children}
    </div>
  );
};

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
  const [numericSearchValue, setNumericSearchValue] = useState('');
  const [alphanumericSearchValue, setAlphanumericSearchValue] = useState('');
  const [alphanumericFilterValue, setAlphanumericFilterValue] = useState('');

  const [state, dispatch] = useReducer(addAttributeReducer, {
    modalStep: 0,
    selectedAttributeType: isEditMode ? 'alphanumeric' : 'numeric',
    selectedOperation: 'boost',
    weight: 100,
    selectedNumericField: '',
    selectedAlphanumericValues: [],
    alphanumericField: '',
    alphanumericAttributeValues: [],
  });

  const {
    modalStep,
    selectedAttributeType,
    selectedOperation,
    weight,
    selectedNumericField,
    selectedAlphanumericValues,
    alphanumericField,
    alphanumericAttributeValues,
  } = state;

  useEffect(() => {
    if (isEditMode && editData) {
      dispatch({ type: 'initialize', payload: editData });
    }
  }, [isEditMode, editData]);

  return (
    <div className={styles.modalContainer}>
      <section className={styles.modalSide} data-side="left">
        <div
          className={styles.selectedAttribute}
          data-testid="Selected Attribute"
        >
          {selectedAttributeType === 'numeric' && !!selectedNumericField && (
            <NumericAttribute
              operation={selectedOperation}
              name={selectedNumericField}
              isEditMode
              weight={weight}
              setWeight={(w) => dispatch({ type: 'setWeight', payload: w })}
            />
          )}
          {selectedAttributeType === 'alphanumeric' &&
            !!selectedAlphanumericValues.length && (
              <AlphanumericAttribute
                operation={selectedOperation}
                fields={selectedAlphanumericValues}
                isEditMode
                weight={weight}
                setWeight={(w) => dispatch({ type: 'setWeight', payload: w })}
                canEditWeight={
                  selectedOperation === 'boost' || selectedOperation === 'bury'
                }
              />
            )}
        </div>
      </section>

      <section className={styles.modalSide} data-side="right">
        <div className={styles.modalSection}>
          <div className={styles.modalHeader}>
            <SectionLabel
              number={1}
              text="Choose type"
              isActive={modalStep === 0}
            />
            <span className={styles.divider} />
            <SectionLabel
              number={2}
              text="Choose value"
              isActive={modalStep !== 0}
            />
          </div>
        </div>

        <StepContent stepIndex={0} currentStep={modalStep}>
          <div className={styles.modalSection}>
            <Typography isStrong as="h2" variant="bodySmall">
              Choose attribute type
            </Typography>
          </div>

          <div className={styles.modalSection}>
            <Button
              appearance="plain"
              className={styles.modalButton}
              onClick={() => dispatch({ type: 'goToStep', payload: 1 })}
              type="button"
            >
              <Typography isStrong as="span" variant="bodySmall">
                Numeric attributes
              </Typography>
            </Button>
          </div>
          <div className={styles.modalSection}>
            <Button
              appearance="plain"
              className={styles.modalButton}
              type="button"
              onClick={() => dispatch({ type: 'goToStep', payload: 2 })}
            >
              <Typography isStrong as="span" variant="bodySmall">
                Product description attributes
              </Typography>
            </Button>
          </div>
        </StepContent>

        <StepContent stepIndex={1} currentStep={modalStep}>
          {!isEditMode && (
            <div className={styles.modalSection}>
              <Button
                appearance="plain"
                className={styles.step}
                type="button"
                data-step-type="previous"
                onClick={() => dispatch({ type: 'goBackFromNumeric' })}
              >
                <Typography isStrong as="span" variant="bodySmall">
                  Back
                </Typography>
              </Button>
            </div>
          )}

          <div className={styles.modalSection}>
            <Typography isStrong variant="bodySmall">
              Numeric Attributes
            </Typography>
            <Typography variant="bodySmall">
              Select one numeric attribute below to boost linearly (larger the
              value, stronger the boost). Attributes are aggregated from the
              account level
            </Typography>
            <div className={styles.filters}>
              <OperationSelector
                hasIncludeExclude={false}
                selectedOperation={selectedOperation}
                setSelectedOperation={(op) =>
                  dispatch({ type: 'setOperation', payload: op })
                }
              />
              <div className={styles.searchWrapper}>
                <label htmlFor="filerNumericAttributes">
                  Filter numeric attributes
                </label>
                <Search
                  name="Filter numeric attributes"
                  id="filerNumericAttributes"
                  value={numericSearchValue}
                  onChange={(e) => setNumericSearchValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            className={styles.attributeSelection}
            data-testid="modal numeric attributes list"
          >
            <div className={styles.attributeHeader}>
              <Typography isStrong variant="bodySmall">
                Relevant attributes
              </Typography>
            </div>
            {numericAttributes.filter(
              (attribute: MerchandisingAttributeResponseItem) =>
                attribute.name
                  .toLowerCase()
                  .includes(numericSearchValue.toLowerCase())
            ).length > 0 ? (
              <RadioButtons
                hasDivider
                isBold
                size="small"
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
                onSelect={(name) =>
                  dispatch({ type: 'selectNumericField', payload: name })
                }
              />
            ) : (
              <div className={styles.noResults}>
                <Typography as="span" variant="bodySmall">
                  0 Results
                </Typography>
              </div>
            )}
          </div>
        </StepContent>

        <StepContent stepIndex={2} currentStep={modalStep}>
          {!isEditMode && (
            <div className={styles.modalSection}>
              <Button
                appearance="plain"
                className={styles.step}
                type="button"
                data-step-type="previous"
                onClick={() =>
                  dispatch({ type: 'goBackFromAlphanumericAttributes' })
                }
              >
                <Typography isStrong as="span" variant="bodySmall">
                  Back
                </Typography>
              </Button>
            </div>
          )}

          <div className={styles.modalSection}>
            <Typography isStrong variant="bodySmall">
              Product description attributes
            </Typography>
            <Typography variant="bodySmall">
              Attributes are aggregated from the account level
            </Typography>
            <div className={styles.filters}>
              <OperationSelector
                hasIncludeExclude
                selectedOperation={selectedOperation}
                setSelectedOperation={(op) =>
                  dispatch({ type: 'setOperation', payload: op })
                }
              />
              <div className={styles.searchWrapper}>
                <label htmlFor="filerAlphanumericAttributes">
                  Filter alphanumeric attributes
                </label>
                <Search
                  name="Filter alphanumeric attributes"
                  id="filerAlphanumericAttributes"
                  value={alphanumericSearchValue}
                  onChange={(e) => setAlphanumericSearchValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div
            className={styles.attributeSelection}
            data-testid="modal alphanumeric attributes list"
            data-height="290"
          >
            <div className={styles.attributeHeader}>
              <Typography isStrong variant="bodySmall">
                Relevant attributes
              </Typography>
            </div>
            {alphanumericAttributes
              .filter((attribute: MerchandisingAttributeResponseItem) =>
                attribute.name
                  .toLowerCase()
                  .includes(alphanumericSearchValue.toLowerCase())
              )
              .map((attribute: MerchandisingAttributeResponseItem) => (
                <div className={styles.modalSection} key={attribute.name}>
                  <Button
                    appearance="plain"
                    className={styles.step}
                    type="button"
                    onClick={() => {
                      // istanbul ignore next
                      if (!attribute.values) return;
                      dispatch({
                        type: 'selectAlphanumericField',
                        payload: {
                          field: attribute.name,
                          values: attribute.values.map((value) => value.value),
                        },
                      });
                    }}
                    data-step-type="next"
                  >
                    <Typography isStrong as="span" variant="bodySmall">
                      {attribute.name}
                    </Typography>
                  </Button>
                </div>
              ))}
          </div>
        </StepContent>

        <StepContent stepIndex={3} currentStep={modalStep}>
          <div className={styles.modalSection}>
            <Button
              appearance="plain"
              className={styles.step}
              type="button"
              data-step-type="previous"
              aria-label="Move back to step 2"
              onClick={() => dispatch({ type: 'goBackFromAlphanumericValues' })}
            >
              <Typography isStrong as="span" variant="bodySmall">
                {alphanumericField}
              </Typography>
            </Button>

            <div className={styles.count}>
              <Typography variant="bodySmall">
                Showing: {alphanumericAttributeValues.length}
              </Typography>
            </div>

            <div className={styles.searchWrapper}>
              <label htmlFor="filerSelectedAttributes">
                Filter selected attributes
              </label>
              <Search
                name="Filter selected attributes"
                id="filerSelectedAttributes"
                value={alphanumericFilterValue}
                onChange={(e) => setAlphanumericFilterValue(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.attributeSelection} data-height="350">
            <div className={styles.attributeHeader}>
              <Typography isStrong variant="bodySmall">
                Current matching attribute values
              </Typography>
            </div>
            <div data-testid="Selected attributes">
              <Checkboxes
                onSelect={(isSelected, name) =>
                  dispatch({
                    type: 'toggleAlphanumericValue',
                    payload: { name, isSelected },
                  })
                }
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
          </div>
        </StepContent>

        <div className={styles.modalFooter}>
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
        </div>
      </section>
    </div>
  );
};

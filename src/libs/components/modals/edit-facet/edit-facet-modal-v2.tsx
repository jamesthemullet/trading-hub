import styled from '@emotion/styled';
import { useReducer, useState } from 'react';
import { Modal, Skeleton } from '@mantine/core';

import { ReturnedGlobalFacet } from '@/libs/api';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { Button } from '@/libs/components/buttons/button/button';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { Search } from '@/libs/components/search/search';
import {
  FacetAttributeValuesTableRow,
  TableCol,
  TableHeading,
} from '@/libs/components/table/table.styles';
import { ErrorMessage } from '@/libs/components/typography/typography.styles';
import { Header3, Text } from '@/libs/components/typography/typography.styles';
import { color } from '@/libs/components/utils/constants';
import { spacing } from '@/libs/components/utils/spacing';
import { useGlobalFacetUpdate } from '@/libs/hooks/global/facets/use-global-facet-update';
import { useCheckMergeNameUnique } from '@/libs/hooks/use-check-merge-name-unique';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Image from 'next/image';

import {
  HeadingContainer,
  ModalAttributesTable,
  ModalStickyHeader,
} from '../modal.styles';
import { facetReducer } from './facet-reducer';
import { AttributeRowDisplayValue } from './types';
import { useAttributeValuesRowsSelector } from './use-attribute-values-rows-selector';

const Col = styled(TableCol)`
  padding: 0;
`;

const FlexColumnCol = styled(Col)`
  display: flex;
  flex-direction: column;
`;

const MODAL_WIDTH = 1150;

const ModalContainer = styled.div`
  height: 100%;
  min-width: 860px;
  display: flex;
  flex-direction: column;
`;

const AttributesModalHeader = styled(ModalStickyHeader)`
  padding: ${spacing(3)};
  padding-bottom: 0;
`;

const BodyContainer = styled.div`
  margin: 0 ${spacing(3)};
`;

const OrderArrowsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: ${spacing(12)};
  margin-right: ${spacing(2)};
`;
const MergeAndSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${spacing(2)};
  padding: ${spacing(2)} 0;
  p {
    flex: 80;
  }
  button {
    flex: 20;
  }
  div {
    flex: 40;
  }
`;

const AttributeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(2)};
`;

const ModalFooter = styled.div`
  background-color: #fff;
  position: sticky;
  bottom: 0;
  width: 100%;
  border-top: solid 1px ${color.grey};
  padding: ${spacing(1)};
  display: flex;
  justify-content: flex-end;
  gap: ${spacing(2)};
  button {
    width: 160px;
  }
`;

const MergedValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing(1)};
`;

const RemoveMergedFacet = styled.button`
  background: url('/trading-hub/asset/icon-close-black.svg');
  width: 18px;
  height: 18px;
  display: inline-block;
  border: none;
`;

const StyledError = styled(Text)`
  color: ${color.saleRed};
  margin-top: ${spacing(0.5)};
`;

const SkeletonRow = styled(Skeleton)`
  width: 100%;
  height: 75px;
  margin-bottom: ${spacing(1)};
`;

const defaultMergedDisplayValue = 'Name your merge';

const EDITFACETVALUESMODALCOLUMNS: {
  label: string | null;
}[] = [
  { label: null },
  {
    label: 'Attribute',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Position Set',
  },
  {
    label: 'Actions',
  },
];

export const EditFacetModalV2 = ({
  onClose,
  onSave,
  facet,
  mergeEnabled = true,
  removeFacetValueFromMergeGroupEnabled = true,
  saveButtonLabel = 'Save',
  category,
  displayValueEditEnabled = true,
}: {
  onClose: () => void;
  onSave: (facet: ReturnedGlobalFacet) => void;
  facet: ReturnedGlobalFacet;
  mergeEnabled?: boolean;
  removeFacetValueFromMergeGroupEnabled?: boolean;
  displayValueEditEnabled?: boolean;
  saveButtonLabel?: string;
  category: string | undefined;
}) => {
  const [facetLocalState, dispatch] = useReducer(facetReducer, facet);
  const [selectedFacetAttributeValues, setSelectedFacetAttributes] = useState<
    string[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rowError, setRowError] = useState<{
    id: string;
    error: string;
  } | null>(null);
  const [disallowedValues, setDisallowedValues] = useState<string[]>([
    ...(facet.merged ? facet.merged.map((val) => val.displayValue!) : []),
    defaultMergedDisplayValue,
  ]);

  const {
    attributeValuesState,
    error: attributeValuesError,
    isLoading,
  } = useAttributeValuesRowsSelector(facetLocalState, searchQuery, category);

  const { checkMergeNameUnique } = useCheckMergeNameUnique();

  const attributeToSelectionMap = selectedFacetAttributeValues.reduce(
    (acc, selection) => {
      // eslint-disable-next-line functional/immutable-data
      acc[selection] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const { error: updateGlobalFacetError } = useGlobalFacetUpdate();

  const isSaveDisabled =
    facetLocalState.merged?.find(
      (merge) => merge.displayValue === defaultMergedDisplayValue
    ) !== undefined;

  const hasSelectedAllRows = attributeValuesState.every(
    (attribute) => attributeToSelectionMap[attribute.displayValue]
  );

  const isInDisplayNameEditMode = attributeValuesState.some(
    (attribute) => attribute.displayValue === defaultMergedDisplayValue
  );

  const handleSave = async () => {
    onSave(facetLocalState);
  };

  const handleMerge = () => {
    setSelectedFacetAttributes([]);
    dispatch({
      type: 'MERGE_SELECTED_ATTRIBUTE_VALUES',
      payload: {
        selectedFacetAttributeValues,
        displayValue: defaultMergedDisplayValue,
      },
    });
  };

  const handleOrderChange =
    (attributeState: AttributeRowDisplayValue) => (newOrder: string) => {
      const newAttribute = newOrder === 'included' ? 'boosted' : 'excluded';
      dispatch({
        type: 'CHANGE_DISPLAY_TYPE',
        payload: {
          id: attributeState.id,
          newDisplayType: newAttribute,
        },
      });
    };

  const handleSelection = (attributeState: AttributeRowDisplayValue) => () => {
    setSelectedFacetAttributes((prev) => {
      const isSelected = prev.some(
        (selected) => selected === attributeState.displayValue
      );
      if (isSelected) {
        return prev.filter(
          (selected) => selected !== attributeState.displayValue
        );
      }
      return [...prev, attributeState.displayValue];
    });
  };

  const handleSelectAllRows = () => {
    setSelectedFacetAttributes(
      hasSelectedAllRows
        ? []
        : attributeValuesState.map((attribute) => attribute.displayValue)
    );
  };

  const handleEditDisplayValue =
    (attributeState: AttributeRowDisplayValue) => async (newValue: string) => {
      const trimmedNewValue = newValue.trim();
      if (
        trimmedNewValue === defaultMergedDisplayValue ||
        trimmedNewValue === ''
      ) {
        setRowError({
          id: attributeState.id,
          error: 'Please name your merge to continue',
        });
        return;
      }
      if (trimmedNewValue === attributeState.displayValue) {
        return;
      }
      const { isUniqueValue } = await checkMergeNameUnique({
        facetId: facet.id,
        searchQuery: trimmedNewValue,
        categoryId: category,
        localAttributeValues: attributeValuesState.map(
          (attr) => attr.displayValue
        ),
        exceptions:
          attributeState.mergeType === 'merged'
            ? attributeState.mergedValues
            : undefined,
      });
      const isSameNameAsAnotherMergeGroup = facetLocalState.merged?.some(
        (mergeGroup) => mergeGroup.displayValue === trimmedNewValue
      );
      if (isUniqueValue && !isSameNameAsAnotherMergeGroup) {
        setRowError(null);
        dispatch({
          type: 'RENAME_DISPLAY_VALUE',
          payload: {
            id: attributeState.id,
            newDisplayValue: trimmedNewValue,
          },
        });
      } else {
        setDisallowedValues((prev) => [...prev, trimmedNewValue]);
        setRowError({
          id: attributeState.id,
          error: `${trimmedNewValue} is not a unique value`,
        });
      }
    };

  const handleRemoveMergedFacet =
    (mergeGroupDisplayName: string, attributeToRemove: string) => () => {
      dispatch({
        type: 'REMOVE_MERGED_VALUE',
        payload: {
          mergeGroupDisplayName,
          attributeToRemove,
        },
      });
    };

  const handleMoveRowUp = (attributeState: AttributeRowDisplayValue) => () => {
    dispatch({
      type: 'MOVE_BOOSTED_ROW_UP',
      payload: { id: attributeState.id },
    });
  };

  const handleMoveRowDown =
    (attributeState: AttributeRowDisplayValue) => () => {
      dispatch({
        type: 'MOVE_BOOSTED_ROW_DOWN',
        payload: { id: attributeState.id },
      });
    };

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const Row = (attributeState: AttributeRowDisplayValue, index: number) => {
    const { id, displayValue, displayType, mergeType, meta } = attributeState;
    const isSelected = attributeToSelectionMap[displayValue] ?? false;

    return (
      <FacetAttributeValuesTableRow
        key={`attribute-${displayValue}`}
        isPinned={displayType === 'boosted'}
        isExcluded={displayType === 'excluded'}
        data-testid="rows"
        aria-label={`attribute ${index} ${displayValue}`}
      >
        <Col aria-label={`select for ${displayValue}`}>
          {mergeEnabled && (
            <input
              type="checkbox"
              disabled={isInDisplayNameEditMode}
              checked={isSelected}
              onChange={handleSelection(attributeState)}
              aria-label={`Select ${displayValue} to merge`}
            />
          )}
        </Col>
        <Col>
          <AttributeWrapper>
            <Image
              width={20}
              height={20}
              src="/trading-hub/asset/icon-attribute.svg"
              alt=""
            />
            {mergeType === 'merged' ? (
              <div>
                <Text isStrong>Merged Value Group</Text>

                {attributeState.mergedValues.map((mergedId, index) => {
                  return (
                    <MergedValue key={`${index}-${displayValue}`}>
                      <Text aria-label={`Merged value ${mergedId} label`}>
                        {mergedId}
                      </Text>{' '}
                      {removeFacetValueFromMergeGroupEnabled && (
                        <RemoveMergedFacet
                          onClick={handleRemoveMergedFacet(
                            displayValue,
                            mergedId
                          )}
                          aria-label={`Remove merged facet for ${mergedId}`}
                          disabled={isInDisplayNameEditMode}
                        />
                      )}
                    </MergedValue>
                  );
                })}
              </div>
            ) : (
              <Text>{id}</Text>
            )}
          </AttributeWrapper>
        </Col>

        <FlexColumnCol aria-label={`display-value for ${displayValue}`}>
          {displayValueEditEnabled && (
            <EditableLabel
              displayValue={displayValue}
              onDisplayValueChange={handleEditDisplayValue(attributeState)}
              shouldOpenFromParent={displayValue === defaultMergedDisplayValue}
              error={
                rowError && rowError.id === id ? rowError.error : undefined
              }
              disallowedValues={disallowedValues}
            />
          )}
          {!displayValueEditEnabled && <Text>{displayValue}</Text>}
          {rowError && rowError.id === id && (
            <StyledError>{rowError.error}</StyledError>
          )}
        </FlexColumnCol>

        <Col>
          {displayType === 'boosted' && (
            <OrderArrowsContainer>
              <ArrowButton
                direction="up"
                aria-label={`Move ${displayValue} row up`}
                onClick={handleMoveRowUp(attributeState)}
                isDisabled={meta.isBeginningOfDisplayTypeGroup}
              />

              <ArrowButton
                direction="down"
                aria-label={`Move ${displayValue} row down`}
                onClick={handleMoveRowDown(attributeState)}
                isDisabled={meta.isEndOfDisplayTypeGroup}
              />
            </OrderArrowsContainer>
          )}
        </Col>

        <Col aria-label={`order for ${displayValue}`}>
          <FacetOrderDropdown
            status={
              {
                boosted: 'included' as const,
                default: undefined,
                excluded: 'excluded' as const,
              }[displayType]
            }
            onChange={handleOrderChange(attributeState)}
            attribute={
              mergeType === 'merged'
                ? attributeState.mergedValues[0]
                : displayValue
            }
          />
        </Col>
      </FacetAttributeValuesTableRow>
    );
  };

  return (
    <Modal.Root
      opened={true}
      onClose={onClose}
      centered
      size={MODAL_WIDTH}
      padding={0}
    >
      <Modal.Overlay blur={3} />
      <Modal.Content>
        <Modal.Body>
          <ModalContainer>
            <AttributesModalHeader>
              <HeadingContainer>
                <Text isStrong as={Header3}>
                  Facet value settings of: {facet.displayValue}
                </Text>
              </HeadingContainer>

              {attributeValuesError && (
                <ErrorMessage>
                  Error whilst retrieving values: {attributeValuesError}
                </ErrorMessage>
              )}

              {updateGlobalFacetError && (
                <ErrorMessage>
                  Error whilst updating facet: {updateGlobalFacetError}
                </ErrorMessage>
              )}

              <MergeAndSearchContainer>
                <Text isStrong>All values listed</Text>
                {mergeEnabled && (
                  <Button
                    isDisabled={selectedFacetAttributeValues.length < 2}
                    onClick={handleMerge}
                  >
                    Merge ({selectedFacetAttributeValues.length})
                  </Button>
                )}
                <Search onChange={handleSearch} />
              </MergeAndSearchContainer>

              <ModalAttributesTable>
                <FacetAttributeValuesTableRow>
                  {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
                    <Col key={`add-facet-modal-column-${label}`}>
                      {label ? (
                        <TableHeading as="p" isStrong={true}>
                          {label}
                        </TableHeading>
                      ) : (
                        <Col>
                          {mergeEnabled && (
                            <input
                              type="checkbox"
                              aria-label="Select all facet attributes"
                              checked={hasSelectedAllRows}
                              onChange={handleSelectAllRows}
                              disabled={isInDisplayNameEditMode}
                            />
                          )}
                        </Col>
                      )}
                    </Col>
                  ))}
                </FacetAttributeValuesTableRow>
              </ModalAttributesTable>
            </AttributesModalHeader>

            <BodyContainer>
              {isLoading ? (
                attributeValuesState.map((attribute) => (
                  <SkeletonRow
                    key={`attribute-value-skeleton-${attribute.displayValue}`}
                    aria-label={`attribute-value-skeleton`}
                  />
                ))
              ) : (
                <ModalAttributesTable>
                  {attributeValuesState.map(Row)}
                </ModalAttributesTable>
              )}

              <FilteredResultsPanel
                filteredFacets={attributeValuesState.length}
              />
            </BodyContainer>
          </ModalContainer>
        </Modal.Body>

        <ModalFooter>
          <Button onClick={onClose} aria-label="Close attributes modal">
            Cancel
          </Button>{' '}
          <Button
            onClick={handleSave}
            isDisabled={isSaveDisabled}
            aria-label="Save changes to attributes"
          >
            {saveButtonLabel}
          </Button>
        </ModalFooter>
      </Modal.Content>
    </Modal.Root>
  );
};

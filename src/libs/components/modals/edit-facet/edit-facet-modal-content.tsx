import type { Dispatch } from 'react';
import { useEffect, useState } from 'react';

import type { CountryCode, ReturnedGlobalFacet } from '@/libs/api';
import {
  ErrorMessage,
  Header3,
  Text,
} from '@/libs/components/typography/typography.styles';
import { useCheckMergeNameUnique, useGlobalFacetUpdate } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Image from 'next/image';

import { ArrowButton } from '../../buttons/button/arrow-button';
import { Button } from '../../buttons/button/button';
import { FacetOrderDropdown } from '../../dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '../../editable-label/editable-label';
import { FilteredResultsPanel } from '../../filtered-results-panel/filtered-results-panel';
import { Search } from '../../search/search';
import {
  FacetAttributeValuesTableRow,
  TableHeading,
} from '../../table/table.styles';
import { HeadingContainer, ModalAttributesTable } from '../modal.styles';
import {
  AttributesModalHeader,
  AttributeWrapper,
  BodyContainer,
  Col,
  FlexColumnCol,
  MergeAndSearchContainer,
  MergedValue,
  OrderArrowsContainer,
  RemoveMergedFacet,
  SkeletonRow,
  StyledError,
} from './edit-facet-modal-content.styles';
import type { AttributeRowDisplayValue } from './types';
import { useAttributeValuesRowsSelector } from './use-attribute-values-rows-selector';

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

type MergeSelectedAttributes = {
  selectedFacetAttributeValues: string[];
  displayValue: string;
};

type RenameDisplayValue = {
  id: string;
  newDisplayValue: string;
};

type removeMergedValue = {
  mergeGroupDisplayName: string;
  attributeToRemove: string;
};

type moveBoostedRowUp = {
  id: string;
};

type moveBoostedRowDown = {
  id: string;
};

type changeDisplayType = {
  id: string;
  newDisplayType: 'boosted' | 'excluded';
};

export type Action =
  | {
      type: 'MERGE_SELECTED_ATTRIBUTE_VALUES';
      payload: MergeSelectedAttributes;
    }
  | { type: 'RENAME_DISPLAY_VALUE'; payload: RenameDisplayValue }
  | {
      type: 'REMOVE_MERGED_VALUE';
      payload: removeMergedValue;
    }
  | {
      type: 'MOVE_BOOSTED_ROW_UP';
      payload: moveBoostedRowUp;
    }
  | {
      type: 'MOVE_BOOSTED_ROW_DOWN';
      payload: moveBoostedRowDown;
    }
  | {
      type: 'CHANGE_DISPLAY_TYPE';
      payload: changeDisplayType;
    };

const EditModalFacetContent = ({
  facet,
  categories,
  countryCode,
  mergeEnabled,
  removeFacetValueFromMergeGroupEnabled,
  displayValueEditEnabled,
  defaultMergedDisplayValue,
  dispatch,
  handleDisableSaveButton,
}: {
  facet: ReturnedGlobalFacet;
  countryCode: CountryCode;
  mergeEnabled: boolean;
  removeFacetValueFromMergeGroupEnabled: boolean;
  displayValueEditEnabled: boolean;
  defaultMergedDisplayValue: string;
  dispatch: Dispatch<Action>;
  handleDisableSaveButton: (disable: boolean) => void;
  categories?: string[];
}) => {
  const [rowError, setRowError] = useState<{
    id: string;
    error: string;
  } | null>(null);

  const [selectedFacetAttributeValues, setSelectedFacetAttributes] = useState<
    string[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [disallowedValues, setDisallowedValues] = useState<string[]>([
    ...(facet.merged ? facet.merged.map((val) => val.displayValue!) : []),
    defaultMergedDisplayValue,
  ]);

  const {
    attributeValuesState,
    error: attributeValuesError,
    isLoading,
  } = useAttributeValuesRowsSelector(
    facet,
    searchQuery,
    countryCode,
    categories
  );

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
        categories,
        countryCode,
        localAttributeValues: attributeValuesState.map(
          (attr) => attr.displayValue
        ),
        exceptions:
          attributeState.mergeType === 'merged'
            ? attributeState.mergedValues
            : undefined,
      });

      const isSameNameAsAnotherMergeGroup = facet.merged?.some(
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

      setSelectedFacetAttributes((prev) => {
        return prev.map((selected) =>
          selected === attributeState.displayValue ? trimmedNewValue : selected
        );
      });
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

  const hasSelectedAllRows = attributeValuesState.every(
    (attribute) => attributeToSelectionMap[attribute.displayValue]
  );

  const isInDisplayNameEditMode = attributeValuesState.some(
    (attribute) => attribute.displayValue === defaultMergedDisplayValue
  );

  useEffect(() => {
    handleDisableSaveButton(isInDisplayNameEditMode);
  }, [isInDisplayNameEditMode, handleDisableSaveButton]);

  const Row = (attributeState: AttributeRowDisplayValue, index: number) => {
    const { id, displayValue, displayType, mergeType, meta } = attributeState;
    const isSelected = attributeToSelectionMap[displayValue] ?? false;

    return (
      <FacetAttributeValuesTableRow
        key={`attribute-${displayValue}`}
        isPinned={displayType === 'boosted'}
        isExcluded={displayType === 'excluded'}
        data-testid={`attribute ${index} ${displayValue}`}
      >
        <Col>
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
                      <Text data-testid={`Merged value ${mergedId} label`}>
                        {mergedId}
                      </Text>{' '}
                      {removeFacetValueFromMergeGroupEnabled &&
                        mergedId !== displayValue && (
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

        <FlexColumnCol>
          {displayValueEditEnabled ? (
            <EditableLabel
              displayValue={displayValue}
              onDisplayValueChange={handleEditDisplayValue(attributeState)}
              shouldOpenFromParent={displayValue === defaultMergedDisplayValue}
              error={
                rowError && rowError.id === id ? rowError.error : undefined
              }
              disallowedValues={disallowedValues}
              canCancelEdit
            />
          ) : (
            <Text>{displayValue}</Text>
          )}

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

        <Col>
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
    <>
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
              data-testid="attribute-value-skeleton"
              aria-busy="true"
            />
          ))
        ) : (
          <ModalAttributesTable>
            {attributeValuesState.map(Row)}
          </ModalAttributesTable>
        )}

        <FilteredResultsPanel filteredFacets={attributeValuesState.length} />
      </BodyContainer>
    </>
  );
};

export default EditModalFacetContent;

import type { Dispatch } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type {
  AttributeValuesResponse,
  CountryCode,
  ReturnedGlobalFacet,
} from '@/libs/api';
import {
  ErrorMessage,
  Header3,
  Text,
} from '@/libs/components/typography/typography.styles';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type { FacetDisplayType } from '@/libs/modules/facets-panel/facets-panel-reducer';

import { ArrowButton } from '../../buttons/button/arrow-button';
import { FacetOrderDropdown } from '../../dropdowns/facet-order-dropdown/facet-order-dropdown';
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
  SkeletonRow,
} from './edit-facet-modal-content.styles';
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

type moveBoostedRowUp = {
  id: string;
};

type moveBoostedRowDown = {
  id: string;
};

type changeDisplayType = {
  id: string;
  newDisplayType: 'boosted' | 'excluded' | 'default';
};

export type Action =
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

type FormattedRow = {
  displayName: string;
  attributes: string[];
  isMergeGroup: boolean;
};

const EditModalFacetContent = ({
  facet,
  categories,
  countryCode,
  dispatch,
}: {
  facet: ReturnedGlobalFacet;
  countryCode: CountryCode;
  mergeEnabled?: boolean;
  removeFacetValueFromMergeGroupEnabled: boolean;
  displayValueEditEnabled: boolean;
  defaultMergedDisplayValue: string;
  dispatch: Dispatch<Action>;
  handleDisableSaveButton: (disable: boolean) => void;
  categories?: string[];
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    attributeValues,
    attributeValuesState,
    error: attributeValuesError,
    isLoading,
  } = useAttributeValuesRowsSelector(
    facet,
    searchQuery,
    countryCode,
    categories
  );

  const nonBoostedExcludedValues = attributeValues.filter(
    ({ displayValue }) =>
      !facet.boosted?.includes(displayValue) &&
      !facet.excludedValues?.includes(displayValue)
  );
  const boostedValues = facet.boosted!.map((value) => ({
    displayValue: value,
  }));

  const excludedValues = facet.excludedValues!.map((value) => ({
    displayValue: value,
  }));

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const listValues = useCallback(
    (
      values: AttributeValuesResponse['values'],
      displayType: FacetDisplayType
    ) => {
      const rows: FormattedRow[] = [];

      values.map((value) => {
        const isInMergeGroup = facet.merged?.some((v) =>
          v.mergedValues?.includes(value.displayValue)
        );

        if (isInMergeGroup) {
          const mergeGroup = facet.merged?.filter((v) =>
            v.mergedValues?.includes(value.displayValue)
          )[0];

          const rowsIndex = rows.findIndex(
            (row) => row.displayName === mergeGroup?.displayValue
          );

          if (
            rowsIndex === -1 &&
            mergeGroup?.displayValue &&
            mergeGroup?.mergedValues
          ) {
            // eslint-disable-next-line functional/immutable-data
            rows.push({
              attributes: mergeGroup.mergedValues,
              displayName: mergeGroup.displayValue,
              isMergeGroup: true,
            });
          }
        } else {
          // eslint-disable-next-line functional/immutable-data
          rows.push({
            attributes: [value.displayValue],
            displayName: value.displayValue,
            isMergeGroup: false,
          });
        }
      });

      const filteredRows = rows.filter(
        (row) =>
          row.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.attributes.some((val) =>
            val.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );

      return filteredRows.map(
        ({ displayName, attributes, isMergeGroup }, index) => {
          return (
            <FacetAttributeValuesTableRow
              key={`${displayType}-${displayName}`}
              isPinned={displayType === 'included'}
              isExcluded={displayType === 'excluded'}
              data-testid={`${displayType} attribute ${index} ${displayName}`}
            >
              <Col />
              <Col>
                <AttributeWrapper>
                  {isMergeGroup ? (
                    <div>
                      <Text isStrong>Merged Value Group</Text>

                      {attributes.map((value, index) => (
                        <MergedValue
                          data-testid={`Merged value ${value} label`}
                          key={`${index}-${value}`}
                        >
                          <Text>{value}</Text>
                        </MergedValue>
                      ))}
                    </div>
                  ) : (
                    <Text>{attributes[0]}</Text>
                  )}
                </AttributeWrapper>
              </Col>

              <FlexColumnCol>
                <Text>{displayName}</Text>
              </FlexColumnCol>

              <Col>
                {displayType === 'included' && (
                  <OrderArrowsContainer>
                    <ArrowButton
                      direction="up"
                      aria-label={`Move ${displayName} row up`}
                      isDisabled={index === 0 || !!searchQuery}
                      onClick={() => {
                        dispatch({
                          type: 'MOVE_BOOSTED_ROW_UP',
                          payload: { id: displayName },
                        });
                      }}
                    />

                    <ArrowButton
                      direction="down"
                      aria-label={`Move ${displayName} row down`}
                      isDisabled={index === rows.length - 1 || !!searchQuery}
                      onClick={() => {
                        dispatch({
                          type: 'MOVE_BOOSTED_ROW_DOWN',
                          payload: { id: displayName },
                        });
                      }}
                    />
                  </OrderArrowsContainer>
                )}
              </Col>

              <Col>
                <FacetOrderDropdown
                  hasAlgoControl
                  status={displayType}
                  onChange={(newDisplayType: FacetDisplayType) => {
                    const displayTypeMapping = {
                      algoControl: 'default',
                      included: 'boosted',
                      excluded: 'excluded',
                    };

                    dispatch({
                      type: 'CHANGE_DISPLAY_TYPE',
                      payload: {
                        id: displayName,
                        // TODO refactor after fix
                        newDisplayType: displayTypeMapping[
                          newDisplayType
                        ] as changeDisplayType['newDisplayType'],
                      },
                    });
                  }}
                  attribute={displayName}
                />
              </Col>
            </FacetAttributeValuesTableRow>
          );
        }
      );
    },
    [dispatch, facet.merged, searchQuery]
  );

  const boostedValuesRows = useMemo(() => {
    return listValues(boostedValues, 'included');
  }, [boostedValues, listValues]);

  const defaultValuesRows = useMemo(() => {
    return listValues(nonBoostedExcludedValues, 'algoControl');
  }, [nonBoostedExcludedValues, listValues]);

  const excludedValuesRows = useMemo(() => {
    return listValues(excludedValues, 'excluded');
  }, [excludedValues, listValues]);

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

        <MergeAndSearchContainer>
          <Text isStrong>All values listed</Text>

          <Search onChange={handleSearch} />
        </MergeAndSearchContainer>

        <ModalAttributesTable>
          <FacetAttributeValuesTableRow>
            {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
              <Col key={`add-facet-modal-column-${label}`}>
                <TableHeading as="p" isStrong={true}>
                  {label}
                </TableHeading>
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
            {boostedValuesRows}

            {defaultValuesRows}

            {excludedValuesRows}
          </ModalAttributesTable>
        )}

        <FilteredResultsPanel filteredFacets={attributeValuesState.length} />
      </BodyContainer>
    </>
  );
};

export default EditModalFacetContent;

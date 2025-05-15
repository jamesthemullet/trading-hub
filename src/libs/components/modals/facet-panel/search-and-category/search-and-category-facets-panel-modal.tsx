import { useCallback, useMemo, useReducer, useState } from 'react';
import { Modal } from '@mantine/core';

import type {
  MerchandisingAttributeValuesResponse,
  MerchandisingCountryCode,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { Button } from '@/libs/components/buttons/button/button';
import { FilteredResultsPanel } from '@/libs/components/filtered-results-panel/filtered-results-panel';
import { Search } from '@/libs/components/search/search';
import {
  ErrorMessage,
  Header3,
  Text,
} from '@/libs/components/typography/typography.styles';
import { useGetFacetAttributeValues } from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';
import type { FacetDisplayType } from '@/libs/modules/facets-panel/facets-panel-reducer';

import { intersection, without } from 'lodash';

import { ArrowButton } from '../../../buttons/button/arrow-button';
import { FacetOrderDropdown } from '../../../dropdowns/facet-order-dropdown/facet-order-dropdown';
import {
  FacetAttributeValuesTableRow,
  TableHeading,
} from '../../../table/table.styles';
import {
  HeadingContainer,
  ModalAttributesTable,
  ModalContainer,
  ModalFooter,
} from '../../modal.styles';
import {
  AttributesModalHeader,
  AttributeWrapper,
  BodyContainer,
  Col,
  FlexColumnCol,
  MergeAndSearchContainer,
  OrderArrowsContainer,
  SkeletonRow,
} from './edit-facet-modal-content.styles';
import { facetReducer } from './facet-reducer';

const MODAL_WIDTH = 1150;

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

export const SearchAndCategoryFacetsPanelModal = ({
  onClose,
  onSave,
  facet,
  saveButtonLabel = 'Save',
  categories,
  countryCode,
  writeEnabled,
  searchTerms,
}: {
  onClose: () => void;
  onSave: (facet: MerchandisingRuleSetFacetConfigWithId) => void;
  facet: MerchandisingRuleSetFacetConfigWithId & { displayValue: string };
  countryCode: MerchandisingCountryCode;
  saveButtonLabel?: string;
  categories?: string[];
  writeEnabled: boolean;
  searchTerms?: string[];
}) => {
  const [isSaveDisabled] = useState(false);
  const processedFacet = useMemo(() => {
    const intersectedValues = intersection(facet.boosted, facet.excludedValues);

    const boosted = without(facet.boosted, ...intersectedValues);

    return {
      ...facet,
      ...(boosted.length > 0 && { boosted }),
    };
  }, [facet]);

  const [facetLocalState, dispatch] = useReducer(facetReducer, processedFacet);

  const handleSave = async () => {
    onSave(facetLocalState);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const {
    attributeValues,
    error: attributeValuesError,
    isLoading,
  } = useGetFacetAttributeValues({
    facetId: facet.id,
    query: searchQuery,
    categories,
    searchTerms,
    countryCode,
  });

  const algoControlValues = attributeValues
    .filter((value) => !facetLocalState.boosted!.includes(value.displayValue))
    .filter(
      (value) => !facetLocalState.excludedValues?.includes(value.displayValue)
    );
  const boostedValues = facetLocalState.boosted!.map((value) => ({
    displayValue: value,
  }));

  const excludedValues = attributeValues.filter((value) =>
    facetLocalState.excludedValues?.includes(value.displayValue)
  );

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  const listValues = useCallback(
    (
      values: MerchandisingAttributeValuesResponse['values'],
      displayType: FacetDisplayType
    ) => {
      const filteredRows = values.filter((row) =>
        row.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return filteredRows.map(({ displayValue }, index) => {
        return (
          <FacetAttributeValuesTableRow
            key={`${displayType}-${displayValue}`}
            isPinned={displayType === 'included'}
            isExcluded={displayType === 'excluded'}
            data-testid={`${displayType} attribute ${index} ${displayValue}`}
          >
            <Col />
            <Col>
              <AttributeWrapper>
                <Text>{displayValue}</Text>
              </AttributeWrapper>
            </Col>

            <FlexColumnCol>
              <Text data-testid={`Label for ${displayValue}`}>
                {displayValue}
              </Text>
            </FlexColumnCol>

            <Col>
              {displayType === 'included' && (
                <OrderArrowsContainer>
                  <ArrowButton
                    direction="up"
                    aria-label={`Move ${displayValue} row up`}
                    isDisabled={index === 0 || !!searchQuery}
                    onClick={() => {
                      dispatch({
                        type: 'MOVE_BOOSTED_ROW_UP',
                        payload: { id: displayValue },
                      });
                    }}
                  />

                  <ArrowButton
                    direction="down"
                    aria-label={`Move ${displayValue} row down`}
                    isDisabled={
                      index === filteredRows.length - 1 || !!searchQuery
                    }
                    onClick={() => {
                      dispatch({
                        type: 'MOVE_BOOSTED_ROW_DOWN',
                        payload: { id: displayValue },
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
                  dispatch({
                    type: 'CHANGE_DISPLAY_TYPE',
                    payload: {
                      id: displayValue,
                      newDisplayType,
                    },
                  });
                }}
                attribute={displayValue}
                writeEnabled={writeEnabled}
              />
            </Col>
          </FacetAttributeValuesTableRow>
        );
      });
    },
    [dispatch, searchQuery, writeEnabled]
  );

  const boostedValuesRows = useMemo(() => {
    return listValues(boostedValues, 'included');
  }, [boostedValues, listValues]);

  const defaultValuesRows = useMemo(() => {
    return listValues(algoControlValues, 'algoControl');
  }, [algoControlValues, listValues]);

  const excludedValuesRows = useMemo(() => {
    return listValues(excludedValues, 'excluded');
  }, [excludedValues, listValues]);

  return (
    <Modal.Root
      opened={true}
      onClose={onClose}
      centered
      size={MODAL_WIDTH}
      padding={0}
      role="dialog"
      aria-modal="true"
      aria-label="Edit facet values modal"
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
                attributeValues.map((attribute) => (
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

              <FilteredResultsPanel filteredFacets={attributeValues.length} />
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

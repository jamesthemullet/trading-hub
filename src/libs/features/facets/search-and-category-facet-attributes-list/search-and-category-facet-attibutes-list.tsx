import styled from '@emotion/styled';
import type { ActionDispatch } from 'react';
import { useCallback, useMemo } from 'react';

import type { MerchandisingAttributeValuesResponse } from '@/libs/api';
import { ArrowButton, CombinedDropdown, Text } from '@/libs/components';
import {
  AttributeWrapper,
  Col,
  FlexColumnCol,
  OrderArrowsContainer,
} from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { FacetAttributeValuesTableRow } from '@/libs/containers/shared/table/table.styles';
import type { FacetDisplayType } from '@/libs/modules/facet-list/facet-list';
import type { Action } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';
import { spacing } from '@/libs/utils/spacing';

const GlobalFacetAttributesListContainer = styled.div`
  margin: 0 ${spacing(3)};
`;

type SearchAndCategoryFacetAttributesListProps = {
  boostedValues: MerchandisingAttributeValuesResponse['values'];
  algoControlValues: MerchandisingAttributeValuesResponse['values'];
  excludedValues: MerchandisingAttributeValuesResponse['values'];
  dispatch: ActionDispatch<[action: Action]>;
  searchQuery: string;
  writeEnabled: boolean;
};

export const SearchAndCategoryFacetAttributesList = ({
  boostedValues,
  algoControlValues,
  excludedValues,
  dispatch,
  searchQuery,
  writeEnabled,
}: SearchAndCategoryFacetAttributesListProps) => {
  const listValues = useCallback(
    (
      values: MerchandisingAttributeValuesResponse['values'],
      displayType: FacetDisplayType
    ) => {
      const handleDisplayTypeChange = (
        newDisplayType: FacetDisplayType,
        displayValue: string
      ) => {
        dispatch({
          type: 'CHANGE_DISPLAY_TYPE',
          payload: {
            id: displayValue,
            newDisplayType,
          },
        });
      };

      const filteredRows = values?.filter((row) =>
        row.displayValue.toLowerCase().includes(searchQuery.toLowerCase())
      );

      return filteredRows?.map(({ displayValue }, index) => {
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
              <CombinedDropdown
                variant="facetOrder"
                hasAlgoControl
                onChange={(newDisplayType) => {
                  handleDisplayTypeChange(
                    newDisplayType as FacetDisplayType,
                    displayValue
                  );
                }}
                status={displayType}
                attribute={displayValue}
                writeEnabled={writeEnabled}
                ariaLabel="Select to set as included, excluded or algo control"
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
    <GlobalFacetAttributesListContainer>
      {boostedValuesRows}
      {defaultValuesRows}
      {excludedValuesRows}
    </GlobalFacetAttributesListContainer>
  );
};

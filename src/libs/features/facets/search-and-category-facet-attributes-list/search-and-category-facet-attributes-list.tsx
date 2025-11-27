import type { ActionDispatch } from 'react';
import { useCallback, useMemo } from 'react';

import type { MerchandisingAttributeValuesResponse } from '@/libs/api/generated/open-api';
import { ArrowButton, CombinedDropdown, Text } from '@/libs/components';
import {
  AttributeWrapper,
  Col,
  FlexColumnCol,
  OrderArrowsContainer,
} from '@/libs/components/edit-facet-modal-content/edit-facet-modal-content.styles';
import { FacetOrderInput } from '@/libs/components/facet-order-input/facet-order-input';
import {
  FacetAttributeValuesTableRow,
  TableHeading,
} from '@/libs/containers/shared/table/table.styles';
import { useFacetOrderInput } from '@/libs/hooks/use-facet-order-input';
import type { FacetDisplayType } from '@/libs/modules/facet-list/facet-list';
import type { Action } from '@/libs/stores/search-and-category/facet-attributes-page-reducer';

const EDITFACETVALUESMODALCOLUMNS: {
  label: string | null | false;
}[] = [
  { label: null },
  {
    label: 'Attribute',
  },
  {
    label: 'Ranking',
  },
  {
    label: 'Display name',
  },
  {
    label: '',
  },
  {
    label: 'Actions',
  },
];

type AttributeValueWithOrder = {
  displayValue: string;
  order: number;
};

type SearchAndCategoryFacetAttributesListProps = {
  boostedValues: AttributeValueWithOrder[];
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
  const initialOrders = useMemo(
    () =>
      Object.fromEntries(
        boostedValues.map((item) => [item.displayValue, item.order])
      ),
    [boostedValues]
  );

  const handleOrderChange = useCallback(
    (displayValue: string, newIndex: number) => {
      dispatch({
        type: 'SET_BOOSTED_ORDER',
        payload: { id: displayValue, newIndex },
      });
    },
    [dispatch]
  );

  const {
    inputRefs,
    localOrders,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  } = useFacetOrderInput(handleOrderChange, initialOrders);

  const listValues = useCallback(
    (
      values:
        | AttributeValueWithOrder[]
        | MerchandisingAttributeValuesResponse['values'],
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

      return filteredRows?.map((row, index) => {
        const displayValue = row.displayValue;

        let order: number | undefined;
        let localOrder: number | string | undefined;

        if ('order' in row && typeof row.order === 'number') {
          order = row.order;
          localOrder = localOrders[displayValue] ?? order;
        }

        return (
          <FacetAttributeValuesTableRow
            key={`${displayType}-${displayValue}`}
            isPinned={displayType === 'included'}
            isExcluded={displayType === 'excluded'}
            data-testid={`${displayType} attribute ${index} ${displayValue}`}
          >
            <Col />
            <Col>
              {displayType === 'included' && order !== undefined && (
                <AttributeWrapper>
                  <FacetOrderInput
                    displayValue={displayValue}
                    order={order}
                    localOrder={localOrder}
                    inputRef={(el) => {
                      if (el) {
                        // eslint-disable-next-line functional/immutable-data
                        inputRefs.current[displayValue] = el;
                      }
                    }}
                    onInputChange={handleInputChange}
                    onInputBlur={handleInputBlur}
                    onInputKeyDown={handleInputKeyDown}
                    writeEnabled={writeEnabled}
                  />
                </AttributeWrapper>
              )}
            </Col>
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
              {displayType === 'included' && order !== undefined && (
                <OrderArrowsContainer>
                  <ArrowButton
                    direction="up"
                    aria-label={`Move ${displayValue} row up`}
                    isDisabled={index === 0 || !!searchQuery || !writeEnabled}
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
                      index === filteredRows.length - 1 ||
                      !!searchQuery ||
                      !writeEnabled
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
    [
      dispatch,
      searchQuery,
      writeEnabled,
      handleInputBlur,
      handleInputChange,
      handleInputKeyDown,
      localOrders,
      inputRefs,
    ]
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
    <>
      <FacetAttributeValuesTableRow isHeading>
        {EDITFACETVALUESMODALCOLUMNS.map(({ label }) => (
          <Col key={`add-facet-modal-column-${label}`}>
            <TableHeading as="p" isStrong>
              {label}
            </TableHeading>
          </Col>
        ))}
      </FacetAttributeValuesTableRow>

      {boostedValuesRows}
      {defaultValuesRows}
      {excludedValuesRows}
    </>
  );
};

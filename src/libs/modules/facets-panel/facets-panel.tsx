import styled from '@emotion/styled';
import { useState } from 'react';
import { Box } from '@mantine/core';

import { Category, MerchandisingRules, ReturnedFacet } from '@/libs/api';
import {
  Button,
  CategorySearch,
  ProductGridHeader,
  Search,
  spacing,
  Text,
} from '@/libs/components';
import { ArrowButton } from '@/libs/components/buttons/button/arrow-button';
import { FacetOrderDropdown } from '@/libs/components/dropdowns/facet-order-dropdown/facet-order-dropdown';
import { EditableLabel } from '@/libs/components/editable-label/editable-label';
import { ModalEditValues } from '@/libs/components/modals/modal-edit-facets';
import { Preview } from '@/libs/components/preview/preview';
import {
  TableCol,
  TableHeading,
  TableRow,
} from '@/libs/components/table/table.styles';
import { color } from '@/libs/components/utils/constants';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

export const ActionContainer = styled.div`
  display: flex;

  h1 {
    font-size: 1.5em;
    padding: ${spacing(3)} ${spacing(2)};
  }

  a,
  button {
    min-width: 150px;
    text-align: center;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};
  margin-left: auto;
  padding: 18px;
`;

export const AddFacetPanel = styled.div`
  display: flex;
  justify-content: space-between;

  div {
    &:first-of-type {
      flex: 6;
    }

    &:last-of-type {
      flex: 1;
    }
  }
`;

export const LowerHeading = styled(Text)`
  font-size: 1em;
  margin-bottom: 1em;
`;

export const AttributesTable = styled.div`
  display: flex;
  flex-direction: column;
  margin: ${spacing(2)};
`;

export const SectionWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  margin-bottom: 0;
  border-radius: 4px;
  padding: ${spacing(2)};
`;

const OrderColumn = styled.div`
  display: flex;
  gap: ${spacing(1)};
  padding-right: ${spacing(1)};
`;

type TableRowProps = {
  optionSelected?: string;
};

export const Row = styled(TableRow)<TableRowProps>`
  font-size: 1rem;
  align-items: center;
  border-bottom: none;
  box-shadow: #000 0 0 10px -5px;
  margin-bottom: ${spacing(2)};
  padding: ${spacing(2)};

  ${({ optionSelected }) =>
    optionSelected === 'included' &&
    `background-color: ${color.successGreenBackground}`}

  ${({ optionSelected }) =>
    optionSelected === 'excluded' &&
    `background-color: ${color.errorRedBackground}`}

  ${({ optionSelected }) =>
    optionSelected === 'algoControl' &&
    `background-color: ${color.backgroundDarkGrey}`}
`;

export const Col = styled(TableCol)`
  justify-content: space-between;
`;

const NoAttributesBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  margin-top: 100px;

  p {
    font-size: 1.25rem;
    color: #707070;
  }
`;

export const COLUMNS: {
  label: string;
}[] = [
  {
    label: 'Attribute',
  },
  {
    label: 'Display name',
  },
  {
    label: 'Order',
  },
  {
    label: 'Value options',
  },
];

type defaultOrderDataType = {
  defaultOrder: string;
}[];

export const FacetsPanel = ({
  onSave,
  onCancel,
  setSearch,
  onFacetDataChange,
  onFacetsDataRowOrderChange,
  onHandleStatusChange,
  refreshData,
  title,
  facetsData,
  facetType,
  isNewRuleset,
  defaultCategory,
  displayRowOrderControls = false,
  includedFacets,
  excludedFacets,
  rulesetMerchandisingRules,
  searchTerm,
  updatedValues,
}: {
  onSave: (categoryId: string) => void;
  onCancel: () => void;
  setSearch?: (value: string) => void;
  onFacetDataChange?: ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded' | 'algoControl';
    facet: ReturnedFacet;
  }) => void;
  onFacetValuesChange?: ({
    facet,
    orderedPinnedValues,
    orderedExcludedValues,
  }: {
    facet: ReturnedFacet;
    orderedPinnedValues: string[];
    orderedExcludedValues: string[];
  }) => void;
  onFacetsDataRowOrderChange?: (
    index: number,
    direction: -1 | 1,
    id: string
  ) => void;
  onHandleStatusChange?: (
    status: 'included' | 'excluded' | 'algoControl',
    id?: string,
    index?: number
  ) => void;
  refreshData?: () => void;
  displayRowOrderControls?: boolean;
  title: string;
  facetsData: ReturnedFacet[];
  facetType: 'global' | 'category' | 'search';
  isNewRuleset?: boolean;
  rulesetMerchandisingRules?: MerchandisingRules;
  defaultCategory?: Category;
  canMergeValueAttributes?: boolean;
  defaultOrderData?: defaultOrderDataType;
  includedFacets: ReturnedFacet[];
  excludedFacets: ReturnedFacet[];
  searchTerm?: string;
  updatedValues?: (
    orderedPinnedValues: string[],
    orderedExcludedValues: string[],
    id: string
  ) => void;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    defaultCategory || {}
  );

  const [showPreview, setShowPreview] = useState(false);
  const [merchandisingRules] = useState<MerchandisingRules>(
    rulesetMerchandisingRules
      ? rulesetMerchandisingRules
      : {
          pinnedProducts: [],
          blockedProducts: [],
          boosts: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
          buries: {
            alphanumeric: [],
            numeric: [],
            product: [],
          },
          includes: {
            alphanumeric: [],
          },
          excludes: {
            alphanumeric: [],
          },
        }
  );

  const [selectedFacet, setSelectedFacet] = useState<ReturnedFacet | undefined>(
    undefined
  );
  const [isEditValuesModalOpen, setIsEditValuesModalOpen] = useState(false);

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearch?.(val);
  }, 300);

  // istanbul ignore next
  const onSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleOpenFacetEditModal = (facet: ReturnedFacet) => {
    setIsEditValuesModalOpen(true);
    setSelectedFacet(facet);
  };

  const onClose = () => {
    setIsEditValuesModalOpen(false);
  };

  const FacetRow = ({
    facet,
    index,
    totalIncludedFacets,
  }: {
    facet: ReturnedFacet;
    index: number;
    totalIncludedFacets?: number;
  }) => {
    const facetIncluded = includedFacets?.find(
      (includedFacet) => includedFacet.id === facet.id
    )
      ? 'included'
      : excludedFacets?.find((excludedFacet) => excludedFacet.id === facet.id)
        ? 'excluded'
        : 'algoControl';

    return (
      <Row
        optionSelected={facetIncluded}
        data-testid="facets-table-row"
        aria-label={`Row showing ${facet.displayValue} as ${facetIncluded}`}
      >
        <Col>
          <Text>{facet.indexPropertyName}</Text>
        </Col>
        <Col>
          {onFacetDataChange && facetType === 'global' ? (
            <EditableLabel
              displayValue={facet.displayValue}
              onDisplayValueChange={(newValue) =>
                onFacetDataChange({ value: newValue, facet })
              }
              canCancelEdit={true}
            />
          ) : (
            <Text>{facet.displayValue}</Text>
          )}
        </Col>
        <Col>
          <OrderColumn>
            <FacetOrderDropdown
              status={facetIncluded}
              hasAlgoControl
              onChange={(status): void => {
                if (onHandleStatusChange) {
                  onHandleStatusChange(status, facet.id);
                }
              }}
            />
            {!!totalIncludedFacets && index < totalIncludedFacets && (
              <>
                {index === 0 || !displayRowOrderControls ? (
                  <Box w="40" h="40" />
                ) : (
                  <ArrowButton
                    direction="up"
                    aria-label={`Move ${facet.displayValue} row up`}
                    isDisabled={Boolean(searchTerm)}
                    onClick={() => {
                      if (onFacetsDataRowOrderChange) {
                        onFacetsDataRowOrderChange(index, -1, facet.id);
                      }
                    }}
                  ></ArrowButton>
                )}
                {index === totalIncludedFacets - 1 ||
                !displayRowOrderControls ? (
                  <Box w="40" h="40" />
                ) : (
                  <ArrowButton
                    direction="down"
                    aria-label={`Move ${facet.displayValue} row down`}
                    isDisabled={Boolean(searchTerm)}
                    onClick={() => {
                      if (onFacetsDataRowOrderChange) {
                        onFacetsDataRowOrderChange(index, 1, facet.id);
                      }
                    }}
                  ></ArrowButton>
                )}
              </>
            )}
          </OrderColumn>
        </Col>
        <Col>
          {(facetType === 'global' || facetIncluded === 'included') && (
            <Button onClick={() => handleOpenFacetEditModal(facet)}>
              Edit values
            </Button>
          )}
        </Col>
      </Row>
    );
  };

  const sortedAndMappedFacets = facetsData?.map(
    (facet: ReturnedFacet, index: number) => (
      <FacetRow
        key={facet.id}
        facet={facet}
        index={index}
        totalIncludedFacets={includedFacets.length}
      />
    )
  );

  return (
    <>
      {showPreview && selectedCategory.identifier && merchandisingRules && (
        <Preview
          onClose={() => setShowPreview(!showPreview)}
          categoryId={selectedCategory.identifier}
          merchandisingRules={merchandisingRules}
          facetConfig={includedFacets}
        />
      )}

      <ProductGridHeader
        canSave={!!selectedCategory?.identifier}
        onSave={() => {
          if (onSave && selectedCategory?.identifier) {
            onSave(selectedCategory?.identifier);
          }
        }}
        hasPreview={!!selectedCategory?.identifier}
        onPreview={() => setShowPreview(!showPreview)}
        isNewRuleSet={!!isNewRuleset}
        hasChanges
        onCancel={onCancel}
        shouldHidePreview={facetType === 'global'}
        title={title}
      />

      <SectionWrapper>
        <LowerHeading isStrong>Rule scope</LowerHeading>
        <CategorySearch
          selectedCategory={selectedCategory}
          onClearSelection={() => {
            setSelectedCategory({});
          }}
          onSelectCategory={onSelectCategory}
          canRemoveCategory={facetType === 'category'}
        />
      </SectionWrapper>
      <SectionWrapper>
        <AddFacetPanel>
          <div>
            <LowerHeading isStrong>Preview and manage facets</LowerHeading>
            <Text>(sort by algo control)</Text>
          </div>
        </AddFacetPanel>
      </SectionWrapper>

      {selectedCategory && setSearch && (
        <SectionWrapper>
          <Search onChange={(e) => handleSearch(e.target.value)} />
        </SectionWrapper>
      )}

      <AttributesTable>
        <Row>
          {COLUMNS.map(({ label }) => (
            <Col key={`column-${label}`}>
              <TableHeading as="p" isStrong={true}>
                {label}
              </TableHeading>
            </Col>
          ))}
        </Row>

        {sortedAndMappedFacets}
      </AttributesTable>

      {isEditValuesModalOpen && selectedFacet && (
        <ModalEditValues
          onClose={onClose}
          facet={selectedFacet}
          facetType={facetType}
          refreshData={refreshData}
          updatedValues={updatedValues}
          category={
            facetType === 'category' ? selectedCategory.identifier : undefined
          }
        />
      )}

      {facetsData.length === 0 && (
        <NoAttributesBlock>
          <Text>No, there are no attributes yet.</Text>
          <Text>How about adding a subcategory first?</Text>
        </NoAttributesBlock>
      )}
    </>
  );
};

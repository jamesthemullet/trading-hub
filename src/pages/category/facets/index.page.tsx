import styled from '@emotion/styled';
import { useState } from 'react';

import type { ReturnedRuleSet } from '@/libs/api';
import {
  Button,
  DataTable,
  Heading,
  Search,
  TablePagination,
} from '@/libs/components';
import { spacing } from '@/libs/components/utils/spacing';
import {
  useDebounce,
  useRuleSet,
  useRuleSetDelete,
  useUpdateRuleSet,
} from '@/libs/hooks';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;
const ToolsContainer = styled.div`
  display: flex;
  align-items: left;

  margin: ${spacing(2)};
`;
const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const FacetManagementPage = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const currentPageIndex = currentPage - 1;

  const {
    categoryRuleSets,
    pagination,
    refetchRuleSetList,
    setCategoryRuleSets,
  } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'category'
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  }, 300);

  const { handleDelete } = useRuleSetDelete();
  const { updateRuleSet } = useUpdateRuleSet();

  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await handleDelete({ rulesetId: id });

    refetchRuleSetList();
  };

  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = categoryRuleSets.find((ruleSet) => ruleSet.id === id);

    // istanbul ignore next
    if (!ruleSet) return;

    const { facets, isEnabled, rules, categoryId } = ruleSet;
    await updateRuleSet({
      ruleSetId: id,
      rules: {
        facets,
        rules,
        isEnabled: !isEnabled,
      },
      categoryId,
    });
    const updatedRuleSetsList = categoryRuleSets.map(
      (ruleset: ReturnedRuleSet) =>
        ruleset.id === id ? { ...ruleset, isEnabled: !isEnabled } : ruleset
    );
    setCategoryRuleSets(updatedRuleSetsList);
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

  const rows = categoryRuleSets.map(
    ({
      categoryId,
      categoryName,
      id,
      isEnabled,
      lastChanged,
      categoriesInfo,
    }) => ({
      id: id,
      identifier: `${categoryId} | ${categoryName}`,
      isEnabled,
      lastChanged,
      onToggle: onEnableDisableRuleSet,
      url: `/category/facets/edit/${id}`,
      categoryPlpUrl: categoriesInfo.find(
        (category) => category.id === categoryId
      )?.plpUrl,
    })
  );

  return (
    <>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Ranking rules',
          'facet-management',
        ]}
      />

      <PageNameLabel>Category Facet Management</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />

          <NewButton>
            <Button as="a" href="/category/facets/new">
              Add facet
            </Button>
          </NewButton>
        </ToolsContainer>

        <DataTable
          headings={headings}
          rows={rows}
          onDeleteRuleSet={onDeleteRuleSet}
        />

        <TablePagination
          pagination={pagination}
          pageSizes={pageSizes}
          currentPage={currentPage}
          currentPageSize={currentPageSize}
          setCurrentPage={setCurrentPage}
          setCurrentPageSize={setCurrentPageSize}
        />
      </PageWrapper>
    </>
  );
};

export default FacetManagementPage;

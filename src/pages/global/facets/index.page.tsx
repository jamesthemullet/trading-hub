import styled from '@emotion/styled';
import { useState } from 'react';

import {
  Button,
  DataTable,
  Heading,
  Search,
  SectionHeader,
  SectionWrapper,
  TablePagination,
} from '@/libs/components';
import { spacing } from '@/libs/components/utils/spacing';
import { useDebounce, useGlobalRuleSetDelete, useRuleSet } from '@/libs/hooks';
import { useGlobalRuleSetEdit } from '@/libs/hooks/use-global-rule-set-edit';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
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
  const { handleDelete } = useGlobalRuleSetDelete();
  const { handleEdit } = useGlobalRuleSetEdit();

  const currentPageIndex = currentPage - 1;

  const { globalRuleSets, pagination, refetchRuleSetList } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'global'
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  // istanbul ignore next
  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = globalRuleSets.find((ruleset) => ruleset.id === id);

    if (!ruleSet) return null;

    await handleEdit({
      ruleSetId: id,
      ruleSet: {
        ...ruleSet,
        isEnabled: !ruleSet.isEnabled,
      },
    });

    refetchRuleSetList();
  };

  // istanbul ignore next
  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await handleDelete({ rulesetId: id });
    refetchRuleSetList();
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

  const rows = globalRuleSets.map(({ id, isEnabled, lastChanged }) => ({
    id,
    identifier: '*',
    isEnabled,
    lastChanged,
    onToggle: onEnableDisableRuleSet,
    url: `/global/facets/edit/1`,
  }));

  return (
    <>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Global Facet Management',
        ]}
      />

      <PageNameLabel>Global Facet Management</PageNameLabel>
      <SectionWrapper>
        <SectionHeader>
          <Search onChange={(e) => handleSearch(e.target.value)} />

          <NewButton>
            <Button as="a" href="#" disabled={true}>
              Add rule
            </Button>
          </NewButton>
        </SectionHeader>

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
      </SectionWrapper>
    </>
  );
};

export default FacetManagementPage;

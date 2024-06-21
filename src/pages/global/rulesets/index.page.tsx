import styled from '@emotion/styled';
import { useState } from 'react';
import { useRouter } from 'next/router';

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
  useGlobalRuleSetCreate,
  useGlobalRuleSetDelete,
  useGlobalRuleSetUpdate,
  useRuleSet,
} from '@/libs/hooks';

const PageNameLabel = styled.h2`
  margin: ${spacing(3)} ${spacing(2)};
`;

const ToolsContainer = styled.div`
  display: flex;
  align-items: left;

  margin: ${spacing(2)};
`;

const PageWrapper = styled.div`
  box-shadow: #000 0 0 10px -5px;
  margin: ${spacing(2)};
  padding-top: ${spacing(1)};
  border-radius: 4px;
`;

const NewButton = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const RuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentPageIndex = currentPage - 1;

  const { globalRuleSets, pagination, refetchRuleSetList } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'global'
  );
  const { handleDelete } = useGlobalRuleSetDelete();
  const { handleEdit } = useGlobalRuleSetUpdate();
  const { createGlobalRuleSet } = useGlobalRuleSetCreate();
  const router = useRouter();

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = globalRuleSets.find((ruleset) => ruleset.id === id);

    // istanbul ignore next
    if (!ruleSet) return null;

    await handleEdit({
      ruleSetId: id,
      ruleSet: {
        facets: ruleSet.facets,
        rules: ruleSet.rules,
        isEnabled: !ruleSet.isEnabled,
      },
    });

    refetchRuleSetList();
  };

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
    url: `/global/rulesets/edit/${id}`,
  }));

  const createNewRuleSet = async () => {
    const resp = await createGlobalRuleSet();

    if (resp) {
      return router.push(`/global/rulesets/edit/${resp.id}`);
    }
  };

  return (
    <>
      <Heading
        breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
      />

      <PageNameLabel>Global category ranking rules</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          <NewButton>
            <Button as="button" onClick={createNewRuleSet}>
              Add rule
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

export default RuleSets;

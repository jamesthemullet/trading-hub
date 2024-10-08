import { useState } from 'react';
import { useRouter } from 'next/router';

import { DataTable, Heading, Search, TablePagination } from '@/libs/components';
import {
  NewButton,
  PageNameLabel,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import {
  useGlobalRuleSetCreate,
  useGlobalRuleSetDelete,
  useGlobalRuleSetUpdate,
  useRuleSet,
} from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

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
  const { saveGlobalRuleset } = useGlobalRuleSetUpdate();
  const { createGlobalRuleSet } = useGlobalRuleSetCreate();
  const router = useRouter();

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = globalRuleSets.find((ruleset) => ruleset.id === id);

    // istanbul ignore next
    if (!ruleSet) return null;

    await saveGlobalRuleset({
      ruleSetId: id,
      ruleSet: {
        facets: ruleSet.facets,
        rules: ruleSet.rules,
        isEnabled: !ruleSet.isEnabled,
        excludedFacets: ruleSet.excludedFacets,
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
          <NewButton onClick={createNewRuleSet}>
            <Link href={''}>Add new rule</Link>
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

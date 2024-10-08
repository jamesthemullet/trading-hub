import { useState } from 'react';

import type { ReturnedKeywordRuleSet } from '@/libs/api';
import { DataTable, Heading, Search, TablePagination } from '@/libs/components';
import {
  NewButton,
  PageNameLabel,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import {
  useSearchRuleSetDelete,
  useSearchRulesetList,
  useSearchRuleSetUpdate,
} from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

const SearchRuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { updateRuleSet } = useSearchRuleSetUpdate();

  const currentPageIndex = currentPage - 1;

  const { pagination, ruleSets, setRuleSets, refetchRuleSetList } =
    useSearchRulesetList(
      searchQuery,
      currentPageIndex * currentPageSize,
      currentPageSize
    );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = ruleSets.find((ruleSet) => ruleSet.id === id);

    // istanbul ignore next
    if (!ruleSet) return;

    const { searchTerms, facets, rules, isEnabled } = ruleSet;
    await updateRuleSet({
      ruleSetId: id,
      rules: {
        facets,
        rules,
        isEnabled: !isEnabled,
      },
      searchTerms,
    });
    // istanbul ignore next
    const updatedRuleSetsList = ruleSets.map(
      (ruleset: ReturnedKeywordRuleSet) =>
        ruleset.id === id ? { ...ruleset, isEnabled: !isEnabled } : ruleset
    );
    setRuleSets(updatedRuleSetsList);
  };

  const { deleteRuleset } = useSearchRuleSetDelete();

  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await deleteRuleset({ rulesetId: id });

    refetchRuleSetList();
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

  const rows = ruleSets.map(({ searchTerms, id, isEnabled, lastChanged }) => ({
    id: id,
    identifier: searchTerms
      .map((term) =>
        !!searchQuery.length &&
        term.toLowerCase().startsWith(searchQuery.toLowerCase())
          ? `<b>${term}</b>`
          : term
      )
      .join(' | '),
    isEnabled,
    lastChanged,
    onToggle: onEnableDisableRuleSet,
    url: `/search/rulesets/edit/${id}`,
  }));

  return (
    <>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Site search',
          'Search ranking rules',
        ]}
      />

      <PageNameLabel>Search ranking rules</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          <NewButton>
            <Link href="/search/rulesets/new">Add new rule</Link>
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

export default SearchRuleSets;

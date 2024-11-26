import { useContext, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  CountryCode,
  KeywordRuleSet,
  ReturnedKeywordRuleSet,
} from '@/libs/api';
import { DataTable, Heading, Search, TablePagination } from '@/libs/components';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { CountryFilterDropdown } from '@/libs/components/dropdowns/country-filter-dropdown/country-filter-dropdown';
import {
  NewButton,
  PageNameLabel,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import {
  useSearchRuleSetCreate,
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
  const { createRuleset } = useSearchRuleSetCreate();
  const router = useRouter();

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
        startDate: ruleSet.startDate,
        endDate: ruleSet.endDate,
        countryCode: ruleSet.countryCode,
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

  const createDuplicatedCategoryRuleSet = async ({
    rules,
    searchTerms,
    startDate,
    endDate,
    countryCode = 'UK_IE',
  }: KeywordRuleSet) => {
    const resp = await createRuleset({
      searchTerms,
      merchandisingRules: rules,
      startDate,
      endDate,
      countryCode,
    });

    if (resp) {
      return router.push(`/search/rulesets/edit/${resp.id}`);
    }
  };

  const { deleteRuleset } = useSearchRuleSetDelete();

  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await deleteRuleset({ rulesetId: id });

    refetchRuleSetList({});
  };

  const featureFlags = useContext(FeatureFlagContext);

  const onDuplicateRuleSet = (id: string) => {
    const rulesetToCopy = ruleSets.find((ruleset) => ruleset.id === id);

    // istanbul ignore next
    if (!rulesetToCopy) return;
    createDuplicatedCategoryRuleSet({
      rules: rulesetToCopy.rules,
      searchTerms: rulesetToCopy.searchTerms,
      isEnabled: false,
    });
  };

  const headings = [
    'Identifier',
    'Schedule',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const rows = ruleSets.map(
    ({
      searchTerms,
      id,
      isEnabled,
      lastChanged,
      startDate,
      endDate,
      countryCode,
    }) => ({
      id: id,
      identifier: searchTerms
        .map((term) =>
          !!searchQuery.length &&
          term.toLowerCase().startsWith(searchQuery.toLowerCase())
            ? `<b>${term}</b>`
            : term
        )
        .join(' | '),
      searchTerms,
      isEnabled,
      lastChanged,
      onToggle: onEnableDisableRuleSet,
      url: `/search/rulesets/edit/${id}`,
      startDate,
      endDate,
      ...(featureFlags.hasIreland && { countryCode }),
    })
  );

  const handleCountryFilter = (countryCode?: CountryCode) => {
    refetchRuleSetList({ countryCode });
  };

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
          {featureFlags.hasIreland && (
            <CountryFilterDropdown onChange={handleCountryFilter} />
          )}
          <NewButton>
            <Link href="/search/rulesets/new">Add new rule</Link>
          </NewButton>
        </ToolsContainer>

        <DataTable
          headings={headings}
          rows={rows}
          ruleType="searchRanking"
          onDeleteRuleSet={onDeleteRuleSet}
          onDuplicate={onDuplicateRuleSet}
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

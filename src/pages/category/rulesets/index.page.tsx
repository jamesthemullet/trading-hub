import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { Skeleton } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  CategoryRuleSet,
  CountryCode,
  ReturnedCategoryRuleSet,
} from '@/libs/api';
import {
  DataTable,
  DataTableSkeleton,
  ErrorMessage,
  Heading,
  Loader,
  Search,
  TablePagination,
  TablePaginationSkeleton,
} from '@/libs/components';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { CountryFilterDropdown } from '@/libs/components/dropdowns/country-filter-dropdown/country-filter-dropdown';
import {
  NewButton,
  PageNameLabel,
  PageWrapper,
  ToolsContainer,
} from '@/libs/components/utils/shared.styles';
import { spacing } from '@/libs/components/utils/spacing';
import {
  useRuleSet,
  useRuleSetCreate,
  useRuleSetDelete,
  useUpdateRuleSet,
} from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

const SkeletonButtonWrapper = styled.div`
  margin-left: auto;
  margin-top: ${spacing(1)};
  margin-right: ${spacing(2)};
`;

const RuleSets = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isSaving, updateCategoryRuleSet } = useUpdateRuleSet();
  const { createRuleset } = useRuleSetCreate();
  const router = useRouter();
  const featureFlags = useContext(FeatureFlagContext);

  const currentPageIndex = currentPage - 1;

  const {
    categoryRuleSets,
    error,
    pagination,
    refetchRuleSetList,
    setCategoryRuleSets,
    isLoading,
  } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'category'
  );

  const sizeIsUnknownYet = pagination.totalItems === 0;

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
  }, 300);

  const { handleDelete } = useRuleSetDelete();

  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await handleDelete({ rulesetId: id });

    refetchRuleSetList({});
  };

  const onEnableDisableRuleSet = async ({ id }: { id: string }) => {
    const ruleSet = categoryRuleSets.find((ruleSet) => ruleSet.id === id);

    // istanbul ignore next
    if (!ruleSet) return;

    const {
      categoriesInfo,
      facets,
      rules,
      isEnabled,
      startDate,
      endDate,
      excludedFacets,
      countryCode,
    } = ruleSet;
    await updateCategoryRuleSet({
      categoryIds: categoriesInfo.map((category) => category.id),
      facets,
      isEnabled: !isEnabled,
      rules,
      ruleSetId: id,
      ...(countryCode && { countryCode }),
      ...(endDate && { endDate }),
      ...(excludedFacets && { excludedFacets }),
      ...(startDate && { startDate }),
    });
    const updatedRuleSetsList = categoryRuleSets.map(
      (ruleset: ReturnedCategoryRuleSet) =>
        ruleset.id === id ? { ...ruleset, isEnabled: !isEnabled } : ruleset
    );
    setCategoryRuleSets(updatedRuleSetsList);
  };

  const headings = [
    'Identifier',
    'Breadcrumb',
    'Schedule',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const rows = categoryRuleSets.map(
    ({
      id,
      isEnabled,
      lastChanged,
      categoriesInfo,
      startDate,
      endDate,
      countryCode,
    }) => ({
      id: id,
      identifier: `${categoriesInfo[0].id} | ${categoriesInfo[0].name}`,
      isEnabled,
      lastChanged,
      onToggle: onEnableDisableRuleSet,
      url: `/category/rulesets/edit/${id}`,
      categoryPlpUrl: categoriesInfo[0].plpUrl,
      startDate,
      endDate,
      ...(featureFlags.hasIreland && { countryCode }),
    })
  );

  const createDuplicatedCategoryRuleSet = async ({
    categoryIds,
    countryCode,
    endDate,
    excludedFacets,
    facets,
    isEnabled,
    rules,
    startDate,
  }: Required<Pick<CategoryRuleSet, 'facets'>> & CategoryRuleSet) => {
    const resp = await createRuleset({
      categoryIds,
      facets,
      isEnabled,
      rules,
      ...(countryCode && { countryCode }),
      ...(excludedFacets && { excludedFacets }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    });

    if (resp) {
      return router.push(`/category/rulesets/edit/${resp.id}`);
    }
  };

  const onDuplicateRuleSet = (id: string) => {
    const rulesetToCopy = categoryRuleSets.find((ruleset) => ruleset.id === id);

    // istanbul ignore next
    if (!rulesetToCopy) return;

    createDuplicatedCategoryRuleSet({
      rules: rulesetToCopy.rules,
      facets: rulesetToCopy.facets || [],
      excludedFacets: rulesetToCopy.excludedFacets,
      categoryIds: rulesetToCopy.categoriesInfo.map((category) => category.id),
      startDate: rulesetToCopy.startDate,
      endDate: rulesetToCopy.endDate,
      isEnabled: false,
      countryCode: rulesetToCopy.countryCode,
    });
  };

  const handleCountryFilter = (countryCode?: CountryCode) => {
    refetchRuleSetList({ countryCode });
  };

  return (
    <>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <PageNameLabel>Category ranking rules</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          {featureFlags.hasIreland && (
            <CountryFilterDropdown onChange={handleCountryFilter} />
          )}
          {isLoading ? (
            <SkeletonButtonWrapper>
              <Skeleton height={33} width={110} />
            </SkeletonButtonWrapper>
          ) : (
            <NewButton>
              <Link href="/category/rulesets/new">Add new rule</Link>
            </NewButton>
          )}
        </ToolsContainer>

        {isLoading ? (
          <DataTableSkeleton headings={headings} rowsCount={10} />
        ) : (
          <DataTable
            headings={headings}
            rows={rows}
            onDeleteRuleSet={onDeleteRuleSet}
            onDuplicate={onDuplicateRuleSet}
          />
        )}

        {error && <ErrorMessage>Error: {error}</ErrorMessage>}

        {isLoading && sizeIsUnknownYet ? (
          <TablePaginationSkeleton />
        ) : (
          <TablePagination
            pagination={pagination}
            pageSizes={pageSizes}
            currentPage={currentPage}
            currentPageSize={currentPageSize}
            setCurrentPage={setCurrentPage}
            setCurrentPageSize={setCurrentPageSize}
          />
        )}

        {isSaving && <Loader />}
      </PageWrapper>
    </>
  );
};

export default RuleSets;

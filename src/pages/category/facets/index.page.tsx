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
import {
  useRuleSet,
  useRuleSetCreate,
  useRuleSetDelete,
  useUpdateRuleSet,
} from '@/libs/hooks';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Link from 'next/link';

const FacetManagementPage = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { createRuleset } = useRuleSetCreate();
  const router = useRouter();
  const featureFlags = useContext(FeatureFlagContext);

  const currentPageIndex = currentPage - 1;

  const {
    categoryRuleSets,
    pagination,
    refetchRuleSetList,
    setCategoryRuleSets,
    error: getRulesetError,
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
    setCurrentPage(1);
  }, 300);

  const { handleDelete, error: deleteRulesetError } = useRuleSetDelete();

  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();

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
      countryCode,
      facets,
      isEnabled: !isEnabled,
      rules,
      ruleSetId: id,
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

  const hasSchedule =
    categoryRuleSets.some((rule) => rule.startDate && rule.endDate) &&
    featureFlags.hasScheduling;

  const headings = [
    'Identifier',
    'Breadcrumb',
    ...(hasSchedule ? ['Schedule'] : []),
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
      url: `/category/facets/edit/${id}`,
      categoryPlpUrl: categoriesInfo[0].plpUrl,
      ...(featureFlags.hasScheduling && { startDate, endDate }),
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
      return router.push(`/category/facets/edit/${resp.id}`);
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
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Ranking rules',
          'facet-management',
        ]}
      />

      {getRulesetError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetError}
        </ErrorMessage>
      )}
      {deleteRulesetError && (
        <ErrorMessage>
          Error whilst deleting ruleset: {deleteRulesetError}
        </ErrorMessage>
      )}
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      <PageNameLabel>Category Facet Management</PageNameLabel>
      <PageWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          {featureFlags.hasIreland && (
            <CountryFilterDropdown onChange={handleCountryFilter} />
          )}
          <NewButton>
            {isLoading ? (
              <Skeleton height={33} width={110} />
            ) : (
              <NewButton>
                <Link href="/category/facets/new">Add new facet</Link>
              </NewButton>
            )}
          </NewButton>
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
      </PageWrapper>
    </>
  );
};

export default FacetManagementPage;

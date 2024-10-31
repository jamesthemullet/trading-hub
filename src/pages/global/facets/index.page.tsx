import { useContext, useState } from 'react';
import { useRouter } from 'next/router';

import { CountryCode } from '@/libs/api';
import {
  DataTable,
  ErrorMessage,
  Heading,
  Search,
  TablePagination,
} from '@/libs/components';
import { FeatureFlagContext } from '@/libs/components/context/feature-flag';
import { CountryFilterDropdown } from '@/libs/components/dropdowns/country-filter-dropdown/country-filter-dropdown';
import {
  NewButton,
  PageNameLabel,
  SectionWrapper,
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

const FacetManagementPage = () => {
  const pageSizes = [10, 20, 50, 100];
  const [currentPageSize, setCurrentPageSize] = useState(pageSizes[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const { handleDelete, error: deleteRulesetError } = useGlobalRuleSetDelete();
  const { saveGlobalRuleset, error: updateRulesetError } =
    useGlobalRuleSetUpdate();
  const { createGlobalRuleSet } = useGlobalRuleSetCreate();
  const router = useRouter();

  const currentPageIndex = currentPage - 1;

  const {
    globalRuleSets,
    pagination,
    refetchRuleSetList,
    error: getRulesetError,
  } = useRuleSet(
    searchQuery,
    currentPageIndex * currentPageSize,
    currentPageSize,
    'global'
  );

  const { callback: handleSearch } = useDebounce((val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
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

    refetchRuleSetList({});
  };

  const onDeleteRuleSet = async ({ id }: { id: string }) => {
    await handleDelete({ rulesetId: id });
    refetchRuleSetList({});
  };

  const headings = ['Identifier', 'Enable', 'Last Changed', 'User', 'Actions'];

  const featureFlags = useContext(FeatureFlagContext);

  const rows = globalRuleSets.map(
    ({ id, isEnabled, lastChanged, countryCode }) => ({
      id,
      identifier: '*',
      isEnabled,
      lastChanged,
      onToggle: onEnableDisableRuleSet,
      url: `/global/facets/edit/${id}`,
      ...(featureFlags.hasIreland && { countryCode }),
    })
  );

  const createNewRuleSet = async () => {
    const response = await createGlobalRuleSet();

    if (response) {
      return router.push(`/global/facets/edit/${response.id}`);
    }
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
          'Global Facet Management',
        ]}
      />

      {getRulesetError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetError}
        </ErrorMessage>
      )}

      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      {deleteRulesetError && (
        <ErrorMessage>
          Error whilst deleting ruleset: {deleteRulesetError}
        </ErrorMessage>
      )}

      <PageNameLabel>Global Facet Management</PageNameLabel>
      <SectionWrapper>
        <ToolsContainer>
          <Search onChange={(e) => handleSearch(e.target.value)} />
          {featureFlags.hasIreland && (
            <CountryFilterDropdown onChange={handleCountryFilter} />
          )}

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
      </SectionWrapper>
    </>
  );
};

export default FacetManagementPage;

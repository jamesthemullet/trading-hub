import type {
  KeywordRuleSet,
  ReturnedKeywordRuleSet,
  ReturnedKeywordRuleSets,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { TablePanel } from '@/libs/components/table-panel/table-panel';
import type { RuleSetMapping } from '@/libs/components/types';
import { PageNameLabel } from '@/libs/components/utils/shared.styles';
import { useAccess } from '@/libs/hooks/use-access';

import Head from 'next/head';

const mapping: RuleSetMapping<
  ReturnedKeywordRuleSets,
  ReturnedKeywordRuleSet,
  KeywordRuleSet
> = {
  queryAllRuleSets: search().betaMerchandisingKeywordRulesetList,
  deleteRuleSetById: search().betaMerchandisingKeywordRulesetDelete,
  queryRuleSetById: search().betaMerchandisingKeywordRulesetDetail,
  updateRuleSetById: search().betaMerchandisingKeywordRulesetUpdate,
  newRuleSet: search().betaMerchandisingKeywordRulesetCreate,
  ruleSetToRow: ({
    id,
    searchTerms,
    isEnabled,
    lastChanged,
    startDate,
    endDate,
    countryCode,
  }) => ({
    id,
    identifier: searchTerms.join(' | '),
    isEnabled,
    lastChanged,
    url: `/search/facets/edit/${id}`,
    startDate,
    endDate,
    countryCode,
  }),
  allToArray: (data) => data.ruleSets,
  getEmptyRuleSet: () => ({
    searchTerms: [],
    countryCode: 'UK_IE',
    endDate: undefined,
    excludedFacets: undefined,
    facets: [],
    isEnabled: false,
    rules: {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { numeric: [], alphanumeric: [], product: [] },
      buries: { numeric: [], alphanumeric: [], product: [] },
      includes: { alphanumeric: [] },
      excludes: { alphanumeric: [] },
    },
    startDate: undefined,
  }),
  returnedToRuleSet: (returnedRuleSet) => {
    return {
      searchTerms: returnedRuleSet.searchTerms,
      countryCode: returnedRuleSet.countryCode || 'UK_IE',
      endDate: returnedRuleSet.endDate,
      excludedFacets: returnedRuleSet.excludedFacets,
      facets: returnedRuleSet.facets,
      isEnabled: returnedRuleSet.isEnabled,
      rules: returnedRuleSet.rules,
      startDate: returnedRuleSet.startDate,
    };
  },
};

const FacetManagementPage = () => {
  const headings = [
    'Identifier',
    'Schedule',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Search Facet Management</title>
      </Head>
      <main>
        <Heading
          breadcrumbs={[
            'Search & Merchandising',
            'Site search',
            'Search Facet Management',
          ]}
        />
        <PageNameLabel>Search Facet Management</PageNameLabel>
        <TablePanel
          basePath="/search/facets"
          headings={headings}
          mapping={mapping}
          newRowCreateMode="redirect-to-new"
          ruleType="searchRanking"
          writeEnabled={hasWriteAccess}
        />
      </main>
    </>
  );
};

export default FacetManagementPage;

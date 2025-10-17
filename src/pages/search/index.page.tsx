import type {
  MerchandisingKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSets,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import type { RuleSetMapping } from '@/libs/components/types';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';
import { PageNameLabel } from '@/libs/utils/shared.styles';

import Head from 'next/head';

const mapping: RuleSetMapping<
  MerchandisingReturnedKeywordRuleSets,
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingKeywordRuleSet
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
    url: `/search/rulesets/edit/${id}`,
    startDate,
    endDate,
    countryCode,
  }),
  allToArray: (data) => data.ruleSets,
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

const SearchRuleSets = () => {
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
        <title>Merchandising Hub | M&S | Search ranking rules</title>
      </Head>

      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Search']}
      />
      <PageNameLabel>Search</PageNameLabel>
      <TablePanel
        basePath="/search"
        headings={headings}
        mapping={mapping}
        ruleType="searchRanking"
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default SearchRuleSets;

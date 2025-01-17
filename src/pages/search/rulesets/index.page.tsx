import {
  KeywordRuleSet,
  ReturnedKeywordRuleSet,
  ReturnedKeywordRuleSets,
  search,
} from '@/libs/api';
import { Heading } from '@/libs/components';
import { TablePanel } from '@/libs/components/table-panel/table-panel';
import { RuleSetMapping } from '@/libs/components/types';
import { PageNameLabel } from '@/libs/components/utils/shared.styles';

import Head from 'next/head';

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
      url: `/search/rulesets/edit/${id}`,
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

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Search ranking rules</title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Site search',
          'Search ranking rules',
        ]}
      />
      <PageNameLabel>Search ranking rules</PageNameLabel>
      <TablePanel
        basePath="/search/rulesets"
        headings={headings}
        mapping={mapping}
        newRowCreateMode="redirect-to-new"
        ruleType="searchRanking"
      />
    </>
  );
};

export default SearchRuleSets;

import {
  ReturnedGlobalRuleSet,
  ReturnedGlobalRuleSets,
  RuleSet,
  search,
} from '@/libs/api';
import { Heading } from '@/libs/components/heading/heading';
import { TablePanel } from '@/libs/components/table-panel/table-panel';
import { RuleSetMapping } from '@/libs/components/types';
import { PageNameLabel } from '@/libs/components/utils/shared.styles';

import Head from 'next/head';

const FacetManagementPage = () => {
  const headings = [
    'Identifier',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const mapping: RuleSetMapping<
    ReturnedGlobalRuleSets,
    ReturnedGlobalRuleSet,
    RuleSet
  > = {
    queryAllRuleSets: search().betaMerchandisingGlobalRulesetList,
    deleteRuleSetById: search().betaMerchandisingGlobalRulesetDelete,
    queryRuleSetById: search().betaMerchandisingGlobalRulesetDetail,
    updateRuleSetById: search().betaMerchandisingGlobalRulesetUpdate,
    newRuleSet: search().betaMerchandisingGlobalRulesetCreate,
    ruleSetToRow: ({ id, isEnabled, lastChanged, countryCode }) => ({
      id,
      identifier: '*',
      isEnabled,
      lastChanged,
      url: `/global/facets/edit/${id}`,
      countryCode,
    }),
    allToArray: (data) => data.ruleSets,
    getEmptyRuleSet: () => ({
      isEnabled: false,
      countryCode: 'UK_IE',
      rules: {
        pinnedProducts: [],
        blockedProducts: [],
        boosts: { numeric: [], alphanumeric: [], product: [] },
        buries: { numeric: [], alphanumeric: [], product: [] },
        includes: { alphanumeric: [] },
        excludes: { alphanumeric: [] },
      },
      endDate: undefined,
      startDate: undefined,
      facets: [],
      excludedFacets: undefined,
    }),
    returnedToRuleSet: (returnedRuleSet) => {
      return {
        isEnabled: returnedRuleSet.isEnabled,
        countryCode: returnedRuleSet.countryCode,
        rules: returnedRuleSet.rules,
        endDate: returnedRuleSet.endDate,
        startDate: returnedRuleSet.startDate,
        facets: returnedRuleSet.facets,
        excludedFacets: returnedRuleSet.excludedFacets,
      };
    },
  };

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Global Facet Management</title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Categories',
          'Global Facet Management',
        ]}
      />
      <PageNameLabel>Global Facet Management</PageNameLabel>
      <TablePanel
        basePath="/global/facets"
        headings={headings}
        mapping={mapping}
        newRowCreateMode="create-then-redirect"
        ruleType="global"
        isDuplicateEnabled={false}
      />
    </>
  );
};

export default FacetManagementPage;

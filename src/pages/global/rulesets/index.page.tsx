import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingReturnedGlobalRuleSets,
  MerchandisingRuleSet,
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
  MerchandisingReturnedGlobalRuleSets,
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet
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
    url: `/global/rulesets/edit/${id}`,
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

const RuleSets = () => {
  const headings = [
    'Identifier',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Global category ranking rules</title>
      </Head>
      <>
        <Heading
          breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
        />

        <PageNameLabel>Global category ranking rules</PageNameLabel>
        <TablePanel
          basePath="/global/rulesets"
          headings={headings}
          mapping={mapping}
          newRowCreateMode="create-then-redirect"
          ruleType="global"
          isDuplicateEnabled={false}
          writeEnabled={hasWriteAccess}
        />
      </>
    </>
  );
};

export default RuleSets;

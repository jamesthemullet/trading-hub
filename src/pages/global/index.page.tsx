import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingReturnedGlobalRuleSets,
  MerchandisingRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import type { RuleSetMapping } from '@/libs/components/types';
import { ROUTES } from '@/libs/constants/routes';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';
import { PageNameLabel } from '@/libs/utils/shared.styles';

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
  newRuleSet: search().betaMerchandisingGlobalRulesetCreate2,
  ruleSetToRow: ({ id, isEnabled, lastChanged, countryCode }) => ({
    id,
    identifier: '*',
    isEnabled,
    lastChanged,
    url: ROUTES.GLOBAL.RULESETS.EDIT(id),
    countryCode,
  }),
  allToArray: (data) => data.ruleSets,
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
        <title>Merchandising Hub | M&S | Global</title>
      </Head>

      <Heading
        breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
      />

      <PageNameLabel marginBottom>Global</PageNameLabel>
      <TablePanel
        basePath="/global"
        headings={headings}
        mapping={mapping}
        ruleType="global"
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RuleSets;

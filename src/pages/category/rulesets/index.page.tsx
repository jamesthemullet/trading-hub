import type {
  MerchandisingCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSets,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { TablePanel } from '@/libs/components/table-panel/table-panel';
import type { RuleSetMapping } from '@/libs/components/types';
import { formatCategoriesInfo } from '@/libs/components/utils/format-categories-info';
import { PageNameLabel } from '@/libs/components/utils/shared.styles';
import { useAccess } from '@/libs/hooks/use-access';

import Head from 'next/head';

const mapping: RuleSetMapping<
  MerchandisingReturnedCategoryRuleSets,
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingCategoryRuleSet
> = {
  queryAllRuleSets: search().betaMerchandisingCategoryRulesetList,
  deleteRuleSetById: search().betaMerchandisingCategoryRulesetDelete,
  queryRuleSetById: search().betaMerchandisingCategoryRulesetDetail,
  updateRuleSetById: search().betaMerchandisingCategoryRulesetUpdate,
  newRuleSet: (returnedRuleSet) =>
    search().betaMerchandisingCategoryRulesetCreate({
      ...returnedRuleSet,
      facets: returnedRuleSet.facets || [],
    }),
  ruleSetToRow: ({
    id,
    isEnabled,
    lastChanged,
    categoriesInfo,
    startDate,
    endDate,
    countryCode,
  }) => ({
    id: id,
    identifier: formatCategoriesInfo(categoriesInfo),
    isEnabled,
    lastChanged,
    url: `/category/rulesets/edit/${id}`,
    categoryPlpUrl: categoriesInfo[0].plpUrl,
    startDate,
    endDate,
    countryCode,
  }),
  allToArray: (data) => data.ruleSets,
  returnedToRuleSet: (returnedRuleSet) => {
    return {
      categoryIds: returnedRuleSet.categoriesInfo.map(
        (category) => category.id
      ),
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
    'Breadcrumb',
    'Schedule',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Cat');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Category ranking rules</title>
      </Head>
      <>
        <Heading
          breadcrumbs={[
            'Search & Merchandising',
            'Categories',
            'Ranking rules',
          ]}
        />

        <PageNameLabel>Category ranking rules</PageNameLabel>
        <TablePanel
          basePath="/category"
          headings={headings}
          mapping={mapping}
          ruleType="categoryRanking"
          writeEnabled={hasWriteAccess}
        />
      </>
    </>
  );
};

export default RuleSets;

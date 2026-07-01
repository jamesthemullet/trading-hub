import type { ReactElement } from 'react';

import type {
  MerchandisingCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSets,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import type { RuleSetMapping } from '@/libs/components/types';
import { ROUTES } from '@/libs/constants/routes';
import { FacetType, RuleType } from '@/libs/constants/rule-types';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';
import { formatCategoriesInfo } from '@/libs/utils/format-categories-info';

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
      facets: returnedRuleSet.facets ?? [],
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
    id,
    identifier: formatCategoriesInfo(categoriesInfo),
    isEnabled,
    lastChanged,
    url: ROUTES.CATEGORY.RULESETS.EDIT(id),
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

const RuleSets = (): ReactElement => {
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
        <title>Merchandising Hub | M&S | Categories</title>
      </Head>

      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories']}
        title="Categories"
      />

      <TablePanel
        basePath="/category"
        headings={headings}
        mapping={mapping}
        ruleType={RuleType.CategoryRanking}
        facetType={FacetType.Category}
        isWriteEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RuleSets;

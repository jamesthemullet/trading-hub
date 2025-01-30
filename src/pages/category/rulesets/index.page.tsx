import {
  CategoryRuleSet,
  ReturnedCategoryRuleSet,
  ReturnedCategoryRuleSets,
  search,
} from '@/libs/api';
import { Heading } from '@/libs/components';
import { TablePanel } from '@/libs/components/table-panel/table-panel';
import { RuleSetMapping } from '@/libs/components/types';
import { formatCategoriesInfo } from '@/libs/components/utils/format-categories-info';
import { PageNameLabel } from '@/libs/components/utils/shared.styles';

import Head from 'next/head';

import { AccessDeny } from '../../../libs/components/access-deny/access-deny';
import { useAccess } from '../../../libs/hooks/use-access';
import { CAT_READ_ROLE, CAT_WRITE_ROLE } from '../category-config';

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

  const mapping: RuleSetMapping<
    ReturnedCategoryRuleSets,
    ReturnedCategoryRuleSet,
    CategoryRuleSet
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
    getEmptyRuleSet: () => ({
      categoryIds: [],
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

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: CAT_READ_ROLE,
    writeRole: CAT_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={CAT_READ_ROLE} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Category ranking rules</title>
      </Head>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Categories', 'Ranking rules']}
      />

      <PageNameLabel>Category ranking rules</PageNameLabel>
      <TablePanel
        basePath="/category/rulesets"
        headings={headings}
        mapping={mapping}
        ruleType="categoryRanking"
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RuleSets;

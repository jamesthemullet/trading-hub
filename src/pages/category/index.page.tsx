import type { ReactElement } from 'react';

import type {
  MerchandisingCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingReturnedCategoryRuleSets,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Button, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import type { RuleSetMapping } from '@/libs/components/types';
import {
  getNewFacetRoute,
  getNewRulesetRoute,
  ROUTES,
} from '@/libs/constants/routes';
import { FacetType, RuleType } from '@/libs/constants/rule-types';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';
import { useDraftRuleset } from '@/libs/hooks/use-draft-ruleset';
import { track } from '@/libs/hooks/utils/analytics';
import { formatCategoriesInfo } from '@/libs/utils/format-categories-info';

import Head from 'next/head';

import styles from './index.module.css';

const mapping: RuleSetMapping<
  MerchandisingReturnedCategoryRuleSets,
  MerchandisingReturnedCategoryRuleSet,
  MerchandisingCategoryRuleSet
> = {
  queryAllRuleSets: search().getCategoryRuleSets,
  deleteRuleSetById: search().deleteCategoryRuleSet,
  queryRuleSetById: search().getCategoryRuleSet,
  updateRuleSetById: search().updateCategoryRuleSet,
  newRuleSet: (returnedRuleSet) =>
    search().createCategoryRuleSet({
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
  const { clearDraft } = useDraftRuleset();

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
        actions={
          hasWriteAccess && (
            <div className={styles.buttonGroup}>
              <Button
                as="a"
                isInline
                theme="outlined"
                icon="plus-simple-green"
                href={getNewFacetRoute(FacetType.Category)}
                onClick={() => {
                  track({
                    event: `Add ${RuleType.CategoryRanking} facet rule`,
                  });
                  clearDraft();
                }}
              >
                Add facet rule
              </Button>

              <Button
                as="a"
                isInline
                theme="filled"
                icon="plus-simple-white"
                href={getNewRulesetRoute(RuleType.CategoryRanking)}
                onClick={() =>
                  track({
                    event: `Add ${RuleType.CategoryRanking} ranking rule`,
                  })
                }
              >
                Add ranking rule
              </Button>
            </div>
          )
        }
      />

      <TablePanel
        basePath="/category"
        headings={headings}
        mapping={mapping}
        ruleType={RuleType.CategoryRanking}
        isWriteEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RuleSets;

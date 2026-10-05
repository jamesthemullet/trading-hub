import type { ReactElement } from 'react';

import type {
  MerchandisingKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingReturnedKeywordRuleSets,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Button, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ReadOnlyBanner } from '@/libs/components/read-only-banner/read-only-banner';
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

import Head from 'next/head';

import styles from './index.module.css';

const mapping: RuleSetMapping<
  MerchandisingReturnedKeywordRuleSets,
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingKeywordRuleSet
> = {
  queryAllRuleSets: search().getKeywordRuleSets,
  deleteRuleSetById: search().deleteKeywordRuleSet,
  queryRuleSetById: search().getKeywordRuleSet,
  updateRuleSetById: search().updateKeywordRuleSet,
  newRuleSet: search().createKeywordRuleSet,
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
    url: ROUTES.SEARCH.RULESETS.EDIT(id),
    startDate,
    endDate,
    countryCode,
  }),
  allToArray: (data) => data.ruleSets,
  returnedToRuleSet: (returnedRuleSet) => {
    return {
      searchTerms: returnedRuleSet.searchTerms,
      countryCode: returnedRuleSet.countryCode ?? 'UK_IE',
      endDate: returnedRuleSet.endDate,
      excludedFacets: returnedRuleSet.excludedFacets,
      facets: returnedRuleSet.facets,
      isEnabled: returnedRuleSet.isEnabled,
      rules: returnedRuleSet.rules,
      startDate: returnedRuleSet.startDate,
    };
  },
};

const SearchRuleSets = (): ReactElement => {
  const headings = [
    'Identifier',
    'Schedule',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole, requiredWriteRole } =
    useAccess('Search');
  const { clearDraft } = useDraftRuleset();

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
        title="Search"
        banner={
          !hasWriteAccess && (
            <ReadOnlyBanner requiredWriteRole={requiredWriteRole} />
          )
        }
        actions={
          hasWriteAccess && (
            <div className={styles.buttonGroup}>
              <Button
                as="a"
                isInline
                theme="outlined"
                icon="plus-simple-green"
                href={getNewFacetRoute(FacetType.Search)}
                onClick={() => {
                  track({ event: `Add ${RuleType.SearchRanking} facet rule` });
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
                href={getNewRulesetRoute(RuleType.SearchRanking)}
                onClick={() =>
                  track({ event: `Add ${RuleType.SearchRanking} ranking rule` })
                }
              >
                Add ranking rule
              </Button>
            </div>
          )
        }
      />

      <TablePanel
        basePath="/search"
        headings={headings}
        mapping={mapping}
        ruleType={RuleType.SearchRanking}
        isWriteEnabled={hasWriteAccess}
      />
    </>
  );
};

export default SearchRuleSets;

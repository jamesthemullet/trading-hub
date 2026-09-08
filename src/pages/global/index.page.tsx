import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  GetGlobalRuleSetsLiteParamsCatalogueEnum,
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingReturnedGlobalRuleSetLite,
  MerchandisingReturnedGlobalRuleSetsLite,
  MerchandisingRuleSet,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Button, Heading, Tabs } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useCftoFlag } from '@/libs/components/feature-flag/feature-flag';
import type { RuleSetMapping } from '@/libs/components/types';
import { getNewRulesetRoute, ROUTES } from '@/libs/constants/routes';
import { RuleType } from '@/libs/constants/rule-types';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';
import { track } from '@/libs/hooks/utils/analytics';

import Head from 'next/head';

import styles from './index.module.css';

type GlobalCatalogue = GetGlobalRuleSetsLiteParamsCatalogueEnum;

const CATALOGUE_TABS: {
  title: string;
  catalogue: GlobalCatalogue;
  icons?: string[];
}[] = [
  {
    title: 'marksandspencer.com',
    catalogue: 'CLOTHING_AND_HOME',
    icons: [
      '/trading-hub/asset/icon-uk-flag.svg',
      '/trading-hub/asset/icon-ie-flag.svg',
    ],
  },
  {
    title: 'cfto.com',
    catalogue: 'CFTO',
    icons: ['/trading-hub/asset/christmas-tree.svg'],
  },
];

const getMapping = (
  catalogue: GlobalCatalogue
): RuleSetMapping<
  MerchandisingReturnedGlobalRuleSetsLite,
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
  MerchandisingReturnedGlobalRuleSetLite
> => ({
  queryAllRuleSets: (query) => search().getGlobalRuleSetsLite(catalogue, query),
  deleteRuleSetById: search().deleteGlobalRuleSet,
  queryRuleSetById: search().getGlobalRuleSet,
  updateRuleSetById: search().updateGlobalRuleSet,
  newRuleSet: (ruleSet) =>
    search().createCatalogueGlobalRuleSet(catalogue, ruleSet),
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
});

const RuleSets = (): ReactElement => {
  const headings = [
    'Identifier',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');
  const isCftoEnabled = useCftoFlag();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const catalogueTabs = useMemo(
    () =>
      isCftoEnabled
        ? CATALOGUE_TABS
        : CATALOGUE_TABS.filter((tab) => tab.catalogue !== 'CFTO'),
    [isCftoEnabled]
  );

  useEffect(() => {
    if (router.isReady && isCftoEnabled && router.query.catalogue === 'CFTO') {
      const cftoTabIndex = catalogueTabs.findIndex(
        (tab) => tab.catalogue === 'CFTO'
      );
      // istanbul ignore else -- catalogueTabs always contains CFTO while isCftoEnabled is true
      if (cftoTabIndex >= 0) {
        setCurrentTab(cftoTabIndex);
      }
    }
  }, [router.isReady, isCftoEnabled, router.query.catalogue, catalogueTabs]);

  const safeCurrentTab = Math.min(currentTab, catalogueTabs.length - 1);
  const activeCatalogue = catalogueTabs[safeCurrentTab].catalogue;
  const mapping = useMemo(() => getMapping(activeCatalogue), [activeCatalogue]);
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
        title="Global"
        actions={
          hasWriteAccess && (
            <Button
              as="a"
              isInline
              theme="filled"
              icon="plus-simple-white"
              href={`${getNewRulesetRoute(RuleType.Global)}?catalogue=${activeCatalogue}`}
              onClick={() =>
                track({ event: `Add ${RuleType.Global} ranking rule` })
              }
            >
              Add ranking rule
            </Button>
          )
        }
      />

      {isCftoEnabled && (
        <div className={styles.tabsWrapper}>
          <Tabs
            tabs={catalogueTabs}
            currentTab={currentTab}
            onTabChange={setCurrentTab}
          />
        </div>
      )}

      <TablePanel
        basePath="/global"
        headings={headings}
        mapping={mapping}
        ruleType={RuleType.Global}
        isWriteEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RuleSets;

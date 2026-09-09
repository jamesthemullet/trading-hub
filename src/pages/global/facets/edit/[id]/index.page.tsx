import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { ROUTES } from '@/libs/constants/routes';
import { FacetType } from '@/libs/constants/rule-types';
import { FacetsPanelSkeleton } from '@/libs/containers';
import { FacetsList } from '@/libs/features';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useSaveConflict } from '@/libs/hooks/use-save-conflict';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps): ReactElement => {
  const router = useRouter();
  const isHistoryView = router.query.history === 'true';
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;
  const catalogue =
    router.query.catalogue?.toString() === 'CFTO'
      ? 'CFTO'
      : 'CLOTHING_AND_HOME';

  const {
    globalRuleSet,
    error: globalRulesetError,
    isLoading: isCurrentLoading,
  } = useGlobalRuleSetDetail(isHistoryView ? '' : id);

  const historyData = useGlobalHistory(
    isHistoryView ? id : '',
    currentPage,
    currentPageSize
  );

  const {
    rulesetData,
    isLoading,
    error: historyError,
  } = useHistoricalOrCurrentRuleset({
    id,
    historyData: {
      history: historyData.history,
      isLoading: historyData.isLoading,
      error: historyData.error,
    },
    currentData: { data: globalRuleSet, isLoading: isCurrentLoading },
  });

  const { saveGlobalRuleset, error: savingGlobalRulesetError } =
    useGlobalRuleSetUpdate();

  const {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  } = useSaveConflict<MerchandisingReturnedGlobalRuleSet, MerchandisingRuleSet>(
    {
      save: (
        { facets, rules, isEnabled, excludedFacets, countryCode },
        versionOverride
      ) =>
        saveGlobalRuleset({
          ruleSetId: id,
          ruleSet: { facets, rules, isEnabled, excludedFacets, countryCode },
          version: versionOverride ?? globalRuleSet.version,
          catalogue,
        }),
      onSuccess: () => router.push(`/global?catalogue=${catalogue}`),
    }
  );

  const conflictDiffItems = useRulesetDiff(
    globalRuleSet,
    conflict?.currentEntity ?? globalRuleSet
  );

  const handleCancel = () => {
    router.push(`/global?catalogue=${catalogue}`);
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  useTrackRecentlyViewed({
    id,
    label: rulesetData ? '*' : undefined,
    url: ROUTES.GLOBAL.RULESETS.EDIT(id),
    type: 'global',
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global facets</title>
      </Head>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

      {globalRulesetError && (
        <ErrorMessage>
          Error whilst retrieving global ruleset: {globalRulesetError}
        </ErrorMessage>
      )}

      {historyError && (
        <ErrorMessage>
          Error whilst retrieving history: {historyError}
        </ErrorMessage>
      )}

      {savingGlobalRulesetError && (
        <ErrorMessage>
          Error whilst saving global ruleset: {savingGlobalRulesetError}
        </ErrorMessage>
      )}

      {!globalRulesetError &&
        !historyError &&
        (isLoading ? (
          <FacetsPanelSkeleton
            title="Global Facet Rule Editor"
            aria-busy="true"
          />
        ) : (
          <FacetsList
            facetType={FacetType.Global}
            isNewRuleset={false}
            currentRuleset={
              rulesetData
                ? {
                    ...rulesetData,
                    excludedFacets: rulesetData.excludedFacets ?? {
                      facets: [],
                    },
                  }
                : rulesetData
            }
            onCancel={handleCancel}
            onSave={runSave}
            isWriteEnabled={hasWriteAccess && !isHistoryView}
            lastChanged={rulesetData?.lastChanged}
          />
        ))}

      <ConflictModal
        opened={conflict !== null}
        entityLabel="global ruleset"
        diffItems={conflictDiffItems}
        changedBy={conflict?.currentEntity.lastChanged.user}
        isSaving={isOverwriting}
        onOverwrite={handleOverwrite}
        onDiscard={handleDiscard}
        onClose={closeConflict}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default Page;

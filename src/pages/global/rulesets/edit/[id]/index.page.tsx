import type { ReactElement } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedGlobalRuleSet,
  MerchandisingRuleSet,
} from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { useOptimisticLockingFlag } from '@/libs/components/feature-flag/feature-flag';
import { ROUTES } from '@/libs/constants/routes';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

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

  const historyData = useGlobalHistory(
    isHistoryView ? id : '',
    currentPage,
    currentPageSize
  );
  const { globalRuleSet, isLoading: isRuleSetLoading } = useGlobalRuleSetDetail(
    isHistoryView ? '' : id
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
    currentData: { data: globalRuleSet, isLoading: isRuleSetLoading },
  });

  const { saveGlobalRuleset, error } = useGlobalRuleSetUpdate();
  const shouldUseV1 = useOptimisticLockingFlag();

  const [conflict, setConflict] = useState<{
    currentEntity: MerchandisingReturnedGlobalRuleSet;
    attemptedRuleSet: MerchandisingRuleSet;
  } | null>(null);
  const [isOverwriting, setIsOverwriting] = useState(false);

  const conflictDiffItems = useRulesetDiff(
    globalRuleSet,
    conflict?.currentEntity ?? globalRuleSet
  );

  const persistRuleSet = async ({
    ruleSetId,
    ruleSet,
    version,
  }: {
    ruleSetId: string;
    ruleSet: MerchandisingRuleSet;
    version?: number;
  }) => {
    const response = await saveGlobalRuleset({
      ruleSetId,
      ruleSet,
      version,
      shouldUseV1,
    });

    if (response.status === 'success') {
      router.push('/global');
    } else if (response.status === 'conflict') {
      setConflict({
        currentEntity: response.currentEntity,
        attemptedRuleSet: ruleSet,
      });
    }
  };

  const handleOverwrite = async () => {
    // istanbul ignore if
    if (!conflict) return;

    setIsOverwriting(true);
    await persistRuleSet({
      ruleSetId: id,
      ruleSet: conflict.attemptedRuleSet,
      version: conflict.currentEntity.version,
    });
    setIsOverwriting(false);
  };

  const handleDiscard = () => {
    setConflict(null);
    router.reload();
  };

  useTrackRecentlyViewed({
    id: rulesetData?.id,
    label: rulesetData?.id ? '*' : undefined,
    url: ROUTES.GLOBAL.RULESETS.EDIT(id),
    type: 'global',
  });

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global ruleset</title>
      </Head>

      <Heading
        breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
      />

      {(error || historyError) && (
        <ErrorMessage>{error || historyError}</ErrorMessage>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        rulesetData && (
          <>
            <Ruleset
              isEnabled={rulesetData.isEnabled}
              originalRuleset={isHistoryView ? undefined : globalRuleSet}
              onSave={({
                ruleSetId,
                ruleSet,
              }: {
                ruleSetId: string;
                ruleSet: MerchandisingRuleSet;
              }) =>
                persistRuleSet({
                  ruleSetId,
                  ruleSet,
                  version: globalRuleSet.version,
                })
              }
              onCancel={() => router.push('/global')}
              rulesetMerchandisingRules={rulesetData.rules}
              rulesetFacets={rulesetData.facets}
              rulesetExcludedFacets={rulesetData.excludedFacets}
              rulesetType="global"
              rulesetId={id}
              countryCode={rulesetData.countryCode}
              isWriteEnabled={hasWriteAccess && !isHistoryView}
            />
            <ConflictModal
              opened={conflict !== null}
              diffItems={conflictDiffItems}
              changedBy={conflict?.currentEntity.lastChanged.user}
              isSaving={isOverwriting}
              onOverwrite={handleOverwrite}
              onDiscard={handleDiscard}
              onClose={() => setConflict(null)}
            />
          </>
        )
      )}
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

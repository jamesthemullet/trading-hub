import { useId, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const isHistoryView = router.query.history === 'true';

  const historyData = useGlobalHistory(isHistoryView ? id : '');
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

  const [ruleSetIdToSave, setRuleSetIdToSave] = useState<string>('');
  const [ruleSetToSave, setRuleSetToSave] =
    useState<MerchandisingRuleSet>(globalRuleSet);

  const { saveGlobalRuleset, error } = useGlobalRuleSetUpdate();

  const onCloseModal = () => setIsModalOpen(false);

  const saveRuleSet = async () => {
    const response = await saveGlobalRuleset({
      ruleSetId: ruleSetIdToSave,
      ruleSet: ruleSetToSave,
    });

    // istanbul ignore else
    if (response.status === 'success') {
      router.push('/global');
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  const titleId = useId();
  const descriptionId = useId();

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    saveRuleSet();
  };

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
          <Ruleset
            isEnabled={rulesetData.isEnabled}
            onSave={({
              ruleSetId,
              ruleSet,
            }: {
              ruleSetId: string;
              ruleSet: MerchandisingRuleSet;
            }) => {
              setIsModalOpen(true);
              setRuleSetIdToSave(ruleSetId);
              setRuleSetToSave(ruleSet);
            }}
            onCancel={() => router.push('/global')}
            rulesetMerchandisingRules={rulesetData.rules}
            rulesetFacets={rulesetData.facets}
            rulesetExcludedFacets={rulesetData.excludedFacets}
            rulesetType="global"
            rulesetId={id}
            countryCode={rulesetData.countryCode}
            writeEnabled={hasWriteAccess && !isHistoryView}
          />
        )
      )}

      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={onCloseModal}
        padding={10}
      >
        <Modal.Overlay blur={3} />
        <Modal.Content
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
            titleId={titleId}
            descriptionId={descriptionId}
          />
        </Modal.Content>
      </Modal.Root>
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

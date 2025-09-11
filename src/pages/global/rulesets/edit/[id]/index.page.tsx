import { useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import ConfirmationModal from '@/libs/components/modals/confirmation-modal/confirmation-modal';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { globalRuleSet, isLoading } = useGlobalRuleSetDetail(id);

  const [ruleSetIdToSave, setRuleSetIdToSave] = useState<string>('');
  const [ruleSetToSave, setRuleSetToSave] =
    useState<MerchandisingRuleSet>(globalRuleSet);

  const { saveGlobalRuleset, error } = useGlobalRuleSetUpdate();
  const router = useRouter();

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

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

      {isLoading ? (
        <Loader />
      ) : (
        <Ruleset
          isEnabled={globalRuleSet.isEnabled}
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
          rulesetMerchandisingRules={globalRuleSet.rules}
          rulesetFacets={globalRuleSet.facets}
          rulesetExcludedFacets={globalRuleSet.excludedFacets}
          rulesetType="global"
          rulesetId={id}
          countryCode={globalRuleSet.countryCode}
          writeEnabled={hasWriteAccess}
        />
      )}

      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={onCloseModal}
        padding={10}
        role="dialog"
        aria-modal="true"
      >
        <Modal.Overlay blur={3} />
        <Modal.Content>
          <ConfirmationModal
            onCloseModal={onCloseModal}
            handleModalConfirm={handleModalConfirm}
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

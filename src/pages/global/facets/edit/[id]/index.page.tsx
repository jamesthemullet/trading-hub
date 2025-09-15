import { useEffect, useId, useState } from 'react';
import { Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import ConfirmationModal from '@/libs/components/modals/confirmation-modal/confirmation-modal';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import GlobalFacetsPanel from '@/libs/modules/facets-panel/global-facets-panel';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    globalRuleSet,
    error: globalRulesetError,
    isLoading,
  } = useGlobalRuleSetDetail(id);

  const [includedFacetsToSave, setIncludedFacetsToSave] = useState<
    MerchandisingReturnedFacet[]
  >([]);
  const [excludedFacetsToSave, setExcludedFacetsToSave] = useState<
    MerchandisingExcludedFacets | undefined
  >();

  const [countryCodeToSave, setCountryCodeToSave] =
    useState<MerchandisingCountryCode>('UK_IE');

  const onCloseModal = () => setIsModalOpen(false);

  const [facetsFromGlobalRuleSet, setFacetsFromGlobalRuleSet] = useState<
    MerchandisingRuleSetFacetConfigWithId[] | []
  >([]);

  useEffect(() => {
    // istanbul ignore else
    if (globalRuleSet.facets) {
      setFacetsFromGlobalRuleSet(globalRuleSet.facets);
    }
  }, [globalRuleSet]);

  const { saveGlobalRuleset, error: savingGlobalRulesetError } =
    useGlobalRuleSetUpdate();

  const handleSave = async () => {
    const response = await saveGlobalRuleset({
      ruleSetId: globalRuleSet.id,
      ruleSet: {
        facets: includedFacetsToSave,
        rules: globalRuleSet.rules,
        isEnabled: globalRuleSet.isEnabled,
        excludedFacets: excludedFacetsToSave,
        countryCode: countryCodeToSave,
      },
    });

    // istanbul ignore else
    if (response) {
      return router.push('/global');
    }
  };

  const handleCancel = () => {
    router.push('/global');
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  const titleId = useId();
  const descriptionId = useId();

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  const handleModalConfirm = async () => {
    setIsModalOpen(false);
    handleSave();
  };

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global facets</title>
      </Head>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

      {globalRulesetError && (
        <ErrorMessage role="alert">
          Error whilst retrieving global ruleset: {globalRulesetError}
        </ErrorMessage>
      )}

      {savingGlobalRulesetError && (
        <ErrorMessage role="alert">
          Error whilst saving global ruleset: {savingGlobalRulesetError}
        </ErrorMessage>
      )}

      {!globalRulesetError && (
        <GlobalFacetsPanel
          ruleSetIncludedFacets={facetsFromGlobalRuleSet}
          ruleSetExcludedFacets={globalRuleSet.excludedFacets}
          isLoading={isLoading}
          countryCode={globalRuleSet.countryCode || 'UK_IE'}
          onSave={({ countryCode, includedFacets, excludedFacets }) => {
            setCountryCodeToSave(countryCode);
            setIncludedFacetsToSave(includedFacets);
            setExcludedFacetsToSave(excludedFacets);
            setIsModalOpen(true);
          }}
          onCancel={handleCancel}
          writeEnabled={hasWriteAccess}
        />
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

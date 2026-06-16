import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
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
import { ROUTES } from '@/libs/constants/routes';
import ConfirmationModal from '@/libs/containers/shared/modals/confirmation-modal/confirmation-modal';
import GlobalFacetsPanel from '@/libs/features/facets/global-facets-panel/global-facets-panel';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useGlobalHistory } from '@/libs/hooks/global/history/use-global-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    if (rulesetData?.facets) {
      setFacetsFromGlobalRuleSet(rulesetData.facets);
    }
  }, [rulesetData]);

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

  useTrackRecentlyViewed({
    id,
    label: rulesetData ? '*' : undefined,
    url: ROUTES.GLOBAL.RULESETS.EDIT(id),
    type: 'global',
  });

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

      {!globalRulesetError && !historyError && (
        <GlobalFacetsPanel
          ruleSetIncludedFacets={facetsFromGlobalRuleSet}
          ruleSetExcludedFacets={rulesetData?.excludedFacets}
          isLoading={isLoading}
          countryCode={rulesetData?.countryCode ?? 'UK_IE'}
          onSave={({ countryCode, includedFacets, excludedFacets }) => {
            setCountryCodeToSave(countryCode);
            setIncludedFacetsToSave(includedFacets);
            setExcludedFacetsToSave(excludedFacets);
            setIsModalOpen(true);
          }}
          onCancel={handleCancel}
          isWriteEnabled={hasWriteAccess && !isHistoryView}
        />
      )}
      <Modal.Root
        centered
        opened={isModalOpen}
        onClose={onCloseModal}
        padding={10}
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

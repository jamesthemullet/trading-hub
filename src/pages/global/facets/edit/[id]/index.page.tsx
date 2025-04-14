import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { Divider, Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import {
  Button,
  ErrorMessage,
  Header3,
  Heading,
  spacing,
  Text,
} from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import GlobalFacetsPanel from '@/libs/modules/facets-panel/global-facets-panel';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

const Buttons = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: right;
  margin-top: ${spacing(1)};

  button {
    width: auto;
    margin-left: ${spacing(2)};
  }
`;

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

    if (response) {
      return router.push('/global/facets/');
    }
  };

  const handleCancel = () => {
    router.push('/global/facets');
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global facets</title>
      </Head>
      <main>
        <Heading
          breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
        />

        {globalRulesetError && (
          <ErrorMessage>
            Error whilst retrieving global ruleset: {globalRulesetError}
          </ErrorMessage>
        )}

        {savingGlobalRulesetError && (
          <ErrorMessage>
            Error whilst saving global ruleset: {savingGlobalRulesetError}
          </ErrorMessage>
        )}

        {!globalRulesetError && (
          <>
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
          </>
        )}
      </main>
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
          <Modal.Body>
            <Header3>Apply global changes</Header3>

            <Text withMargin>
              This action will apply live changes on the M&S website and app. Do
              you want to proceed?
            </Text>

            <Divider />

            <Buttons>
              <Button
                onClick={onCloseModal}
                theme="secondary"
                aria-label="Close confirmation modal"
              >
                Cancel
              </Button>

              <Button
                onClick={() => {
                  setIsModalOpen(false);
                  handleSave();
                }}
                theme="primary"
                data-autofocus
              >
                Apply action
              </Button>
            </Buttons>
          </Modal.Body>
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

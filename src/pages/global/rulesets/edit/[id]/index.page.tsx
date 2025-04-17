import styled from '@emotion/styled';
import { useState } from 'react';
import { Divider, Modal } from '@mantine/core';
import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import {
  Button,
  ErrorMessage,
  Header3,
  Heading,
  Loader,
  spacing,
  Text,
} from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Ruleset } from '@/libs/modules/ruleset/ruleset';

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

    if (response.status === 'success') {
      router.push('/global/rulesets');
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Glob');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit global ruleset</title>
      </Head>
      <>
        <Heading
          breadcrumbs={['Setup', 'Global Ranking Rules', 'Product Grid']}
        />

        {error && <ErrorMessage>{error}</ErrorMessage>}

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
            onCancel={() => router.push('/global/rulesets')}
            rulesetMerchandisingRules={globalRuleSet.rules}
            rulesetFacets={globalRuleSet.facets}
            rulesetExcludedFacets={globalRuleSet.excludedFacets}
            rulesetType="global"
            rulesetId={id}
            countryCode={globalRuleSet.countryCode}
            writeEnabled={hasWriteAccess}
          />
        )}
      </>
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
                  saveRuleSet();
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

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import {
  CountryCode,
  ExcludedFacets,
  ReturnedFacet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useGlobalRuleSetDetail, useGlobalRuleSetUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import GlobalFacetsPanel from '@/libs/modules/facets-panel/global-facets-panel';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import { GLOB_READ_ROLE, GLOB_WRITE_ROLE } from '../../../global-config';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const router = useRouter();

  const {
    globalRuleSet,
    error: globalRulesetError,
    isLoading,
  } = useGlobalRuleSetDetail(id);

  const [facetsFromGlobalRuleSet, setFacetsFromGlobalRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);

  useEffect(() => {
    if (globalRuleSet.facets) {
      setFacetsFromGlobalRuleSet(globalRuleSet.facets);
    }
  }, [globalRuleSet]);

  const { saveGlobalRuleset, error: savingGlobalRulesetError } =
    useGlobalRuleSetUpdate();

  const handleSave = async ({
    includedFacets,
    excludedFacets,
    countryCode,
  }: {
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
  }) => {
    const response = await saveGlobalRuleset({
      ruleSetId: globalRuleSet.id,
      ruleSet: {
        facets: includedFacets,
        rules: globalRuleSet.rules,
        isEnabled: globalRuleSet.isEnabled,
        excludedFacets,
        countryCode,
      },
    });

    if (response) {
      return router.push(`/global/facets/`);
    }
  };

  const handleCancel = () => {
    router.push('/global/facets');
  };

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: GLOB_READ_ROLE,
    writeRole: GLOB_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={GLOB_READ_ROLE} />;
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

      {savingGlobalRulesetError && (
        <ErrorMessage>
          Error whilst saving global ruleset: {savingGlobalRulesetError}
        </ErrorMessage>
      )}

      {!globalRulesetError && (
        <GlobalFacetsPanel
          ruleSetIncludedFacets={facetsFromGlobalRuleSet}
          ruleSetExcludedFacets={globalRuleSet.excludedFacets}
          isLoading={isLoading}
          countryCode={globalRuleSet.countryCode || 'UK_IE'}
          onSave={handleSave}
          onCancel={handleCancel}
          writeEnabled={hasWriteAccess}
        />
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

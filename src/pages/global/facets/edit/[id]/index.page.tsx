import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import {
  CountryCode,
  ExcludedFacets,
  ReturnedFacet,
  RuleSetFacetConfigWithId,
} from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import {
  useGlobalFacetsList,
  useGlobalFacetUpdate,
  useGlobalRuleSetDetail,
  useGlobalRuleSetUpdate,
} from '@/libs/hooks';
import { FacetsPanel } from '@/libs/modules/facets-panel/facets-panel';
import { FacetsPanelSkeleton } from '@/libs/modules/facets-panel/facets-panel-skeleton';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';

type PageProps = {
  id: string;
};

const Page = ({ id }: PageProps) => {
  const {
    facets,
    isLoading,
    onRefreshFacetList,
    error: globalFacetsListError,
  } = useGlobalFacetsList();

  const router = useRouter();

  const { globalRuleSet, error: globalRulesetError } =
    useGlobalRuleSetDetail(id);

  const [globalFacetsList, setGlobalFacetsList] =
    useState<ReturnedFacet[]>(facets);
  const [facetsFromGlobalRuleSet, setFacetsFromGlobalRuleSet] = useState<
    RuleSetFacetConfigWithId[] | []
  >([]);
  const [initialIncludedFacets, setInitialIncludedFacets] = useState<string[]>(
    []
  );
  const [initialExcludedFacets, setInitialExcludedFacets] = useState<string[]>(
    []
  );

  useEffect(() => {
    setGlobalFacetsList(facets);
  }, [facets]);

  useEffect(() => {
    if (globalRulesetError !== '') {
      return;
    }
    const includedFacets = facetsFromGlobalRuleSet.map((facet) => {
      return facet.id;
    });

    const excludedFacets =
      globalRuleSet.excludedFacets?.facets?.map(
        (facet) =>
          // istanbul ignore next
          facet.id || ''
      ) || [];

    setInitialIncludedFacets(includedFacets);
    setInitialExcludedFacets(excludedFacets);
  }, [
    globalFacetsList,
    facetsFromGlobalRuleSet,
    globalRulesetError,
    globalRuleSet.excludedFacets?.facets,
  ]);

  useEffect(() => {
    if (globalRuleSet.facets) {
      setFacetsFromGlobalRuleSet(globalRuleSet.facets);
    }
  }, [globalRuleSet]);

  const { handleGlobalFacetUpdate, error: updatingGlobalFacetError } =
    useGlobalFacetUpdate();
  const { saveGlobalRuleset, error: savingGlobalRulesetError } =
    useGlobalRuleSetUpdate();

  const handleSave = async ({
    includedFacets,
    excludedFacets,
    countryCode,
  }: {
    categoryIds: string[];
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

  const onFacetDataChange = async ({
    value,
    facet,
  }: {
    value: string | 'included' | 'excluded';
    facet: ReturnedFacet;
  }) => {
    const response = await handleGlobalFacetUpdate({
      facetId: facet.id,
      data: {
        displayValue: value,
        indexPropertyName: facet.indexPropertyName,
        excludedValues: facet.excludedValues,
        boosted: facet.boosted,
      },
    });

    if (!response || !('displayValue' in response)) {
      return;
    }

    const updatedGlobalFacets = globalFacetsList.map((globalFacet) => {
      if (globalFacet.id === facet.id) {
        return { ...globalFacet, displayValue: response?.displayValue };
      }
      return globalFacet;
    });

    setGlobalFacetsList(updatedGlobalFacets);
  };

  return (
    <>
      <Heading
        breadcrumbs={['Categories', 'Global Facet Management', 'Editor']}
      />

      {globalFacetsListError && (
        <ErrorMessage>
          Error whilst retrieving global facet list: {globalFacetsListError}
        </ErrorMessage>
      )}

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

      {updatingGlobalFacetError && (
        <ErrorMessage>
          Error whilst updating global facet: {updatingGlobalFacetError}
        </ErrorMessage>
      )}

      {isLoading ? (
        <FacetsPanelSkeleton title="Global Facet Rule Editor" />
      ) : (
        <FacetsPanel
          onSave={handleSave}
          onCancel={handleCancel}
          onFacetDataChange={onFacetDataChange}
          refreshData={onRefreshFacetList}
          title="Global Facet Rule Editor"
          facetsData={globalFacetsList}
          initialIncludedFacets={initialIncludedFacets}
          initialExcludedFacets={initialExcludedFacets}
          facetType="global"
          canMergeValueAttributes
          countryCode={globalRuleSet.countryCode || 'UK_IE'}
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

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { AccessDeny, ErrorMessage, Heading } from '@/libs/components';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import {
  useDraftRuleset,
  useFacetsList,
  useGetFacetAttributeValues,
  useSearchRuleSetPreview,
  useSearchRuleSetUpdate,
} from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const Page = () => {
  const router = useRouter();

  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();

  const { updateRuleSet, error: updateRuleSetError } = useSearchRuleSetUpdate();
  const { getDraft, saveDraft } = useDraftRuleset();

  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  const [searchQuery, setSearchQuery] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [draftRuleset, setDraftRuleset] = useState<
    (MerchandisingRuleSet & { searchTerms: string[] }) | null
  >(null);

  const [selectedFacet, setSelectedFacet] = useState<
    MerchandisingRuleSetFacetConfigWithId | undefined
  >(undefined);

  const { callback: handleSearch } = useDebounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  useEffect(() => {
    const draft = getDraft();
    if (ruleSetId === 'draft' && draft && draft.type === 'search') {
      setIsDraft(true);
      setDraftRuleset(draft.ruleset);
    }
  }, [ruleSetId, getDraft]);

  const searchTermsArray = useMemo(() => {
    const searchTerms = router.query.searchTerms;
    if (typeof searchTerms === 'string') {
      return [searchTerms];
    }
    if (Array.isArray(searchTerms)) {
      return searchTerms.filter((v): v is string => typeof v === 'string');
    }
    return undefined;
  }, [router.query.searchTerms]);

  // Currently we don't send searchTerms to this endpoint, which I think is wrong, awaiting confirmation
  const { attributeValues } = useGetFacetAttributeValues({
    facetId,
    query: searchQuery,
    searchTerms: searchTermsArray,
    countryCode,
  });

  const { ruleSet, error, isLoading } = useSearchRuleSetPreview(
    ruleSetId,
    ruleSetId === 'draft'
  );

  const { facets } = useFacetsList({
    query: searchTermsArray ?? [],
    queryBy: 'searchTerms',
    enabled: true,
    countryCode: countryCode ?? 'UK_IE',
  });

  const facet = facets.find((facet) => facet.id === facetId);

  // Use draft ruleset data or fetched data
  const effectiveRuleSet = isDraft && draftRuleset ? draftRuleset : ruleSet;

  useEffect(() => {
    // istanbul ignore else
    if (facets.length > 0 && facet) {
      const rulesetConfig = effectiveRuleSet.facets?.find(
        (f: MerchandisingRuleSetFacetConfigWithId) => f.id === facet.id
      );

      setSelectedFacet({
        ...facet,
        boosted: rulesetConfig?.boosted ?? [],
        excludedValues: rulesetConfig?.excludedValues ?? [],
      });
    }
  }, [facets, facet, effectiveRuleSet.facets]);

  const handleSave = async (
    newFacet: MerchandisingRuleSetFacetConfigWithId
  ) => {
    if (isDraft && draftRuleset) {
      // istanbul ignore next
      const newFacets = draftRuleset.facets?.map(
        (facet: MerchandisingRuleSetFacetConfigWithId) => {
          if (facet.id === newFacet.id) {
            return newFacet;
          }
          return facet;
        }
      ) ?? [newFacet];

      const updatedDraft: MerchandisingRuleSet & { searchTerms: string[] } = {
        ...draftRuleset,
        facets: newFacets,
      };

      saveDraft({ ruleset: updatedDraft, type: 'search' });

      await router.push(`/search/facets/new?ruleSetId=draft`);
      return;
    }

    const newFacets = effectiveRuleSet.facets?.map(
      (facet: MerchandisingRuleSetFacetConfigWithId) => {
        if (facet.id === newFacet.id) {
          return newFacet;
        }

        return facet;
      }
    );

    const response = await updateRuleSet({
      ...effectiveRuleSet,
      searchTerms: effectiveRuleSet.searchTerms || [],
      ruleSetId,
      facets: newFacets,
    });

    // istanbul ignore else
    if (response) {
      return router.push('/search');
    }
  };

  const { hasReadAccess, requiredReadRole, hasWriteAccess } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&S | Edit Search Ruleset Facet Values
        </title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search',
          'Facet Management Editor',
          `Facet values settings: ${displayName}`,
        ]}
      />

      {error && <ErrorMessage centred>{error}</ErrorMessage>}
      {updateRuleSetError && (
        <ErrorMessage centred>
          Error whilst updating ruleset: {updateRuleSetError}
        </ErrorMessage>
      )}

      {(!isLoading || isDraft) && selectedFacet && (
        <CategoryAndSearchFacetsPanelPageLayout
          attributeValues={attributeValues}
          facet={selectedFacet}
          displayName={displayName}
          facetType="search"
          ruleSetId={ruleSetId}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onSave={handleSave}
          writeEnabled={hasWriteAccess}
          headerText={searchTermsArray?.join(', ')}
          countryCode={countryCode}
          isDraftRuleset={isDraft}
        />
      )}
    </>
  );
};

export default Page;

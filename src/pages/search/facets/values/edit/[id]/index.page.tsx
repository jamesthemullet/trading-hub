import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedKeywordRuleSet,
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { AccessDeny, ErrorMessage, Heading } from '@/libs/components';
import { ConflictModal } from '@/libs/components/conflict-modal/conflict-modal';
import { FacetType } from '@/libs/constants/rule-types';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import {
  type DraftRulesetState,
  type DraftSearchRuleset,
  useDraftRuleset,
  useFacetsList,
  useGetFacetAttributeValues,
  useSearchRuleSetPreview,
  useSearchRuleSetUpdate,
} from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { useRulesetDiff } from '@/libs/hooks/use-ruleset-diff';
import { useSaveConflict } from '@/libs/hooks/use-save-conflict';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const isSearchDraft = (
  draft: DraftRulesetState | null
): draft is DraftSearchRuleset => draft?.type === 'search';

const Page = (): ReactElement => {
  const router = useRouter();

  const { getStringParam, getCountryCodeParam, getBooleanParam } =
    useTypeSafeQuery();

  const { updateRuleSet, error: updateRuleSetError } = useSearchRuleSetUpdate();
  const { getDraft, saveDraft } = useDraftRuleset();

  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');
  const isReadOnly = getBooleanParam('readOnly');

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

    if (ruleSetId !== 'draft' || !isSearchDraft(draft)) {
      return;
    }

    setIsDraft(true);
    setDraftRuleset(draft.ruleset);
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

  const {
    conflict,
    isOverwriting,
    runSave,
    handleOverwrite,
    handleDiscard,
    closeConflict,
  } = useSaveConflict<
    MerchandisingReturnedKeywordRuleSet,
    MerchandisingRuleSetFacetConfigWithId
  >({
    save: (newFacet, versionOverride) => {
      const newFacets = effectiveRuleSet.facets?.map(
        (facet: MerchandisingRuleSetFacetConfigWithId) => {
          if (facet.id === newFacet.id) {
            return newFacet;
          }

          return facet;
        }
      );

      return updateRuleSet({
        ...effectiveRuleSet,
        searchTerms: effectiveRuleSet.searchTerms || [],
        ruleSetId,
        facets: newFacets,
        version: versionOverride ?? ruleSet.version,
      });
    },
    onSuccess: () => router.push('/search'),
  });

  const conflictDiffItems = useRulesetDiff(
    ruleSet,
    conflict?.currentEntity ?? ruleSet,
    {
      originalSearchTerms: ruleSet.searchTerms,
      currentSearchTerms: (conflict?.currentEntity ?? ruleSet).searchTerms,
      facetNames: Object.fromEntries(facets.map((f) => [f.id, f.displayValue])),
    }
  );

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

    return runSave(newFacet);
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
        <>
          <CategoryAndSearchFacetsPanelPageLayout
            attributeValues={attributeValues}
            facet={selectedFacet}
            displayName={displayName}
            facetType={FacetType.Search}
            ruleSetId={ruleSetId}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            onSave={handleSave}
            isWriteEnabled={hasWriteAccess && !isReadOnly}
            headerText={searchTermsArray?.join(', ')}
            countryCode={countryCode}
            isDraftRuleset={isDraft}
            lastChanged={ruleSet.lastChanged}
          />
          <ConflictModal
            opened={conflict !== null}
            entityLabel="keyword ruleset"
            diffItems={conflictDiffItems}
            changedBy={conflict?.currentEntity.lastChanged.user}
            isSaving={isOverwriting}
            onOverwrite={handleOverwrite}
            onDiscard={handleDiscard}
            onClose={closeConflict}
          />
        </>
      )}
    </>
  );
};

export default Page;

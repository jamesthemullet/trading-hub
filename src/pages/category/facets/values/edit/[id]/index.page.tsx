import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';

import type {
  MerchandisingReturnedFacet,
  MerchandisingRuleSet,
  MerchandisingRuleSetFacetConfigWithId,
} from '@/libs/api';
import { AccessDeny, ErrorMessage, Heading } from '@/libs/components';
import { FacetType } from '@/libs/constants/rule-types';
import { CategoryAndSearchFacetsPanelPageLayout } from '@/libs/features';
import {
  type DraftCategoryRuleset,
  type DraftRulesetState,
  useDraftRuleset,
  useFacetsList,
  useGetFacetAttributeValues,
  useRuleSetDetail,
  useUpdateRuleSet,
} from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { useTypeSafeQuery } from '@/libs/hooks/use-type-safe-query';
import { useDebounce } from '@/libs/hooks/utils/use-debounce';

import Head from 'next/head';

const isCategoryDraft = (
  draft: DraftRulesetState | null
): draft is DraftCategoryRuleset => draft?.type === 'category';

const Page = () => {
  const router = useRouter();
  const { hasReadAccess, hasWriteAccess, requiredReadRole } = useAccess('Cat');

  const { updateCategoryRuleSet, error: updateRulesetError } =
    useUpdateRuleSet();
  const { getDraft, saveDraft } = useDraftRuleset();

  const { getStringParam, getCountryCodeParam } = useTypeSafeQuery();
  const facetId = getStringParam('id');
  const ruleSetId = getStringParam('ruleSetId');
  const displayName = getStringParam('displayName');
  const countryCode = getCountryCodeParam('countryCode');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacet, setSelectedFacet] = useState<
    MerchandisingReturnedFacet | undefined
  >(undefined);
  const [isDraft, setIsDraft] = useState(false);
  const [draftRuleset, setDraftRuleset] = useState<
    (MerchandisingRuleSet & { categoryIds: string[] }) | null
  >(null);

  const { callback: handleSearch } = useDebounce(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    300
  );

  // Check if this is a draft ruleset on mount
  useEffect(() => {
    const draft = getDraft();

    if (ruleSetId !== 'draft' || !isCategoryDraft(draft)) {
      return;
    }

    setIsDraft(true);
    setDraftRuleset(draft.ruleset);
  }, [ruleSetId, getDraft]);

  const categoriesArray = useMemo(() => {
    const categories = router.query.categories;
    if (typeof categories === 'string') {
      return [categories];
    }
    if (Array.isArray(categories)) {
      return categories.filter((v): v is string => typeof v === 'string');
    }
    return undefined;
  }, [router.query.categories]);

  const { attributeValues } = useGetFacetAttributeValues({
    facetId,
    query: searchQuery,
    categories: categoriesArray,
    countryCode,
  });

  const {
    ruleSetDetail,
    isLoading,
    error: getRulesetDetailError,
  } = useRuleSetDetail(ruleSetId, ruleSetId === 'draft');

  const { facets } = useFacetsList({
    query: categoriesArray ?? [],
    queryBy: 'categoryIds',
    enabled: true,
    countryCode: countryCode ?? 'UK_IE',
  });

  const facet = facets.find((facet) => facet.id === facetId);

  const effectiveRulesetDetail =
    isDraft && draftRuleset ? draftRuleset : ruleSetDetail;

  useEffect(() => {
    // istanbul ignore else
    if (facets.length > 0 && facet) {
      const rulesetConfig = effectiveRulesetDetail.facets?.find(
        (f: MerchandisingRuleSetFacetConfigWithId) => f.id === facet.id
      );
      setSelectedFacet({
        ...facet,
        boosted: rulesetConfig?.boosted ?? [],
        excludedValues: rulesetConfig?.excludedValues ?? [],
        indexPropertyName: facet.indexPropertyName,
      });
    }
  }, [facets, facet, effectiveRulesetDetail]);

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

      const updatedDraft: MerchandisingRuleSet & { categoryIds: string[] } = {
        ...draftRuleset,
        facets: newFacets,
      };

      saveDraft({ ruleset: updatedDraft, type: 'category' });

      return router.push(`/category/facets/new?ruleSetId=draft`);
    } else {
      const {
        // no need for last changed
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        lastChanged: _,
        facets,
        id,
        categoriesInfo,
        ...rest
      } = ruleSetDetail;
      const newFacets = facets?.map((facet) => {
        if (facet.id === newFacet.id) {
          return newFacet;
        }

        return facet;
      });
      const response = await updateCategoryRuleSet({
        ...rest,
        categoryIds:
          categoriesInfo.map(({ id }) => id) ||
          // istanbul ignore next
          [],
        facets: newFacets,
        ruleSetId: id,
      });
      // istanbul ignore else
      if (response && response.status !== 'error') {
        return router.push('/category');
      }
    }
  };

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>
          Merchandising Hub | M&S | Edit Category Ruleset Facet Values
        </title>
      </Head>
      <Heading
        breadcrumbs={[
          'Categories',
          'Facet Management Editor',
          `Facet values settings: ${displayName}`,
        ]}
      />

      {getRulesetDetailError && (
        <ErrorMessage>
          Error whilst retrieving ruleset: {getRulesetDetailError}
        </ErrorMessage>
      )}
      {updateRulesetError && (
        <ErrorMessage>
          Error whilst updating ruleset: {updateRulesetError}
        </ErrorMessage>
      )}

      {(!isLoading ||
        // istanbul ignore next
        isDraft) &&
        selectedFacet && (
          <CategoryAndSearchFacetsPanelPageLayout
            attributeValues={attributeValues}
            facet={selectedFacet}
            displayName={displayName}
            facetType={FacetType.Category}
            ruleSetId={ruleSetId}
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            onSave={handleSave}
            writeEnabled={hasWriteAccess}
            headerText={categoriesArray?.join(', ')}
            countryCode={countryCode}
            isDraftRuleset={isDraft}
          />
        )}
    </>
  );
};

export default Page;

import { useRouter } from 'next/router';

import { CountryCode, ExcludedFacets, ReturnedFacet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { useRuleSetCreate } from '@/libs/hooks';
import CategoryFacetsPanel from '@/libs/modules/facets-panel/category-facets-panel';

import Head from 'next/head';

import { AccessDeny } from '../../../../libs/components/access-deny/access-deny';
import { useAccess } from '../../../../libs/hooks/use-access';
import { CAT_READ_ROLE, CAT_WRITE_ROLE } from '../../category-config';

const Page = () => {
  const router = useRouter();

  const { createRuleset, error: crateRuleSetError } = useRuleSetCreate();

  const handleSave = async ({
    categoryIds,
    includedFacets,
    excludedFacets,
    countryCode,
    dateTime,
  }: {
    categoryIds: string[];
    includedFacets: ReturnedFacet[];
    excludedFacets: ExcludedFacets;
    countryCode: CountryCode;
    dateTime?: [Date | null, Date | null];
  }) => {
    const defaultMerchandisingRules = {
      pinnedProducts: [],
      blockedProducts: [],
      boosts: { alphanumeric: [], numeric: [], product: [] },
      buries: {
        alphanumeric: [],
        numeric: [],
        product: [],
      },
      includes: {
        alphanumeric: [],
      },
      excludes: {
        alphanumeric: [],
      },
    };

    const resp = await createRuleset({
      excludedFacets,
      categoryIds,
      facets: includedFacets,
      countryCode,
      rules: defaultMerchandisingRules,
      isEnabled: true,
      ...(dateTime?.[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime?.[1] && { endDate: new Date(dateTime[1]).toISOString() }),
    });

    if (resp) {
      return router.push('/category/facets');
    }
  };

  const handleCancel = () => {
    router.push('/category/facets');
  };

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: CAT_READ_ROLE,
    writeRole: CAT_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={CAT_READ_ROLE} />;
  }

  return (
    <>
      <Head>
        <title>{`Merchandising Hub | M&S | Create Category Ruleset`}</title>
      </Head>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      {crateRuleSetError && (
        <ErrorMessage>
          Error whilst creating new category rule set: {crateRuleSetError}
        </ErrorMessage>
      )}

      <CategoryFacetsPanel
        isNewRuleset
        ruleSetIncludedFacets={[]}
        ruleSetExcludedFacets={{
          facets: [],
        }}
        isLoading={false}
        countryCode={'UK_IE'}
        categoryIds={[]}
        onSave={handleSave}
        onCancel={handleCancel}
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default Page;

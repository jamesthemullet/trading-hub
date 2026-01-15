import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { ErrorMessage, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { FacetsList } from '@/libs/features';
import { useRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';

import Head from 'next/head';

const Page = () => {
  const router = useRouter();

  const { createRuleset, error: createRuleSetError } = useRuleSetCreate();

  const handleSave = async ({
    facets,
    excludedFacets,
    countryCode,
    categoryIds,
    startDate,
    endDate,
  }: MerchandisingRuleSet & { categoryIds?: string[] }) => {
    // istanbul ignore next
    if (!categoryIds) {
      return;
    }
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
      facets,
      countryCode,
      rules: defaultMerchandisingRules,
      isEnabled: true,
      ...(startDate && { startDate: new Date(startDate).toISOString() }),
      ...(endDate && {
        endDate: new Date(endDate).toISOString(),
      }),
    });

    // istanbul ignore else
    if (resp) {
      return router.push('/category');
    }
  };

  const handleCancel = () => {
    router.push('/category');
  };

  const { hasReadAccess, requiredReadRole, hasWriteAccess } = useAccess('Cat');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create Category Ruleset</title>
      </Head>
      <Heading breadcrumbs={['Categories', 'Facet Management', 'New']} />

      {createRuleSetError && (
        <ErrorMessage>
          Error whilst creating new category rule set: {createRuleSetError}
        </ErrorMessage>
      )}

      <FacetsList
        facetType="category"
        isNewRuleset
        onCancel={handleCancel}
        onSave={handleSave}
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default Page;

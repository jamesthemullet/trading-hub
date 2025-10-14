import { useRouter } from 'next/router';

import type { MerchandisingRuleSet } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useSearchRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Facets } from '@/libs/modules/facet-list/facet-list';

import Head from 'next/head';

const NewRuleSetPage = () => {
  const { createRuleset } = useSearchRuleSetCreate();
  const router = useRouter();

  const handleSave = async ({
    facets,
    excludedFacets,
    countryCode,
    searchTerms,
    startDate,
    endDate,
  }: MerchandisingRuleSet & { searchTerms?: string[] }) => {
    // istanbul ignore next
    if (!searchTerms) {
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
      searchTerms,
      rules: defaultMerchandisingRules,
      facets,
      excludedFacets,
      ...(startDate && { startDate: new Date(startDate).toISOString() }),
      ...(endDate && {
        endDate: new Date(endDate).toISOString(),
      }),
      countryCode,
      isEnabled: true,
    });

    // istanbul ignore else
    if (resp) {
      return router.push('/search');
    }
  };

  const handleCancel = () => {
    router.push('/search');
  };

  const { hasReadAccess, requiredReadRole, hasWriteAccess } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create search ranking rule</title>
      </Head>
      <>
        <Heading
          breadcrumbs={[
            'Search & Merchandising',
            'Site search',
            'Ranking rules',
          ]}
        />

        <Facets
          facetType="search"
          isNewRuleset
          onCancel={handleCancel}
          onSave={handleSave}
          writeEnabled={hasWriteAccess}
        />
      </>
    </>
  );
};

export default NewRuleSetPage;

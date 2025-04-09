import { useRouter } from 'next/router';

import type {
  MerchandisingCountryCode,
  MerchandisingExcludedFacets,
  MerchandisingReturnedFacet,
} from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useSearchRuleSetCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import SearchFacetsPanel from '@/libs/modules/facets-panel/search-facets-panel';

import Head from 'next/head';

const NewRuleSetPage = () => {
  const { createRuleset } = useSearchRuleSetCreate();
  const router = useRouter();

  const handleSave = async ({
    searchTerms,
    includedFacets,
    excludedFacets,
    countryCode,
    dateTime,
  }: {
    searchTerms: string[];
    includedFacets: MerchandisingReturnedFacet[];
    excludedFacets: MerchandisingExcludedFacets;
    countryCode: MerchandisingCountryCode;
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
      searchTerms,
      merchandisingRules: defaultMerchandisingRules,
      includedFacets,
      excludedFacets,
      ...(dateTime?.[0] && { startDate: new Date(dateTime[0]).toISOString() }),
      ...(dateTime?.[1] && { endDate: new Date(dateTime[1]).toISOString() }),
      countryCode,
    });

    if (resp) {
      return router.push('/search/facets');
    }
  };

  const handleCancel = () => {
    router.push('/search/facets');
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Create search ranking rule</title>
      </Head>
      <main>
        <Heading
          breadcrumbs={[
            'Search & Merchandising',
            'Site search',
            'Ranking rules',
          ]}
        />

        <SearchFacetsPanel
          isNewRuleset
          ruleSetIncludedFacets={[]}
          ruleSetExcludedFacets={{
            facets: [],
          }}
          isLoading={false}
          countryCode={'UK_IE'}
          searchTerms={[]}
          onSave={handleSave}
          onCancel={handleCancel}
          writeEnabled={hasWriteAccess}
        />
      </main>
    </>
  );
};

export default NewRuleSetPage;

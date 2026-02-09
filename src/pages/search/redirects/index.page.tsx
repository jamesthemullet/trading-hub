import type {
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
  MerchandisingReturnedKeywordRedirects,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import type { RuleSetMapping } from '@/libs/components/types';
import { ROUTES } from '@/libs/constants/routes';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';

import Head from 'next/head';

const mapping: RuleSetMapping<
  MerchandisingReturnedKeywordRedirects,
  MerchandisingReturnedKeywordRedirect,
  MerchandisingKeywordRedirect
> = {
  queryAllRuleSets: search().betaMerchandisingKeywordRedirectList,
  deleteRuleSetById: search().betaMerchandisingKeywordRedirectDelete,
  queryRuleSetById: search().betaMerchandisingKeywordRedirectDetail,
  updateRuleSetById: search().betaMerchandisingKeywordRedirectUpdate,
  newRuleSet: search().betaMerchandisingKeywordRedirectCreate,
  ruleSetToRow: ({
    id,
    keywords,
    isEnabled,
    lastChanged,
    startDate,
    endDate,
    countryCode,
  }) => ({
    id,
    identifier: keywords.join(' | '),
    isEnabled,
    lastChanged,
    url: ROUTES.SEARCH.REDIRECTS.EDIT(id),
    startDate,
    endDate,
    countryCode,
  }),
  allToArray: (data) => data.redirects,
  returnedToRuleSet: (returnedRuleSet) => {
    return {
      countryCode: returnedRuleSet.countryCode,
      destinationUrl: returnedRuleSet.destinationUrl,
      endDate: returnedRuleSet.endDate,
      isEnabled: returnedRuleSet.isEnabled,
      keywords: returnedRuleSet.keywords,
      ruleTitle: returnedRuleSet.ruleTitle,
      startDate: returnedRuleSet.startDate,
      type: returnedRuleSet.type,
    };
  },
};

const RedirectRuleSets = () => {
  const headings = [
    'Identifier',
    'Schedule',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Keyword Redirect</title>
      </Head>
      <Heading
        breadcrumbs={['Search & Merchandising', 'Site search', 'Redirects']}
        title="Keyword Redirect"
      />

      <TablePanel
        basePath="/search"
        headings={headings}
        mapping={mapping}
        ruleType="redirect"
        writeEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RedirectRuleSets;

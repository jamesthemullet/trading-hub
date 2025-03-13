import type {
  KeywordRedirect,
  ReturnedKeywordRedirect,
  ReturnedKeywordRedirects,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { TablePanel } from '@/libs/components/table-panel/table-panel';
import type { RuleSetMapping } from '@/libs/components/types';
import { PageNameLabel } from '@/libs/components/utils/shared.styles';
import { useAccess } from '@/libs/hooks/use-access';

import Head from 'next/head';

const mapping: RuleSetMapping<
  ReturnedKeywordRedirects,
  ReturnedKeywordRedirect,
  KeywordRedirect
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
    id: id,
    identifier: keywords.join(' | '),
    isEnabled,
    lastChanged,
    url: `/search/redirects/edit/${id}`,
    startDate,
    endDate,
    countryCode,
  }),
  allToArray: (data) => data.redirects,
  getEmptyRuleSet: () => ({
    countryCode: 'UK_IE',
    destinationUrl: '',
    endDate: undefined,
    isEnabled: false,
    keywords: [],
    ruleTitle: '',
    startDate: undefined,
    type: 'redirectTerm',
  }),
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
      <main>
        <Heading
          breadcrumbs={['Search & Merchandising', 'Site search', 'Redirects']}
        />

        <PageNameLabel>Keyword Redirect</PageNameLabel>

        <TablePanel
          basePath="/search/redirects"
          headings={headings}
          mapping={mapping}
          ruleType="redirect"
          writeEnabled={hasWriteAccess}
        />
      </main>
    </>
  );
};

export default RedirectRuleSets;

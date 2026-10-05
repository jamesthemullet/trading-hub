import type { ReactElement } from 'react';

import type {
  MerchandisingKeywordRedirect,
  MerchandisingReturnedKeywordRedirect,
  MerchandisingReturnedKeywordRedirects,
} from '@/libs/api';
import { search } from '@/libs/api';
import { Button, Heading } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ReadOnlyBanner } from '@/libs/components/read-only-banner/read-only-banner';
import type { RuleSetMapping } from '@/libs/components/types';
import { ROUTES } from '@/libs/constants/routes';
import { RuleType } from '@/libs/constants/rule-types';
import { TablePanel } from '@/libs/features';
import { useAccess } from '@/libs/hooks/use-access';
import { track } from '@/libs/hooks/utils/analytics';

import Head from 'next/head';

const mapping: RuleSetMapping<
  MerchandisingReturnedKeywordRedirects,
  MerchandisingReturnedKeywordRedirect,
  MerchandisingKeywordRedirect
> = {
  queryAllRuleSets: search().getKeywordRedirects,
  deleteRuleSetById: search().deleteKeywordRedirect,
  queryRuleSetById: search().getKeywordRedirect,
  updateRuleSetById: search().updateKeywordRedirect,
  newRuleSet: search().createKeywordRedirect,
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

const RedirectRuleSets = (): ReactElement => {
  const headings = [
    'Identifier',
    'Schedule',
    'Influence',
    'Enable',
    'Last Changed',
    'User',
    'Actions',
  ];

  const { hasReadAccess, hasWriteAccess, requiredReadRole, requiredWriteRole } =
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
        banner={
          !hasWriteAccess && (
            <ReadOnlyBanner requiredWriteRole={requiredWriteRole} />
          )
        }
        actions={
          hasWriteAccess && (
            <Button
              as="a"
              isInline
              theme="filled"
              icon="plus-simple-white"
              href={ROUTES.SEARCH.REDIRECTS.NEW}
              onClick={() => track({ event: 'Add redirect rule' })}
            >
              Add redirect rule
            </Button>
          )
        }
      />

      <TablePanel
        basePath="/search"
        headings={headings}
        mapping={mapping}
        ruleType={RuleType.Redirect}
        isWriteEnabled={hasWriteAccess}
      />
    </>
  );
};

export default RedirectRuleSets;

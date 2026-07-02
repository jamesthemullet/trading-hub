import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingKeywordRedirect } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { ROUTES } from '@/libs/constants/routes';
import { useRedirectDetail, useRedirectUpdate } from '@/libs/hooks';
import { useRedirectHistory } from '@/libs/hooks/search/redirect/history/use-redirect-history';
import { useAccess } from '@/libs/hooks/use-access';
import { useHistoricalOrCurrentRuleset } from '@/libs/hooks/use-historical-or-current-ruleset';
import { useTrackRecentlyViewed } from '@/libs/hooks/use-track-recently-viewed';
import { Redirect } from '@/libs/modules/redirect/redirect';

import type { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

type Props = {
  id: string;
};

const EditRedirect = ({ id }: Props): ReactElement => {
  const router = useRouter();
  const isHistoryView = router.query.history === 'true';
  const currentPage = Number(router.query.currentPage) || 1;
  const currentPageSize = Number(router.query.currentPageSize) || 20;

  const historyData = useRedirectHistory(
    isHistoryView ? id : '',
    currentPage,
    currentPageSize
  );
  const {
    redirect,
    error,
    isLoading: isRedirectLoading,
  } = useRedirectDetail(isHistoryView ? '' : id);

  const {
    rulesetData: redirectData,
    isLoading,
    error: historyError,
  } = useHistoricalOrCurrentRuleset({
    id,
    historyData: {
      history: historyData.history,
      isLoading: historyData.isLoading,
      error: historyData.error,
    },
    currentData: { data: redirect, isLoading: isRedirectLoading },
  });

  const { updateRedirect } = useRedirectUpdate();

  useTrackRecentlyViewed({
    id: redirectData?.id,
    label: redirectData?.ruleTitle || redirectData?.keywords?.join(', '), // || intentional: empty string ruleTitle should fall through to keywords
    url: ROUTES.SEARCH.REDIRECTS.EDIT(id),
    type: 'redirect',
  });

  const onSaveRedirect = async (redirect: MerchandisingKeywordRedirect) => {
    const response = await updateRedirect({ redirect, redirectId: id });

    // istanbul ignore else
    if (response) {
      router.push('/search/redirects');
    }
  };

  const { hasReadAccess, hasWriteAccess, requiredReadRole } =
    useAccess('Search');

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={requiredReadRole} />;
  }

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S | Edit redirect</title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Site search',
          'Keyword redirect',
        ]}
      />

      {(error || historyError) && (
        <ErrorMessage centred>{error || historyError}</ErrorMessage>
      )}

      {!isLoading && redirectData && (
        <Redirect
          onCancel={() => router.push('/search/redirects')}
          onSave={onSaveRedirect}
          redirect={redirectData}
          title="Edit Keyword Redirect"
          isWriteEnabled={hasWriteAccess && !isHistoryView}
        />
      )}

      {isLoading && <Loader />}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = (
  context: GetServerSidePropsContext
) => {
  return Promise.resolve({
    props: { id: context.query.id },
  });
};

export default EditRedirect;

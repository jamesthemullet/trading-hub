import { useRouter } from 'next/router';

import { KeywordRedirect } from '@/libs/api';
import { CentredError, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useRedirectDetail, useRedirectUpdate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Redirect } from '@/libs/modules/redirect/redirect';

import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import Head from 'next/head';

import { SEARCH_READ_ROLE, SEARCH_WRITE_ROLE } from '../../../search-config';

type Props = {
  id: string;
};

const EditRedirect = ({ id }: Props) => {
  const { redirect, error, isLoading } = useRedirectDetail(id);
  const router = useRouter();

  const { updateRedirect } = useRedirectUpdate();

  const onSaveRedirect = async (redirect: KeywordRedirect) => {
    const response = await updateRedirect({ redirect, redirectId: id });

    if (response) {
      router.push('/search/redirects');
    }
  };

  const { hasReadAccess, hasWriteAccess } = useAccess({
    readRole: SEARCH_READ_ROLE,
    writeRole: SEARCH_WRITE_ROLE,
  });

  if (!hasReadAccess) {
    return <AccessDeny requiredRole={SEARCH_READ_ROLE} />;
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

      {error && <CentredError>{error}</CentredError>}

      {!isLoading && (
        <Redirect
          onCancel={() => router.push('/search/redirects')}
          onSave={onSaveRedirect}
          redirect={redirect}
          title="Edit Keyword Redirect"
          writeEnabled={hasWriteAccess}
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

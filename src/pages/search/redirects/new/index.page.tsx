import { useRouter } from 'next/router';

import { KeywordRedirect } from '@/libs/api';
import { CentredError, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useRedirectCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Redirect } from '@/libs/modules/redirect/redirect';

import Head from 'next/head';

import { SEARCH_READ_ROLE, SEARCH_WRITE_ROLE } from '../../search-config';

const CreateRedirect = () => {
  const { createRedirect, isSaving, error } = useRedirectCreate();
  const router = useRouter();

  const createNewRedirect = async (redirect: KeywordRedirect) => {
    const response = await createRedirect({ redirect });

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
        <title>Merchandising Hub | M&S | Create redirect</title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Site search',
          'Keyword redirect',
        ]}
      />

      {error && <CentredError>{error}</CentredError>}

      <Redirect
        onCreate={createNewRedirect}
        onCancel={() => router.push('/search/redirects')}
        title="Add Keyword Redirect rule"
        writeEnabled={hasWriteAccess}
      />

      {isSaving && <Loader />}
    </>
  );
};

export default CreateRedirect;

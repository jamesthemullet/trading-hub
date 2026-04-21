import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import type { MerchandisingKeywordRedirect } from '@/libs/api';
import { ErrorMessage, Heading, Loader } from '@/libs/components';
import { AccessDeny } from '@/libs/components/access-deny/access-deny';
import { useRedirectCreate } from '@/libs/hooks';
import { useAccess } from '@/libs/hooks/use-access';
import { Redirect } from '@/libs/modules/redirect/redirect';

import Head from 'next/head';

const CreateRedirect = (): ReactElement => {
  const { createRedirect, isSaving, error } = useRedirectCreate();
  const router = useRouter();

  const createNewRedirect = async (redirect: MerchandisingKeywordRedirect) => {
    const response = await createRedirect({ redirect });

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
        <title>Merchandising Hub | M&S | Create redirect</title>
      </Head>
      <Heading
        breadcrumbs={[
          'Search & Merchandising',
          'Site search',
          'Keyword redirect',
        ]}
      />

      {error && <ErrorMessage centred>{error}</ErrorMessage>}

      <Redirect
        onCreate={createNewRedirect}
        onCancel={() => router.push('/search/redirects')}
        title="Add Keyword Redirect rule"
        isWriteEnabled={hasWriteAccess}
      />

      {isSaving && <Loader />}
    </>
  );
};

export default CreateRedirect;

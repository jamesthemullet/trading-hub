import { useRouter } from 'next/router';

import { KeywordRedirect } from '@/libs/api';
import { CentredError, Heading, Loader } from '@/libs/components';
import { useRedirectCreate } from '@/libs/hooks';
import { Redirect } from '@/libs/modules/redirect/redirect';

import Head from 'next/head';

const CreateRedirect = () => {
  const { createRedirect, isSaving, error } = useRedirectCreate();
  const router = useRouter();

  const createNewRedirect = async (redirect: KeywordRedirect) => {
    const response = await createRedirect({ redirect });

    if (response) {
      router.push('/search/redirects');
    }
  };

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
      />

      {isSaving && <Loader />}
    </>
  );
};

export default CreateRedirect;

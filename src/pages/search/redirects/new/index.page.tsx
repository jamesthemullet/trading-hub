import { useRouter } from 'next/router';

import { KeywordRedirect } from '@/libs/api';
import { CentredError, Heading, Loader } from '@/libs/components';
import { useRedirectCreate } from '@/libs/hooks';
import { Redirect } from '@/libs/modules/redirect/redirect';

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

import Head from 'next/head';
import { signIn, signOut, useSession } from 'next-auth/react';

const Index = () => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>{`Trading Hub | M&S`}</title>
      </Head>
      <h1>
        {session && session.status === 'authenticated' ? (
          <div>
            <p>Hello, {session.data.user?.email}</p>
            <button onClick={() => signOut()}>Sign out</button>
          </div>
        ) : (
          <div>
            Unauthorised,{' '}
            <button onClick={() => signIn('azure-ad')}>Sign in</button>
          </div>
        )}
      </h1>
    </>
  );
};

export const getServerSideProps = () => {
  return Promise.resolve({
    props: {},
  });
};

export default Index;

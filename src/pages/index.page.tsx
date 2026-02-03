import { Button, Typography } from '@/libs/components';

import Head from 'next/head';
import { signIn, signOut, useSession } from 'next-auth/react';

import styles from './index.module.css';

const Index = () => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S</title>
      </Head>
      <div className={styles.container}>
        <Typography as="h1" variant="headlineSmall" isStrong>
          Merchandising Hub
        </Typography>
        {session?.status === 'authenticated' ? (
          <>
            <Typography>Hello, {session.data.user?.email}</Typography>

            <Button isInline theme="primary" onClick={() => signOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Typography>Unauthorised, please </Typography>

            <Button isInline theme="primary" onClick={() => signIn('azure-ad')}>
              Sign in
            </Button>
          </>
        )}
      </div>
    </>
  );
};

export const getServerSideProps = () => {
  return Promise.resolve({
    props: {},
  });
};

export default Index;

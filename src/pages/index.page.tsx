import styled from '@emotion/styled';

import { Text } from '@/libs/components';

import Head from 'next/head';
import { signIn, signOut, useSession } from 'next-auth/react';

const Wrapper = styled.div`
  padding: 20px;
`;

const Index = () => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>{`Trading Hub | M&S`}</title>
      </Head>
      <h1>
        {session && session.status === 'authenticated' ? (
          <Wrapper>
            <Text>Hello, {session.data.user?.email}</Text>
            <Text>
              <button onClick={() => signOut()}>Sign out</button>
            </Text>
          </Wrapper>
        ) : (
          <Wrapper>
            Unauthorised,{' '}
            <button onClick={() => signIn('azure-ad')}>Sign in</button>
          </Wrapper>
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

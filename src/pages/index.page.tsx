import styled from '@emotion/styled';

import { Button, Text } from '@/libs/components';
import { spacing } from '@/libs/utils/spacing';

import Head from 'next/head';
import { signIn, signOut, useSession } from 'next-auth/react';

const Container = styled.div`
  padding: ${spacing(2)};

  p,
  h1 {
    margin-bottom: ${spacing(2)};
  }
`;

const StyledText = styled(Text)`
  font-size: 16px;
`;

const Index = () => {
  const session = useSession();

  return (
    <>
      <Head>
        <title>Merchandising Hub | M&S</title>
      </Head>
      <Container>
        <h1>Trading Hub</h1>
        {session && session.status === 'authenticated' ? (
          <>
            <StyledText>Hello, {session.data.user?.email}</StyledText>

            <Button isInline isPrimary onClick={() => signOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <StyledText>Unauthorised, please </StyledText>

            <Button isInline isPrimary onClick={() => signIn('azure-ad')}>
              Sign in
            </Button>
          </>
        )}
      </Container>
    </>
  );
};

export const getServerSideProps = () => {
  return Promise.resolve({
    props: {},
  });
};

export default Index;

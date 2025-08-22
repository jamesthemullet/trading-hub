import styled from '@emotion/styled';
import { useRouter } from 'next/router';

import { Button, Header1, Text } from '@/libs/components';

const Wrapper = styled.div`
  margin-top: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;

  button {
    margin-top: 20px;
  }
`;

export default function AuthError() {
  const router = useRouter();
  const { error = 'default', source = '' } = router.query;

  const sourceOfError = source === 'auth' ? 'Authentication ' : '';

  const errorMessages = {
    OAuthSignin:
      'There was an issue signing in with the provider. Please try again.',
    OAuthCallback: 'An error occurred. Please try again later.',
    CredentialsSignin:
      'The credentials provided are incorrect. Please check and try again.',
    default: 'An unknown error occurred. Please try again later.',
  };

  const errorMessage =
    errorMessages[error as keyof typeof errorMessages] || errorMessages.default;

  return (
    <Wrapper>
      <Header1>{sourceOfError}Error</Header1>
      <Text>{errorMessage}</Text>
      <Button theme="primary" isInline onClick={() => router.push('/')}>
        Go Back to Sign In
      </Button>
    </Wrapper>
  );
}

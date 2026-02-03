import { useRouter } from 'next/router';

import { Button, Typography } from '@/libs/components';

import styles from './error.module.css';

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
    <div className={styles.wrapper}>
      <Typography as="h1" variant="headlineMedium" isStrong>
        {sourceOfError}Error
      </Typography>
      <Typography>{errorMessage}</Typography>
      <Button theme="primary" isInline onClick={() => router.push('/')}>
        Go Back to Sign In
      </Button>
    </div>
  );
}

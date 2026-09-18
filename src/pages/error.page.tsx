import type { ReactElement } from 'react';
import { useRouter } from 'next/router';

import { Button, Typography } from '@/libs/components';

import styles from './error.module.css';

const ERROR_MESSAGES = {
  OAuthSignin:
    'There was an issue signing in with the provider. Please try again.',
  OAuthCallback: 'An error occurred. Please try again later.',
  CredentialsSignin:
    'The credentials provided are incorrect. Please check and try again.',
  default: 'An unknown error occurred. Please try again later.',
};

const isErrorMessageKey = (
  error: string
): error is keyof typeof ERROR_MESSAGES =>
  Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, error);

export default function AuthError(): ReactElement {
  const router = useRouter();
  const { error = 'default', source = '' } = router.query;

  const sourceOfError = source === 'auth' ? 'Authentication ' : '';
  const errorMessage =
    typeof error === 'string' && isErrorMessageKey(error)
      ? ERROR_MESSAGES[error]
      : ERROR_MESSAGES.default;

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

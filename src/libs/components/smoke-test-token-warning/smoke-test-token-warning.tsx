import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Button } from '@/libs/components/button/button';
import { Typography } from '@/libs/components/typography/typography';

import styles from './smoke-test-token-warning.module.css';

export function SmokeTestTokenWarning(): ReactElement | null {
  const { asPath } = useRouter();
  const [hasSmokeTestToken, setHasSmokeTestToken] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    setIsDismissed(false);
  }, [asPath]);

  useEffect(() => {
    fetch('/api/healthcheck')
      .then((res) => res.json())
      .then((data: { hasSmokeTestToken: boolean }) => {
        if (data.hasSmokeTestToken) {
          setHasSmokeTestToken(true);
        }
      })
      .catch((error: unknown) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to fetch smoke test token healthcheck.', error);
        }
      });
  }, []);

  if (!hasSmokeTestToken || isDismissed) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={styles.inner}>
        <Typography as="h2" variant="headlineMedium" isStrong>
          ⚠️ SMOKE_TEST_TOKEN DETECTED
        </Typography>
        <Typography variant="bodyMedium">
          This is a CI/CD testing token used exclusively for automated smoke
          tests. It grants unauthenticated access and must never be present in a
          developer&apos;s local environment.
        </Typography>
        <Typography variant="bodyMedium">
          Please remove or comment out <code>SMOKE_TEST_TOKEN</code> from your{' '}
          <code>.env</code> file and restart the dev server.
        </Typography>
        <Button
          theme="primary"
          onClick={() => setIsDismissed(true)}
          className={styles.button}
        >
          I will remove SMOKE_TEST_TOKEN now
        </Button>
      </div>
    </div>
  );
}

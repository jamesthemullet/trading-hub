import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Layout, Navigation } from '../libs/components/navigation/navigation';
import { MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { LoginCheck } from '@/libs/components/login/login-check';

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
  const { session } = pageProps;
  return (
    <SessionProvider session={session}>
      <MantineProvider>
        <LoginCheck />
        <Layout>
          <Navigation />
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
    </SessionProvider>
  );
}

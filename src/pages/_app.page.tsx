import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { MantineProvider } from '@mantine/core';

import { LoginCheck } from '@/libs/components/login/login-check';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { Layout, Navigation } from '../libs/components/navigation/navigation';

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
  const { session } = pageProps;

  return (
    <SessionProvider session={session}>
      <MantineProvider>
        <LoginCheck
          autoLogin={process.env.NEXT_PUBLIC_AUTO_LOGIN !== 'false'}
        />
        <Layout>
          <Navigation />
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
    </SessionProvider>
  );
}

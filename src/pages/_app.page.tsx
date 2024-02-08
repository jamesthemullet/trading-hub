import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { Layout, Navigation } from '../libs/components/navigation/navigation';
import './global.css';

export default function App({
  Component,
  pageProps,
}: AppProps<{ session: Session | null }>) {
  const { session } = pageProps;
  return (
    <SessionProvider session={session}>
      <Layout>
        <Navigation />
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  );
}

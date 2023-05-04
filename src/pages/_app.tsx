/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'hds-core/lib/base.min.css';
import '../styles/main.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation, SSRConfig } from 'next-i18next';
import type { AppProps } from 'next/app';
import React from 'react';
import { ToastContainer } from 'react-toastify';

import CookieConsent from '../domain/app/cookieConsent/CookieConsent';
import PageLayout from '../domain/app/layout/pageLayout/PageLayout';

type Props = {
  dehydratedState?: unknown;
  session?: Session | null;
} & SSRConfig;

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<Props>) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <SessionProvider session={session} refetchInterval={10}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <CookieConsent />
          <ToastContainer hideProgressBar={true} theme="colored" />
          <PageLayout {...pageProps}>
            <Component {...pageProps} />
          </PageLayout>
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default appWithTranslation<AppProps<Props>>(MyApp);

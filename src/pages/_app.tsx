/* eslint-disable max-len */

import '../styles/main.scss';

import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { CookieConsentContextProvider } from 'hds-react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation, SSRConfig } from 'next-i18next';
import React from 'react';

import { AccessibilityNotificationProvider } from '../common/components/accessibilityNotificationContext/AccessibilityNotificationContext';
import { NotificationsProvider } from '../common/components/notificationsContext/NotificationsContext';
import CookieConsent from '../domain/app/cookieConsent/CookieConsent';
import PageLayout from '../domain/app/layout/pageLayout/PageLayout';
import useCookieConsentSettings from '../hooks/useCookieConsentSettings';

type Props = {
  dehydratedState?: unknown;
  session?: Session | null;
} & SSRConfig;

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<Props>) => {
  const [queryClient] = React.useState(() => new QueryClient());

  const cookieConsentProps = useCookieConsentSettings();

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <CookieConsentContextProvider {...cookieConsentProps}>
        <AccessibilityNotificationProvider>
          <NotificationsProvider>
            <SessionProvider session={session} refetchInterval={30}>
              <QueryClientProvider client={queryClient}>
                <HydrationBoundary state={pageProps.dehydratedState}>
                  <CookieConsent />
                  <PageLayout {...pageProps}>
                    <Component {...pageProps} />
                  </PageLayout>
                </HydrationBoundary>
              </QueryClientProvider>
            </SessionProvider>
          </NotificationsProvider>
        </AccessibilityNotificationProvider>
      </CookieConsentContextProvider>
    </>
  );
};

export default appWithTranslation<AppProps<Props>>(MyApp);

/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import '../styles/main.scss';

import { init } from '@socialgouv/matomo-next';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation, SSRConfig } from 'next-i18next';
import React, { useEffect } from 'react';

import { AccessibilityNotificationProvider } from '../common/components/accessibilityNotificationContext/AccessibilityNotificationContext';
import { NotificationsProvider } from '../common/components/notificationsContext/NotificationsContext';
import CookieConsent from '../domain/app/cookieConsent/CookieConsent';
import PageLayout from '../domain/app/layout/pageLayout/PageLayout';

const MATOMO_ENABLED = process.env.NEXT_PUBLIC_MATOMO_ENABLED;
const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
const MATOMO_JS_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_JS_TRACKER_FILE;
const MATOMO_PHP_TRACKER_FILE = process.env.NEXT_PUBLIC_MATOMO_PHP_TRACKER_FILE;

type Props = {
  dehydratedState?: unknown;
  session?: Session | null;
} & SSRConfig;

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<Props>) => {
  const [queryClient] = React.useState(() => new QueryClient());

  useEffect(() => {
    if (MATOMO_ENABLED === 'true' && MATOMO_URL && MATOMO_SITE_ID) {
      init({
        jsTrackerFile: MATOMO_JS_TRACKER_FILE,
        phpTrackerFile: MATOMO_PHP_TRACKER_FILE,
        url: MATOMO_URL,
        siteId: MATOMO_SITE_ID,
      });
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
    </>
  );
};

export default appWithTranslation<AppProps<Props>>(MyApp);

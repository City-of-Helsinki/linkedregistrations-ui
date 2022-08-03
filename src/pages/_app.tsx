/* eslint-disable @typescript-eslint/ban-ts-comment */
import 'hds-core/lib/base.min.css';
import '../styles/main.scss';
import 'react-toastify/dist/ReactToastify.css';

import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import React from 'react';
import { ToastContainer } from 'react-toastify';

import PageLayout from '../domain/app/layout/pageLayout/PageLayout';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    // @ts-ignore
    <QueryClientProvider client={queryClient}>
      {/* @ts-ignore */}
      <Hydrate state={pageProps.dehydratedState}>
        <ToastContainer hideProgressBar={true} theme="colored" />
        <PageLayout {...pageProps}>
          <Component {...pageProps} />
        </PageLayout>
      </Hydrate>
    </QueryClientProvider>
  );
};

export default appWithTranslation(MyApp);

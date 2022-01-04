import 'hds-core/lib/base.min.css';
import '../styles/main.scss';
import 'react-toastify/dist/ReactToastify.css';

import * as Sentry from '@sentry/browser';
import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import React, { ErrorInfo } from 'react';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';

import PageLayout from '../domain/app/layout/pageLayout/PageLayout';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
  });
}

const MyApp = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <ToastContainer hideProgressBar={true} theme="colored" />
          <PageLayout {...pageProps}>
            <Component {...pageProps} />
          </PageLayout>
        </Hydrate>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(error);
    }

    Sentry.withScope((scope) => {
      scope.setExtra('componentStack', errorInfo.componentStack);

      Sentry.captureException(error);
    });

    super.componentDidCatch?.(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

export default appWithTranslation(MyApp);

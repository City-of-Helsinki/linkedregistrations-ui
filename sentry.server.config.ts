import * as Sentry from '@sentry/nextjs';

import {
  beforeSend,
  beforeSendTransaction,
} from './src/domain/app/sentry/utils';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    beforeSend,
    beforeSendTransaction,
    normalizeDepth: 3,
    integrations: [Sentry.extraErrorDataIntegration({ depth: 3 })],
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'),

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}

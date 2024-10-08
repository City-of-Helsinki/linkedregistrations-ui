// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
import { extraErrorDataIntegration } from '@sentry/integrations';
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
    integrations: [extraErrorDataIntegration({ depth: 3 })],
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT,

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: 1,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}

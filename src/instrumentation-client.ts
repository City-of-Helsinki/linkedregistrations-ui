import * as Sentry from '@sentry/nextjs';

import { beforeSend, beforeSendTransaction } from './domain/app/sentry/utils';

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    beforeSend,
    beforeSendTransaction,
    normalizeDepth: 3,
    integrations: [
      Sentry.replayIntegration(),
      Sentry.extraErrorDataIntegration({ depth: 3 }),
      Sentry.thirdPartyErrorFilterIntegration({
        filterKeys: process.env.SENTRY_PROJECT
          ? [process.env.SENTRY_PROJECT]
          : [],
        behaviour: 'drop-error-if-contains-third-party-frames',
      }),
    ],
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    ignoreErrors: [
      'ResizeObserver loop completed with undelivered notifications',
      'ResizeObserver loop limit exceeded',
    ],
    tracesSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '0'
    ),
    tracePropagationTargets: (
      process.env.NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS || ''
    ).split(','),
    replaysSessionSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0'
    ),
    replaysOnErrorSampleRate: parseFloat(
      process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '0'
    ),
    debug: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

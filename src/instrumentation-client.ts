import * as Sentry from '@sentry/nextjs';

import { beforeSend, beforeSendTransaction } from './domain/app/sentry/utils';
import getEnvValue from './utils/getEnvValue';

if (getEnvValue('NEXT_PUBLIC_SENTRY_DSN')) {
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
    dsn: getEnvValue('NEXT_PUBLIC_SENTRY_DSN'),
    environment: getEnvValue('NEXT_PUBLIC_SENTRY_ENVIRONMENT'),
    release: getEnvValue('NEXT_PUBLIC_SENTRY_RELEASE'),
    ignoreErrors: [
      'ResizeObserver loop completed with undelivered notifications',
      'ResizeObserver loop limit exceeded',
    ],
    tracesSampleRate: parseFloat(
      getEnvValue('NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE') || '0'
    ),
    tracePropagationTargets: (
      getEnvValue('NEXT_PUBLIC_SENTRY_TRACE_PROPAGATION_TARGETS') ?? ''
    )
      .split(',')
      .map((target) => target.trim())
      .filter(Boolean),
    replaysSessionSampleRate: parseFloat(
      getEnvValue('NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE') || '0'
    ),
    replaysOnErrorSampleRate: parseFloat(
      getEnvValue('NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE') || '0'
    ),
    debug: false,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

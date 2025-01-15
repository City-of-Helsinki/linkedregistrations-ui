/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const { i18n } = require('./next-i18next.config');

const moduleExports = {
  i18n,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/payment/cancelled',
        destination: '/failure',
        permanent: true,
      },
      {
        source: '/payment/completed',
        destination: '/success',
        permanent: true,
      },
    ];
  },
  swcMinify: true,
  sassOptions: {
    includePaths: ['src/styles'],
  },
  sentry: {
    hideSourceMaps: true,
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
  publicRuntimeConfig: {
    linkedEventsApiBaseUrl: process.env.NEXT_PUBLIC_LINKED_EVENTS_URL,
    webStoreApiBaseUrl: process.env.NEXT_PUBLIC_WEB_STORE_API_BASE_URL,
  },
  serverRuntimeConfig: {
    env: process.env.NEXT_ENV,
    oidcApiTokensUrl: process.env.OIDC_API_TOKENS_URL,
    oidcClientId: process.env.OIDC_CLIENT_ID,
    oidcClientSecret: process.env.OIDC_CLIENT_SECRET,
    oidcIssuer: process.env.OIDC_ISSUER,
    oidcLinkedEventsApiScope: process.env.OIDC_LINKED_EVENTS_API_SCOPE,
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true
  }
};

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  url: process.env.SENTRY_URL,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});

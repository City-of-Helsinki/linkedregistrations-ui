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
  publicRuntimeConfig: {
    linkedEventsApiBaseUrl: process.env.NEXT_PUBLIC_LINKED_EVENTS_URL,
    webStoreApiBaseUrl: process.env.NEXT_PUBLIC_WEB_STORE_API_BASE_URL,
    attendanceListLoginMethods: process.env.NEXT_PUBLIC_ATTENDANCE_LIST_LOGIN_METHODS,
    signupsLoginMethods: process.env.NEXT_PUBLIC_SIGNUPS_LOGIN_METHODS,
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
  },
  experimental: {
    instrumentationHook: true,
  },
  staticPageGenerationTimeout: 300,
  productionBrowserSourceMaps: true
};

module.exports = withSentryConfig(moduleExports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: false,

  project: process.env.SENTRY_PROJECT,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Disable sourcemap uploading to Sentry
  sourcemaps: {
    disable: true,
  },

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  reactComponentAnnotation: {
    enabled: true,
  },
});

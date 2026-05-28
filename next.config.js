/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const { i18n } = require('./next-i18next.config');
const packageJson = require('./package.json');

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
  sassOptions: {
    includePaths: ['src/styles'],
  },
  env: {
    APP_VERSION: packageJson.version,
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  staticPageGenerationTimeout: 300,
  productionBrowserSourceMaps: true,
};

module.exports = withSentryConfig(moduleExports, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: false,

  project: process.env.SENTRY_PROJECT,
  webpack: {
    unstable_sentryWebpackPluginOptions: {
      applicationKey: process.env.SENTRY_PROJECT,
    },
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
    reactComponentAnnotation: {
      enabled: true,
    },
  },

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Disable sourcemap uploading to Sentry
  sourcemaps: {
    disable: true,
  },

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: '/monitoring',
});

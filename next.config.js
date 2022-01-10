/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const { i18n } = require('./next-i18next.config');

const moduleExports = {
  i18n,
  reactStrictMode: true,
  sassOptions: {
    includePaths: ['src/styles'],
  },
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
  },
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(moduleExports);

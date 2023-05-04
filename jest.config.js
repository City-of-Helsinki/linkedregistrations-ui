/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
// jest.config.js
const nextJest = require('next/jest');

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' });

// Any custom config you want to pass to Jest
const customJestConfig = {
  coverageProvider: 'babel',
  coverageReporters: ['clover', 'json', 'lcov', 'text', 'cobertura'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/pages/404.tsx',
    '<rootDir>/src/pages/_app.tsx',
    '<rootDir>/src/pages/_document.tsx',
    '<rootDir>/src/pages/_error.tsx',
    '<rootDir>/src/pages/callback.tsx',
    '<rootDir>/src/pages/healthz.ts',
    '<rootDir>/src/pages/readiness.ts',
    '<rootDir>/src/tests/',
    '<rootDir>/src/utils/getPageHeaderHeight.ts',
    '<rootDir>/src/utils/getSessionAndUser.ts',
    '<rootDir>/src/utils/mockDataUtils.ts',
    '<rootDir>/src/utils/mockSession.ts',
    '<rootDir>/src/utils/testUtils.ts',
    'constants.ts',
    'query.ts',
    'types.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testEnvironment: 'jsdom',
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  return {
    ...config,
    transform: {
      /* Use babel-jest to transpile tests with the next/babel preset
        https://jestjs.io/docs/configuration#transform-objectstring-pathtotransformer--pathtotransformer-object */
      '^.+\\.(t|j)sx?$': [
        '@swc/jest',
        {
          jsc: {
            preserveAllComments: true,
            transform: {
              react: {
                runtime: 'automatic',
              },
            },
          },
        },
      ],
    },
  };
};

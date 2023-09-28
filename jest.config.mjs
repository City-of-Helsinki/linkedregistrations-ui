import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
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

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);

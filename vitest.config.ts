// Ensure consistent date handling in tests regardless of host timezone
process.env.TZ = 'UTC';

import { defineConfig, coverageConfigDefaults } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode ?? 'test', process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: /^next-i18next$/, replacement: 'react-i18next' },
        { find: 'next/router', replacement: 'next-router-mock' },
        { find: 'next/dist/client/router', replacement: 'next-router-mock' },
      ],
    },
    test: {
      globals: true,
      environment: 'jsdom',
      env,
      setupFiles: ['./src/setupTests.ts', 'fake-indexeddb/auto'],
      reporters: ['verbose', 'junit'],
      outputFile: {
        junit: './jest-report.xml',
      },
      css: {
        modules: {
          classNameStrategy: 'non-scoped',
        },
      },
      coverage: {
        include: ['src/**/*.{js,jsx,ts,tsx}'],
        exclude: [
          ...coverageConfigDefaults.exclude,
          'scripts/**',
          'src/pages/404.tsx',
          'src/pages/_app.tsx',
          'src/pages/_document.tsx',
          'src/pages/_error.tsx',
          'src/pages/callback.tsx',
          'src/pages/api/healthz.ts',
          'src/pages/api/readiness.ts',
          'src/tests/',
          'src/common/components/menuDropdown/menu/Menu.tsx',
          'src/utils/getPageHeaderHeight.ts',
          'src/utils/getSessionAndUser.ts',
          'src/utils/mockDataUtils.ts',
          'src/utils/mockSession.ts',
          'src/utils/testUtils.ts',
          'constants.ts',
          'types.ts',
        ],
        reporter: ['clover', 'json', 'lcov', 'text', 'cobertura'],
        provider: 'istanbul',
      },
      testTimeout: 1000000,
    },
  };
});

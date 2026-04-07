import eslint from '@eslint/js';
import stylisticPlugin from '@stylistic/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import-x';
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import nextPlugin from '@next/eslint-plugin-next'
import vitestGlobals from 'eslint-config-vitest-globals/flat';

export default defineConfig({
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['.next'],
  extends: [
    eslint.configs.recommended,
    nextPlugin.configs.recommended,
    tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    eslintConfigPrettier,
    vitestGlobals(),
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import-x/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: true,
    },
  },
  plugins: {
    '@stylistic': stylisticPlugin,
    'react': eslintReact,
    'react-hooks': reactHooksPlugin,
  },
  rules: {
    '@stylistic/brace-style': [
      'error',
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/member-ordering': ['warn'],
    '@typescript-eslint/no-require-imports': ['error'],
    'react-hooks/exhaustive-deps': 'warn',
    'array-bracket-spacing': ['warn', 'never'],
    'import-x/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          ['internal', 'parent'],
          ['sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import-x/no-duplicates': 0,
    'max-len': [
      'warn',
      {
        code: 120,
      },
    ],
    'no-console': 'warn',
    'no-plusplus': 'error',
    'object-curly-spacing': ['warn', 'always'],
  },
});

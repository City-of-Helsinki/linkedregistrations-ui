import eslint from '@eslint/js';
import stylisticTsPlugin from '@stylistic/eslint-plugin-ts';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jestPlugin from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';

const tsConfig = tseslint.config({
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['.next'],
  extends: [
    eslint.configs.recommended,
    tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    eslintConfigPrettier,
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  plugins: {
    '@stylistic/ts': stylisticTsPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin,
    jest: jestPlugin
  },
  languageOptions: {
    globals: jestPlugin.environments.globals.globals
  },
  rules: {
    '@stylistic/ts/brace-style': [
      'error',
      '1tbs',
      {
        allowSingleLine: true,
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@stylistic/ts/func-call-spacing': ['error'],
    '@typescript-eslint/member-ordering': ['warn'],
    '@typescript-eslint/no-require-imports': ['error'],
    'react/no-unused-prop-types': [
      'warn',
      {
        skipShapeProps: true,
      },
    ],
    'react-hooks/exhaustive-deps': 'warn',
    'array-bracket-spacing': ['warn', 'never'],
    'import/order': [
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
    'import/no-duplicates': 0,
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

export default tsConfig;

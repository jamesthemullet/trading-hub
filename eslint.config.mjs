import typescriptEslint from '@typescript-eslint/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import testingLibrary from 'eslint-plugin-testing-library';
import jestDom from 'eslint-plugin-jest-dom';
import jsxA11Y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import functional from 'eslint-plugin-functional';
import nextPlugin from '@next/eslint-plugin-next';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import jestPlugin from 'eslint-plugin-jest';
import tseslint from 'typescript-eslint';
import storybookPlugin from 'eslint-plugin-storybook';
import playwright from 'eslint-plugin-playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslint = [
  js.configs.recommended,
  jestPlugin.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  jestDom.configs['flat/recommended'],
  jsxA11Y.flatConfigs.recommended,
  ...storybookPlugin.configs['flat/recommended'],
  ...compat.extends('plugin:jest-formatting/recommended'),
  prettierConfig,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'playwright-report',
      'coverage',
      'jest.polyfills.js',
      'jest.setup.ts',
      'jest.config.ts',
      'src/test/**/*',
      'src/pages/status.page.tsx',
      'src/pages/sandbox/**/*',
      'src/pages/api/auth/next-auth.d.ts',
      'src/libs/api/generated/open-api.ts',
    ],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'simple-import-sort': simpleImportSort,
      'testing-library': testingLibrary,
      functional,
      '@next/next': nextPlugin,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    languageOptions: {
      globals: {
        React: true,
        NodeJS: true,
      },
      parser: tsParser,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: {
          project: ['./tsconfig.json'],
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...react.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      'react/self-closing-comp': 'error',
      'functional/no-mixed-types': 'off',
      'functional/no-throw-statements': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-conditional-statements': 'off',
      'functional/no-return-void': 'off',
      'functional/immutable-data': [
        'error',
        {
          ignoreAccessorPattern: ['*.displayName', 'session.*', 'timeout.*'],
        },
      ],
      'functional/no-let': 'off',
      'functional/prefer-immutable-types': 'off',
      'functional/functional-parameters': 'off',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^react', '^@testing', '^@mantine', 'next/router', '^msw'],
            ['^@/'],
            ['^[^.]'],
            ['^\\.'],
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
      'import/no-cycle': 'error',
      'object-shorthand': ['error', 'always'],
      'react/jsx-boolean-value': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-curly-brace-presence': ['error', 'never'],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'no-lone-blocks': 'error',
      // '@typescript-eslint/prefer-nullish-coalescing': 'error',
      'react/jsx-fragments': ['error', 'syntax'],
    },
  },
  {
    files: ['**/*.spec.*'],
    ignores: ['e2e/**/*'],
    rules: {
      '@next/next/no-document-import-in-page': 'off',
      '@next/next/no-head-element': 'off',
      '@next/next/no-server-import-in-page': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'functional/immutable-data': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-return-void': 'off',
      'functional/no-throw-statements': 'off',
      'no-unused-vars': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'testing-library/await-async-events': 'error',
      'testing-library/await-async-queries': 'error',
      'testing-library/await-async-utils': 'error',
      'testing-library/consistent-data-testid': 'off',
      'testing-library/no-await-sync-events': 'error',
      'testing-library/no-await-sync-queries': 'error',
      'testing-library/no-container': 'off',
      'testing-library/no-debugging-utils': 'error',
      'testing-library/no-dom-import': 'error',
      'testing-library/no-global-regexp-flag-in-query': 'error',
      'testing-library/no-manual-cleanup': 'error',
      'testing-library/no-node-access': 'off',
      'testing-library/no-promise-in-fire-event': 'error',
      'testing-library/no-render-in-lifecycle': 'error',
      'testing-library/no-unnecessary-act': 'error',
      'testing-library/no-wait-for-multiple-assertions': 'error',
      'testing-library/no-wait-for-side-effects': 'error',
      'testing-library/no-wait-for-snapshot': 'error',
      'testing-library/prefer-explicit-assert': 'error',
      'testing-library/prefer-find-by': 'error',
      'testing-library/prefer-implicit-assert': 'off',
      'testing-library/prefer-presence-queries': 'error',
      'testing-library/prefer-query-by-disappearance': 'error',
      'testing-library/prefer-query-matchers': 'error',
      'testing-library/prefer-screen-queries': 'error',
    },
  },
  {
    files: [
      'config/**/*.js',
      'config/**/*.cjs',
      '*.config.js',
      '*.config.cjs',
      'postcss.config.cjs',
    ],
    languageOptions: {
      globals: {
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
  {
    files: ['e2e/**/*.spec.*', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      'testing-library/prefer-screen-queries': 'off',
      'functional/immutable-data': 'off',
      'functional/no-expression-statements': 'off',
      'functional/no-return-void': 'off',
      ...Object.keys(testingLibrary.rules).reduce((acc, rule) => {
        acc[`testing-library/${rule}`] = 'off';
        return acc;
      }, {}),
    },
  },
  {
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-conditional-in-test': 'off',
    },
  },
];

export default eslint;

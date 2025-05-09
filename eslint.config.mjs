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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const eslint = [
  {
    ignores: [
      'src/test/**/*',
      'src/pages/status.page.tsx',
      'src/pages/sandbox/**/*',
      'src/pages/api/auth/next-auth.d.ts',
      'src/libs/api/generated/open-api.ts',
      'newrelic.js',
    ],
  },
  ...compat.extends(
    'next',
    'prettier',
    'plugin:jest/recommended',
    'eslint:recommended',
    'plugin:jest-formatting/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jest-dom/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:storybook/recommended'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      'simple-import-sort': simpleImportSort,
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
      'jsx-a11y': jsxA11Y,
      functional,
    },

    languageOptions: {
      globals: {
        React: true,
        NodeJS: true,
      },

      parser: tsParser,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ecmaVersion: 5,
      sourceType: 'script',

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
            [
              '^@emotion',
              '^react',
              '^@testing',
              '^@mantine',
              'next/router',
              '^msw',
            ],
            ['^@/'],
            ['^[^.]'],
            ['^\\.'],
          ],
        },
      ],

      'simple-import-sort/exports': 'error',
      'import/no-cycle': 'error',
    },
  },
  {
    files: ['**/*.spec.*'],

    rules: {
      '@next/next/no-document-import-in-page': 'off',
      '@next/next/no-head-element': 'off',
      '@next/next/no-server-import-in-page': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'functional/immutable-data': 'off',
      'functional/no-expression-statement': 'off',
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
      'testing-library/prefer-user-event': 'error',
      'testing-library/render-result-naming-convention': 'error',
    },
  },
];

export default eslint;

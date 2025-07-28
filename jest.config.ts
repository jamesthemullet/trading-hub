import type { Config } from 'jest';

const config: Config = {
  testEnvironment: '<rootDir>src/test/helpers/jsdom-extended.js',
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
  coverageProvider: 'babel',
  setupFiles: ['./jest.polyfills.js'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  coverageReporters: ['html', 'text', 'json-summary', 'lcov'],
  reporters: ['default', 'jest-junit'],
  collectCoverageFrom: [
    '**/*.{js,jsx,tsx,ts}',
    '!**/generated/*.{js,jsx,tsx,ts}',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/constants.{js,ts}',
    '!**/*.styles.{js,ts,tsx}',
    '!**/node_modules/**',
    '!**/e2e/**',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/.next',
    '/node_modules/',
    'coverage',
    '/config/',
    'test',
    'e2e',
    'playwright-report',
    '/\\.storybook/',
    '^.*\\.stories\\.[jt]sx?$',
  ],
  moduleNameMapper: {
    '^.+\\.(css|less)$': '<rootDir>/config/css-stub.js',
    '^.+\\.(yml|yaml)$': '<rootDir>/config/css-stub.js',
    '@/(.*)': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  modulePathIgnorePatterns: ['<rootDir>/e2e'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
        jsc: {
          target: 'es2022',
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
  },
  transformIgnorePatterns: [],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },

  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};

export default config;

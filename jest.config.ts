import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
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
  coverageReporters: ['html', 'text', 'json-summary'],
  reporters: ['default', 'jest-junit'],
  collectCoverageFrom: [
    '**/*.{js,jsx,tsx,ts}',
    '!**/generated/*.{js,jsx,tsx,ts}',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
    '!**/constants.{js,ts}',
    '!**/*.styles.{js,ts,tsx}',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/.next',
    '/node_modules/',
    'coverage',
    'test',
  ],
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
      },
    ],
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
};

export default config;

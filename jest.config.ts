import type { Config } from 'jest';

const config: Config = {
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
  coverageReporters: ['html', 'text', 'json-summary'],
  reporters: ['default'],
  collectCoverageFrom: [
    '**/*.{js,jsx,tsx,ts}',
    '!**/generated/*.{js,jsx,tsx,ts}',
    '!**/*.d.ts',
    '!**/*.config.{js,ts}',
  ],
  coveragePathIgnorePatterns: ['<rootDir>/.next', '/node_modules/', 'coverage', 'test'],
  testEnvironment: 'jsdom',
};

export default config;

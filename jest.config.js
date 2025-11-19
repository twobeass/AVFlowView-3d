export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    '^(.*/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js', '**/__tests__/**/*.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/main.js', '!src/**/*.test.js'],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
  coverageDirectory: 'coverage',
  verbose: true,
};

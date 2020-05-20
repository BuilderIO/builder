module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.[t|j]sx?$': 'babel-jest',
    '\\.liquid$': 'jest-raw-loader',
  },
  watchPathIgnorePatterns: ['json'],
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**',
    'react/**',
    '!js/index.ts',
    '!js/index.js',
    '!js/index.js.map',
    '!**/node_modules/**',
    '!src/types.d.ts',
    '!react/interfaces/**',
  ],
};

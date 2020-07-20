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
      lines: 80,
      statements: 85,
    },
  },
  moduleDirectories: ['<rootDir>/node_modules', '<rootDir>/../react/node_modules'],
  collectCoverage: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
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

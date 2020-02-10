module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    "^.+\\.[t|j]sx?$": "babel-jest",
    '\\.liquid$': 'jest-raw-loader',
  },
  watchPathIgnorePatterns: ['json'],
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  collectCoverage: true,
};

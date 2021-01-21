module.exports = {
  roots: ['<rootDir>'],
  automock: false,
  testRegex: '.*\\.(test|spec).(ts|tsx|js)$',
  coverageDirectory: 'coverage/',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'jsdom',
  coverageDirectory: 'coverage/',
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  collectCoverageFrom: ['src/**'],
};

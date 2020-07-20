module.exports = {
  roots: ['<rootDir>'],
  testRegex: '.*\\.(test|spec).(ts|tsx|js)$',
  coverageDirectory: 'coverage/',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', '.map'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupEnzyme.ts'],
  coverageDirectory: 'coverage/',
  collectCoverageFrom: ['src/**/{!(plugin),}.tsx'],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};

/* eslint-disable quote-props, quotes */

module.exports = {
	coverageDirectory: 'coverageNative',
	preset: 'react-native',
	rootDir: '../',
	collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts'
	],
	setupFiles: [
		'<rootDir>/config/initTest.js',
	],
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
		'<rootDir>/src/**/?(*.)(spec|test).{js,jsx,ts,tsx}'
	],
	browser: false,
	// testEnvironment: 'ios',
	transform: {
		// '^.+\\.(js|jsx)$': 'babel-jest',
		// '^.+\\.css$': '<rootDir>/config/jest/cssTransform.js',
		// '^(?!.*\\.(js|jsx|css|json)$)': '<rootDir>/config/jest/fileTransform.js'
	},
	// transformIgnorePatterns: [], // the array has to be here (no idea why, but it breaks if its gone)
	moduleFileExtensions: [
		'ios.js',
		'android.js',
		'js',
		'json',
		'jsx',
		'node'
	],
};

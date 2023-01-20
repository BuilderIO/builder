/**
 * We need to have a `.jsx` entry point for our SolidJS SDK. To avoid enforcing this to all other frameworks,
 * we add this file and use it to re-export the index.js file from the Mitosis-generated code.
 */
export * from './src/index.js';

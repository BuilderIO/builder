/**
 * These helpers are used by every SDK's build pipeline to properly configure their respective
 * bundlers.
 */

/**
 * @typedef {import('vite').Plugin} VitePlugin
 * @typedef {import('esbuild').Plugin} EsBuildPlugin
 */

/**
 * This isn't a constant to make sure that whatever is calling this code has enough time
 * to set the `SDK_ENV` environment variable.
 */
const getSdkEnv = () => process.env.SDK_ENV;

const getFolderName = () => {
  switch (getSdkEnv()) {
    case 'node':
      return 'node-runtime';
    case 'edge':
      return 'edge-runtime';
    case 'browser':
      return 'browser-runtime';
    default:
      throw new Error(
        `Unknown SDK_ENV: ${getSdkEnv()}. Expected one of 'node', 'edge', 'browser'.`
      );
  }
};

/**
 * @typedef {{
 *   pointTo: 'output' | 'input' | 'full-input';
 *   format: 'ts' | 'js';
 * }} Options
 */

/**
 * @param {Partial<Options>} options
 */
const getEvaluatorPathAlias = (options = {}) => {
  const pointTo = options.pointTo || 'input';
  const format = options.format || 'ts';

  const buildPath = () => {
    const folder = getFolderName();
    const fileName = `${folder}/index.${format}`;

    switch (pointTo) {
      case 'output':
        return `./${getSdkEnv()}/functions/evaluate/${fileName}`;

      case 'input':
        return `./${fileName}`;

      case 'full-input':
        return `./src/functions/evaluate/${fileName}`;

      default:
        throw new Error(`Unknown pointTo: ${pointTo}`);
    }
  };

  return {
    'placeholder-runtime': buildPath(),
  };
};

const getSdkOutputPath = () => {
  switch (getSdkEnv()) {
    case 'node':
    case 'edge':
    case 'browser':
      return ['lib', getSdkEnv()].join('/');
    default:
      throw new Error(`Unknown SDK_ENV: ${getSdkEnv()}`);
  }
};

/**
 * Based on the current SDK_ENV, sets the build `outDir` to the correct subfolder, and the path
 * `alias` to point to the correct evaluator for that runtime.
 *
 * @param {Partial<Options>} options
 * @returns {VitePlugin}
 */
const viteOutputGenerator = (options = {}) => ({
  name: 'output-generator',
  enforce: 'pre',
  config: () => ({
    resolve: {
      alias: getEvaluatorPathAlias(options),
    },
    build: {
      outDir: getSdkOutputPath(),
    },
  }),
});

/**
 *
 * @param {Partial<Options>} options
 */
const esbuildOutputGenerator = (options = {}) => {
  /**
   * @type {EsBuildPlugin}
   */
  const plugin = {
    name: 'output-generator',
    setup(build) {
      build.initialOptions.alias = getEvaluatorPathAlias(options);
      build.initialOptions.outdir = getSdkOutputPath();
    },
  };
  return plugin;
};

module.exports = {
  getEvaluatorPathAlias,
  getSdkOutputPath,
  viteOutputGenerator,
  esbuildOutputGenerator,
};

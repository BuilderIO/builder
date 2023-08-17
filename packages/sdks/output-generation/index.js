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
      return 'non-node-runtime';
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
 *  pointTo: 'output' | 'input' | 'full-input',
 *  format: 'ts' | 'js'
 * }} options
 */

/**
 *
 * @param {Partial<options>} options
 * @returns
 */
export const getEvaluatorPathAlias = (options = {}) => {
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
    'placeholder-runtime': buildPath(pointTo, format),
  };
};

export const getSdkOutputPath = () => {
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
 * @param {Partial<options>} options
 * @returns {import('vite').UserConfig}
 */
export const outputGenerator = (options = {}) => {
  /**
   * @type {import('vite').Plugin}
   */
  const plugin = {
    config: () => ({
      resolve: {
        alias: getEvaluatorPathAlias(options),
      },
      build: {
        outDir: getSdkOutputPath(),
      },
    }),
  };
  return plugin;
};

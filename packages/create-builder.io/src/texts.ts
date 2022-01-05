import { IS_YARN } from './utils';

export const CMD = IS_YARN ? 'yarn' : 'npm';
export const INSTALL = IS_YARN ? 'yarn' : 'npm install';
export const BUILD = IS_YARN ? 'yarn build' : 'npm run build';
export const START = IS_YARN ? 'yarn start' : 'npm start';
export const TEST = IS_YARN ? 'yarn test' : 'npm test';

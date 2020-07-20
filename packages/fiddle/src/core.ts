// Maybe don't include for lite version
import './polyfills/custom-element-es5-adapter.js';
import { version } from '../package.json';
import './elements';

export const VERSION = version;

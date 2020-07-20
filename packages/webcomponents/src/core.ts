// Maybe don't include for lite version
// TODO: make an es6 build without this below
// and load that for supported browsers in make-unpkg-dist.ts
// for best performance in modern browsers
import './polyfills/custom-element-es5-adapter.js';
import './polyfills/custom-event-polyfill.js';
import { builder, Builder } from '@builder.io/react';
import { version } from '../package.json';
import './elements';

export const VERSION = version;

// TODO: export version
export { builder, Builder };

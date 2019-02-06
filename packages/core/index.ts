// import 'promise-polyfill/src/polyfill';
// import 'promis';
// import { Promise } from './src/classes/promise.class';

import {
  Builder,
  BuilderComponent,
  isBrowser,
  Input,
  Component,
  GetContentOptions,
} from './src/builder.class';
export { Builder, BuilderComponent, isBrowser, Input, Component, GetContentOptions };

export { BehaviorSubject, Subscription } from './src/classes/observable.class';

export const builder = new Builder();

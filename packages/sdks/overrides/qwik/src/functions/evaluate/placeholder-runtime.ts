import { isServer } from '@builder.io/qwik/build';
import { isEdgeRuntime } from '../is-edge-runtime.js';
import { evaluator as edge } from './edge-runtime/index.js';
import { evaluator as node } from './node-runtime/index.js';
import { evaluator as browser } from './browser-runtime/index.js';

console.log('inside placeholder-runtime.ts');

export const evaluator = isServer ? (isEdgeRuntime() ? edge : node) : browser;

console.log('chose runtime');

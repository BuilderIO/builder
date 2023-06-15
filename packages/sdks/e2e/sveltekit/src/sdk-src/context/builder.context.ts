import { writable } from 'svelte/store';
import type { BuilderContextInterface } from './types';

const key = Symbol();

const builderStore = writable<BuilderContextInterface>({
  content: null,
  context: {},
  localState: undefined,
  rootSetState() {},
  rootState: {},
  apiKey: null,
  apiVersion: undefined,
  registeredComponents: {},
  inheritedStyles: {},
});

export type BuilderStore = typeof builderStore;

export default {
  Builder: builderStore,
  key,
};

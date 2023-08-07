const key = Symbol();
import { writable } from "svelte/store";

export default {
  Builder: writable({
    content: null,
    context: {},
    localState: undefined,
    rootSetState() {},
    rootState: {},
    apiKey: null,
    apiVersion: undefined,
    componentInfos: {},
    inheritedStyles: {},
  }),
  key,
};

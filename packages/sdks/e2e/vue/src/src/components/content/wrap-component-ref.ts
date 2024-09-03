import { markRaw } from 'vue';

/**
 * Wrap a component ref to prevent it from being observed by Vue.
 * This reduces overhead and improves performance.
 */
export const wrapComponentRef = markRaw;

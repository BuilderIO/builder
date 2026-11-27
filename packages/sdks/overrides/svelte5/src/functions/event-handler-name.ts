/**
 * Svelte 5 event handlers are plain attributes (`onclick`), so block actions spread straight onto
 * elements and into `attributes`, no `on:` directive or `use:` action needed.
 */
export const getEventHandlerName = (key: string) => `on${key.toLowerCase()}`;

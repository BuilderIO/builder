type Target = import('../types/targets.js').Target;

/**
 * The Svelte 5 SDK shares every target branch with the Svelte 4 SDK (A/B test hydration strategy,
 * personalization scripts, class/style prop names…), so it identifies as `svelte`.
 */
export const TARGET = 'svelte' as Target;

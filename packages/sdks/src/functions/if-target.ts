export type Target = 'vue' | 'reactNative' | 'svelte' | 'react' | 'solid';

// TODO: babel compile to include certain code only if the target matches
export function ifTarget(target: Target | Target[], doThing: () => any, elseThing?: () => any) {
  return doThing();
}

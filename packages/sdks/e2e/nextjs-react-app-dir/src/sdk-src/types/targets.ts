type MitosisTargets = import('@builder.io/mitosis').Target;

export type Target = Extract<
  MitosisTargets,
  'vue3' | 'vue2' | 'reactNative' | 'svelte' | 'qwik' | 'react' | 'solid'
>;

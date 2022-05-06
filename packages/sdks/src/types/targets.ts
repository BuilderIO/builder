type MitosisTargets = import('@builder.io/mitosis').Target;

export type Target = Extract<MitosisTargets, 'vue' | 'reactNative' | 'svelte'>;

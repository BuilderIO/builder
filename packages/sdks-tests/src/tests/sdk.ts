import { z } from 'zod';

export const SdkEnum = z.enum([
  'oldReact',
  'reactNative',
  'react',
  'rsc',
  'vue',
  'solid',
  'qwik',
  'svelte',
]);
export type Sdk = z.infer<typeof SdkEnum>;

export const sdk = SdkEnum.parse(process.env.SDK);

export type PackageName =
  | 'e2e-react-native'
  | 'e2e-solidjs'
  | 'e2e-qwik'
  | 'e2e-qwik-city'
  | 'e2e-nextjs-react'
  | 'e2e-react'
  | 'e2e-vue2'
  | 'e2e-vue3'
  | 'e2e-svelte'
  | 'e2e-sveltekit'
  | 'e2e-old-react'
  | 'e2e-old-nextjs';

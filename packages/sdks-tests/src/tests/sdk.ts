import { z } from 'zod';

const SdkEnum = z.enum([
  'oldReact',
  'qwik',
  'react',
  'reactNative',
  'rsc',
  'solid',
  'svelte',
  'vue2',
  'vue3',
  /**
   * Run all tests, including old React SDK.
   */
  'all',
  /**
   * Run all tests except for old React SDK.
   */
  'allNew',
]);
export type Sdk = z.infer<typeof SdkEnum>;

export const sdk = SdkEnum.parse(process.env.SDK);

export type PackageName =
  | 'react-native'
  | 'solidjs'
  | 'solid-start'
  | 'qwik-city'
  | 'nextjs-react'
  | 'nextjs-app-dir-client-react'
  | 'nextjs-app-dir-rsc'
  | 'react'
  | 'vue2'
  | 'vue3'
  | 'vue-nuxt3'
  | 'vue-nuxt2'
  | 'svelte'
  | 'sveltekit'
  | 'gen1-react'
  | 'gen1-remix'
  | 'gen1-nextjs';

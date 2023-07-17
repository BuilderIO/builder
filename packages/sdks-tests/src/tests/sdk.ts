import { z } from 'zod';

export const SdkEnum = z.enum([
  'oldReact',
  'qwik',
  'react',
  'reactNative',
  'rsc',
  'solid',
  'svelte',
  'vue',
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
  | 'e2e-react-native'
  | 'e2e-solidjs'
  | 'e2e-solid-start'
  | 'e2e-qwik-city'
  | 'e2e-nextjs-react'
  | 'e2e-nextjs-app-dir-client-react'
  | 'e2e-react'
  | 'e2e-vue2'
  | 'e2e-vue3'
  | 'e2e-vue-nuxt3'
  | 'e2e-vue-nuxt2'
  | 'e2e-svelte'
  | 'e2e-sveltekit'
  | 'e2e-old-react'
  | 'e2e-old-react-remix'
  | 'e2e-old-nextjs';

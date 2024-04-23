import { z } from 'zod';

const SdkEnum = z.enum([
  'oldReact',
  'qwik',
  'react',
  'reactNative',
  'rsc',
  'solid',
  'svelte',
  'vue',
  'angular',
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
  | 'solid'
  | 'solid-start'
  | 'qwik-city'
  | 'next-pages-dir'
  | 'next-app-dir-client'
  | 'next-app-dir'
  | 'react'
  | 'vue'
  | 'nuxt'
  | 'svelte'
  | 'sveltekit'
  | 'angular'
  | 'gen1-react'
  | 'gen1-remix'
  | 'gen1-next';

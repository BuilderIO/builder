import { z } from 'zod';

export type Sdk =
  | 'oldReact'
  | 'qwik'
  | 'react'
  | 'reactNative'
  | 'rsc'
  | 'solid'
  | 'svelte'
  | 'vue'
  | 'angular';

const ServerNameEnum = z.enum([
  'react-native',
  'solid',
  'solid-start',
  'qwik-city',
  'next-pages-dir',
  'react',
  'remix',
  'hydrogen',
  'next-app-dir-client',
  'next-app-dir',
  'vue',
  'nuxt',
  'svelte',
  'sveltekit',
  'angular',
  'angular-ssr',
  'gen1-react',
  'gen1-remix',
  'gen1-next',
]);
export type ServerName = z.infer<typeof ServerNameEnum>;

export const serverNames =
  process.env.SERVER_NAME?.split(',').map(str => ServerNameEnum.parse(str)) ?? [];

if (serverNames.length === 0) {
  throw new Error(
    'SERVER_NAME is required. Please provide a comma-separated list of server names to run.'
  );
}

/**
 * Map of server names to SDKs.
 */
export const SDK_MAP: Record<ServerName, Sdk> = {
  'react-native': 'reactNative',
  solid: 'solid',
  'solid-start': 'solid',
  'qwik-city': 'qwik',
  'next-pages-dir': 'react',
  react: 'react',
  remix: 'react',
  hydrogen: 'react',
  'next-app-dir-client': 'react',
  vue: 'vue',
  nuxt: 'vue',
  svelte: 'svelte',
  sveltekit: 'svelte',
  'next-app-dir': 'rsc',
  'gen1-react': 'oldReact',
  'gen1-next': 'oldReact',
  'gen1-remix': 'oldReact',
  angular: 'angular',
  'angular-ssr': 'angular',
};

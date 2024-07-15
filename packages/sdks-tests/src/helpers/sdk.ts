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

const serverNameEnumValues = [
  'react-native',
  'solid',
  'solid-start',
  'qwik-city',
  'react-sdk-next-pages',
  'react',
  'remix',
  'hydrogen',
  'react-sdk-next-app',
  'nextjs-sdk-next-app',
  'vue',
  'nuxt',
  'svelte',
  'sveltekit',
  'angular',
  'angular-ssr',
  'gen1-react',
  'gen1-remix',
  'gen1-next',
] as const;
const ServerNameEnum = z.enum(serverNameEnumValues);
export type ServerName = z.infer<typeof ServerNameEnum>;

const envServerName = !process.env.SERVER_NAME
  ? []
  : process.env.SERVER_NAME === 'all'
    ? serverNameEnumValues
    : process.env.SERVER_NAME.split(',');

export const serverNames = envServerName.map(str => ServerNameEnum.parse(str)) ?? [];

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
  'react-sdk-next-pages': 'react',
  react: 'react',
  remix: 'react',
  hydrogen: 'react',
  'react-sdk-next-app': 'react',
  vue: 'vue',
  nuxt: 'vue',
  svelte: 'svelte',
  sveltekit: 'svelte',
  'nextjs-sdk-next-app': 'rsc',
  'gen1-react': 'oldReact',
  'gen1-next': 'oldReact',
  'gen1-remix': 'oldReact',
  angular: 'angular',
  'angular-ssr': 'angular',
};

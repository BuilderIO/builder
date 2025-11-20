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
  'react-native-74',
  'react-native-76-fabric',
  'solid',
  'solid-start',
  'qwik-city',
  'react-sdk-next-pages',
  'react',
  'remix',
  'hydrogen',
  'react-sdk-next-14-app',
  'react-sdk-next-15-app',
  'nextjs-sdk-next-app',
  'vue',
  'nuxt',
  'svelte',
  'sveltekit',
  'angular-17',
  'angular-17-ssr',
  'angular-19-ssr',
  'angular-20-ssr',
  'gen1-react',
  'gen1-remix',
  'gen1-next14-pages',
  'gen1-next15-app',
] as const;
const ServerNameEnum = z.enum(serverNameEnumValues);
export type ServerName = z.infer<typeof ServerNameEnum>;

const PROCESS_SERVER_NAME = typeof process !== 'undefined' ? process.env.SERVER_NAME : undefined;
const envServerName = !PROCESS_SERVER_NAME
  ? []
  : PROCESS_SERVER_NAME === 'all'
    ? serverNameEnumValues
    : PROCESS_SERVER_NAME.split(',');

export const serverNames = envServerName.map(str => ServerNameEnum.parse(str)) ?? [];

export type Generation = 'gen1' | 'gen2';

/**
 * Map of server names to SDKs.
 */
export const SDK_MAP: Record<ServerName, { sdk: Sdk; gen: Generation }> = {
  'react-native-74': { sdk: 'reactNative', gen: 'gen2' },
  'react-native-76-fabric': { sdk: 'reactNative', gen: 'gen2' },
  solid: { sdk: 'solid', gen: 'gen2' },
  'solid-start': { sdk: 'solid', gen: 'gen2' },
  'qwik-city': { sdk: 'qwik', gen: 'gen2' },
  'react-sdk-next-pages': { sdk: 'react', gen: 'gen2' },
  react: { sdk: 'react', gen: 'gen2' },
  remix: { sdk: 'react', gen: 'gen2' },
  hydrogen: { sdk: 'react', gen: 'gen2' },
  'react-sdk-next-14-app': { sdk: 'react', gen: 'gen2' },
  'react-sdk-next-15-app': { sdk: 'react', gen: 'gen2' },
  vue: { sdk: 'vue', gen: 'gen2' },
  nuxt: { sdk: 'vue', gen: 'gen2' },
  svelte: { sdk: 'svelte', gen: 'gen2' },
  sveltekit: { sdk: 'svelte', gen: 'gen2' },
  'nextjs-sdk-next-app': { sdk: 'rsc', gen: 'gen2' },
  'gen1-react': { sdk: 'oldReact', gen: 'gen1' },
  'gen1-next14-pages': { sdk: 'oldReact', gen: 'gen1' },
  'gen1-next15-app': { sdk: 'oldReact', gen: 'gen1' },
  'gen1-remix': { sdk: 'oldReact', gen: 'gen1' },
  'angular-17': { sdk: 'angular', gen: 'gen2' },
  'angular-17-ssr': { sdk: 'angular', gen: 'gen2' },
  'angular-19-ssr': { sdk: 'angular', gen: 'gen2' },
  'angular-20-ssr': { sdk: 'angular', gen: 'gen2' },
};

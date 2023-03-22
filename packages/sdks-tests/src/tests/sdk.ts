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
]);
export type Sdk = z.infer<typeof SdkEnum>;

export const sdk = SdkEnum.parse(process.env.SDK);

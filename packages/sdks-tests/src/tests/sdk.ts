import { z } from 'zod';

export const SdkEnum = z.enum(['reactNative', 'react', 'rsc', 'vue', 'solid', 'qwik', 'svelte']);
export type Sdk = z.infer<typeof SdkEnum>;

export const sdk = SdkEnum.parse(process.env.SDK);

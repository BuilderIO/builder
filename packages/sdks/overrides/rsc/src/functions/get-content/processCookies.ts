import { cookies } from 'next/headers';

import type { BuilderContent } from '../../types/builder-content';
import type { Patch } from '../apply-patch-with-mutation';
import { applyPatchWithMinimalMutationChain } from '../apply-patch-with-mutation';

export const processCookies = (content: BuilderContent) => {
  const cookieStore = cookies();
  const builderPatches = cookieStore
    .getAll()
    .filter((x) => x.name.startsWith('builder.patch.' + content.id + '.'))
    .map((x) => {
      // split into: `builder.patch.${contentId}.${blockId}.${index}`
      const [, , , blockId, index] = x.name.split('.');

      return {
        blockId,
        index: parseInt(index),
        value: x.value,
      };
    })
    .sort((a, b) => a.index - b.index);

  if (!builderPatches.length) return content;

  let newContent = content;
  for (const patchCookie of builderPatches) {
    const { value } = patchCookie;
    try {
      const blockPatches = JSON.parse(value) as Patch[];
      for (const patch of blockPatches) {
        newContent = applyPatchWithMinimalMutationChain(
          newContent,
          patch,
          true
        );
      }
    } catch (e) {
      console.log('error parsing patch cookie', { value });
      console.log('ignoring cookie');
    }
  }

  return newContent;
};

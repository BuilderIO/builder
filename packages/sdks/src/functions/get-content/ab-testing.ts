import type { GetContentOptions } from './types.js';
import type { BuilderContent } from '../../types/builder-content.js';

export const handleABTesting = (
  item: BuilderContent,
  testGroups: NonNullable<GetContentOptions['testGroups']>
) => {
  if (item.variations && Object.keys(item.variations).length) {
    const testGroup = item.id ? testGroups[item.id] : undefined;
    const variationValue = testGroup ? item.variations[testGroup] : undefined;
    if (testGroup && variationValue) {
      item.data = variationValue.data;
      item.testVariationId = variationValue.id;
      item.testVariationName = variationValue.name;
    } else {
      // TODO: a/b test iteration logic
      let n = 0;
      const random = Math.random();
      let set = false;
      for (const id in item.variations) {
        const variation = item.variations[id]!;
        const testRatio = variation.testRatio;
        n += testRatio!;
        if (random < n) {
          const variationName =
            variation.name ||
            (variation.id === item.id ? 'Default variation' : '');
          set = true;
          Object.assign(item, {
            data: variation.data,
            testVariationId: variation.id,
            testVariationName: variationName,
          });
        }
      }
      if (!set) {
        Object.assign(item, {
          testVariationId: item.id,
          testVariationName: 'Default',
        });
      }
    }
  }
};

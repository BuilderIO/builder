import { safeEvaluate } from './mapperEvaluator';
import { executeGet } from './selectionsClient';
import { getMassagedProps } from './dropdownPropsExtractor';

const selectionsCache = new Map();

const orchestrateSelections = async (props: any) => {
  let dropdownsOptions;
  let cacheKey;
  try {
    const { url, mapper } = getMassagedProps(props);
    cacheKey = `${url}-${mapper}`;
    if (selectionsCache.has(cacheKey)) return selectionsCache.get(cacheKey);

    const data = await executeGet(url);
    dropdownsOptions = safeEvaluate(mapper, { data });
  } catch (e) {
    console.error('orchestrateSelections Error: ', e);
  }

  if (!dropdownsOptions) {
    return {};
  }

  if (cacheKey) {
    selectionsCache.set(cacheKey, dropdownsOptions);
  }

  return dropdownsOptions;
};

export { orchestrateSelections };

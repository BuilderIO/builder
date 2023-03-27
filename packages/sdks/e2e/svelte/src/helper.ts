import { getProps } from '@builder.io/sdks-e2e-tests';
import { getCustomComponents } from '@builder.io/sdks-tests-custom-components/output/svelte/src/index';

export const getAllProps = () => ({
  ...getProps(),
  customComponents: getCustomComponents(),
});

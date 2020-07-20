import { BuilderElement } from '@builder.io/sdk';

export const el = (options?: Partial<BuilderElement>, useId?: number): BuilderElement => ({
  '@type': '@builder.io/sdk:Element',
  id: `builder-${useId ? useId : Math.random().toString().split('.')[1]}`,
  ...options,
});

export const block = (
  name: string,
  options?: any,
  elOptions?: Partial<BuilderElement>,
  useId?: number
) =>
  el(
    {
      ...elOptions,
      component: {
        name,
        options,
      },
    },
    useId
  );

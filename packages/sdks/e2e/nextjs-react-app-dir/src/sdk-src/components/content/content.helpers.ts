import type { BuilderRenderState } from '../../context/types.js';
import type { BuilderContent } from '../../types/builder-content.js';
import type { Nullable } from '../../types/typescript.js';
import type { ContentProps } from './content.types.js';
export const getContextStateInitialValue = ({
  content,
  data,
  locale
}: Pick<ContentProps, 'content' | 'data' | 'locale'>) => {
  const defaultValues: BuilderRenderState = {};

  // set default values for content state inputs
  content?.data?.inputs?.forEach(input => {
    if (input.name && input.defaultValue !== undefined && content?.data?.state && content.data.state[input.name] === undefined) {
      defaultValues[input.name] = input.defaultValue;
    }
  });
  const stateToUse: BuilderRenderState = {
    ...content?.data?.state,
    ...data,
    ...(locale ? {
      locale
    } : {})
  };
  return {
    ...defaultValues,
    ...stateToUse
  };
};
export const getContentInitialValue = ({
  content,
  data
}: Pick<ContentProps, 'content' | 'data'>): Nullable<BuilderContent> => {
  return !content ? undefined : {
    ...content,
    data: {
      ...content?.data,
      ...data
    },
    meta: content?.meta
  };
}
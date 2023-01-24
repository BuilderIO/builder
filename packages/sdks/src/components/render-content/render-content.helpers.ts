import { BuilderRenderState } from '../../context/types';
import { RenderContentProps } from './render-content.types';

export const getContextStateInitialValue = ({
  content,
  data,
  locale,
}: Pick<RenderContentProps, 'content' | 'data' | 'locale'>) => {
  const stateToUse: BuilderRenderState = {
    ...content?.data?.state,
    ...data,
    ...(locale ? { locale: locale } : {}),
  };

  // set default values for content state inputs
  content?.data?.inputs?.forEach((input) => {
    if (
      input.name &&
      input.defaultValue !== undefined &&
      content?.data?.state &&
      content.data.state[input.name] === undefined
    ) {
      stateToUse[input.name] = input.defaultValue;
    }
  });

  return stateToUse;
};

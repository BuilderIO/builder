import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponents,
} from '../../../../context/types';
import { getBlockProperties } from '../../../../functions/get-block-properties';
import type { BuilderBlock } from '../../../../types/builder-block';
import type { PropsWithBuilderData } from '../../../../types/builder-props';
import type { InteractiveElementProps } from '../interactive-element/interactive-element.helpers';

type ComponentOptions = PropsWithBuilderData<{
  [index: string]: any;
  attributes?: {
    [index: string]: any;
  };
}>;

export interface ComponentProps {
  componentRef: any;
  componentOptions: ComponentOptions;
  blockChildren: BuilderBlock[];
  context: Signal<BuilderContextInterface>;
  registeredComponents: RegisteredComponents;
  builderBlock: BuilderBlock;
  includeBlockProps: boolean;
  isRSC: boolean | undefined;
}

export const getWrapperProps = ({
  componentOptions,
  builderBlock,
  context,
  componentRef,
  includeBlockProps,
  isRSC,
  contextValue,
}: Omit<ComponentProps, 'blockChildren' | 'registeredComponents'> & {
  contextValue: BuilderContextInterface;
}) => {
  const blockWrapperProps: InteractiveElementProps = {
    Wrapper: componentRef,
    block: builderBlock,
    context,
    wrapperProps: componentOptions,
    shouldNestAttributes: true,
  };

  return isRSC
    ? {
        ...componentOptions,
        /**
         * If `noWrap` is set to `true`, then the block's props/attributes are provided to the
         * component itself directly. Otherwise, they are provided to the wrapper element.
         */
        ...(includeBlockProps
          ? {
              attributes: getBlockProperties({
                block: builderBlock,
                context: contextValue,
              }),
            }
          : {}),
      }
    : blockWrapperProps;
};

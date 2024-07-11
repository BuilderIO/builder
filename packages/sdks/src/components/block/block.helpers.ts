import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { evaluate } from '../../functions/evaluate/index.js';
import { extractTextStyles } from '../../functions/extract-text-styles.js';
import { getProcessedBlock } from '../../functions/get-processed-block.js';
import { getStyle } from '../../functions/get-style.js';
import type { ComponentInfo } from '../../server-index.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { RepeatData } from './types.js';

export const getComponent = ({
  block,
  context,
  registeredComponents,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
  registeredComponents: RegisteredComponents;
}) => {
  const componentName = getProcessedBlock({
    block,
    localState: context.localState,
    rootState: context.rootState,
    rootSetState: context.rootSetState,
    context: context.context,
    shouldEvaluateBindings: false,
  }).component?.name;

  if (!componentName) {
    return null;
  }

  const ref = registeredComponents[componentName];

  if (!ref) {
    // TODO: Public doc page with more info about this message
    console.warn(`
      Could not find a registered component named "${componentName}". 
      If you registered it, is the file that registered it imported by the file that needs to render it?`);
    return undefined;
  } else {
    return ref;
  }
};

export const getRepeatItemData = ({
  block,
  context,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
}): RepeatData[] | undefined => {
  /**
   * we don't use `state.processedBlock` here because the processing done within its logic includes evaluating the block's bindings,
   * which will not work if there is a repeat.
   */
  const { repeat, ...blockWithoutRepeat } = block;

  if (!repeat?.collection) {
    return undefined;
  }

  const itemsArray = evaluate({
    code: repeat.collection,
    localState: context.localState,
    rootState: context.rootState,
    rootSetState: context.rootSetState,
    context: context.context,
    enableCache: true,
  });

  if (!Array.isArray(itemsArray)) {
    return undefined;
  }

  const collectionName = repeat.collection.split('.').pop();
  const itemNameToUse =
    repeat.itemName || (collectionName ? collectionName + 'Item' : 'item');

  const repeatArray = itemsArray.map<RepeatData>((item, index) => ({
    context: {
      ...context,
      localState: {
        ...context.localState,
        $index: index,
        $item: item,
        [itemNameToUse]: item,
        [`$${itemNameToUse}Index`]: index,
      },
    },
    block: blockWithoutRepeat,
  }));

  return repeatArray;
};

export const getInheritedStyles = ({
  block,
  context,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
}) => {
  const style = getStyle({ block, context });
  if (!style) {
    return {};
  }
  return extractTextStyles(style);
};

const applyDefaults = (
  shouldReceiveBuilderProps: ComponentInfo['shouldReceiveBuilderProps']
) => {
  return {
    // once we bump to a major version, toggle this to `false`.
    builderBlock: true,
    // once we bump to a major version, toggle this to `false`.
    builderContext: true,
    builderComponents: false,
    builderLinkComponent: false,
    ...shouldReceiveBuilderProps,
  };
};

export const provideLinkComponent = (
  block: RegisteredComponent | null | undefined,
  linkComponent: any
) => {
  if (!block) return {};

  const shouldReceiveProp = applyDefaults(
    block.shouldReceiveBuilderProps
  ).builderLinkComponent;

  if (!shouldReceiveProp) return {};

  return { builderLinkComponent: linkComponent };
};

export const provideRegisteredComponents = (
  block: RegisteredComponent | null | undefined,
  registeredComponents: RegisteredComponents
) => {
  if (!block) return {};

  const shouldReceiveProp = applyDefaults(
    block.shouldReceiveBuilderProps
  ).builderComponents;

  if (!shouldReceiveProp) return {};

  return { builderComponents: registeredComponents };
};

export const provideBuilderBlock = (
  block: RegisteredComponent | null | undefined,
  builderBlock: BuilderBlock
) => {
  if (!block) return {};

  const shouldReceiveProp = applyDefaults(
    block.shouldReceiveBuilderProps
  ).builderBlock;

  if (!shouldReceiveProp) return {};

  return { builderBlock };
};

export const provideBuilderContext = (
  block: RegisteredComponent | null | undefined,
  context: Signal<BuilderContextInterface>
) => {
  if (!block) return {};

  const shouldReceiveProp = applyDefaults(
    block.shouldReceiveBuilderProps
  ).builderContext;

  if (!shouldReceiveProp) return {};

  return { builderContext: context };
};

import type { Signal } from '@builder.io/mitosis';
import type {
  BuilderContextInterface,
  RegisteredComponent,
  RegisteredComponents,
} from '../../context/types.js';
import { evaluate } from '../../functions/evaluate/index.js';
import { extractTextStyles } from '../../functions/extract-text-styles.js';
import { getStyle } from '../../functions/get-style.js';
import type { BuilderBlock } from '../../types/builder-block.js';
import type { RepeatData } from './types.js';

export const getComponent = ({
  block,
  registeredComponents,
}: {
  block: BuilderBlock;
  registeredComponents: RegisteredComponents;
}) => {
  const componentName = block.component?.name;

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

export const provideLinkComponent = (
  block: RegisteredComponent | null | undefined,
  linkComponent: any
) => {
  if (block?.shouldReceiveBuilderProps?.builderLinkComponent)
    return { builderLinkComponent: linkComponent };

  return {};
};

export const provideRegisteredComponents = (
  block: RegisteredComponent | null | undefined,
  registeredComponents: RegisteredComponents
) => {
  if (block?.shouldReceiveBuilderProps?.builderComponents)
    return { builderComponents: registeredComponents };

  return {};
};

export const provideBuilderBlock = (
  block: RegisteredComponent | null | undefined,
  builderBlock: BuilderBlock
) => {
  if (block?.shouldReceiveBuilderProps?.builderBlock) return { builderBlock };

  return {};
};

export const provideBuilderContext = (
  block: RegisteredComponent | null | undefined,
  context: Signal<BuilderContextInterface>
) => {
  if (block?.shouldReceiveBuilderProps?.builderContext)
    return { builderContext: context };

  return {};
};

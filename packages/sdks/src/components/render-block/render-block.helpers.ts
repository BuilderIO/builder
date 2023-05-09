import type {
  BuilderContextInterface,
  BuilderRenderState,
} from '../../context/types';
import { evaluate } from '../../functions/evaluate';
import { getProcessedBlock } from '../../functions/get-processed-block';
import type { BuilderBlock } from '../../types/builder-block';
import type { RepeatData } from './types';

/**
 * https://developer.mozilla.org/en-US/docs/Glossary/Empty_element
 */
const EMPTY_HTML_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export const isEmptyHtmlElement = (tagName: unknown) => {
  return (
    typeof tagName === 'string' &&
    EMPTY_HTML_ELEMENTS.includes(tagName.toLowerCase())
  );
};

export const getComponent = ({
  block,
  context,
}: {
  block: BuilderBlock;
  context: BuilderContextInterface;
}) => {
  const componentName = getProcessedBlock({
    block,
    state: context.state,
    context: context.context,
    shouldEvaluateBindings: false,
  }).component?.name;

  if (!componentName) {
    return null;
  }

  const ref = context.registeredComponents[componentName];

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
   * we don't use `state.useBlock` here because the processing done within its logic includes evaluating the block's bindings,
   * which will not work if there is a repeat.
   */
  const { repeat, ...blockWithoutRepeat } = block;

  if (!repeat?.collection) {
    return undefined;
  }

  const itemsArray = evaluate({
    code: repeat.collection,
    state: context.state,
    context: context.context,
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
      state: {
        ...context.state,
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

export const getProxyState = (
  context: BuilderContextInterface
): BuilderContextInterface['state'] => {
  if (typeof Proxy === 'undefined') {
    console.error(
      'no Proxy available in this environment, cannot proxy state.'
    );
    return context.state;
  }

  const useState = new Proxy(context.state, {
    set: (obj, prop: keyof BuilderRenderState, value) => {
      // set the value on the state object, so that the event handler instantly gets the update.
      obj[prop] = value;

      // set the value in the context, so that the rest of the app gets the update.
      context.setState?.(obj);
      return true;
    },
  });
  return useState;
};

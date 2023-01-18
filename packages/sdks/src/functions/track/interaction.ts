import { track } from '.';
import { TARGET } from '../../constants/target';
import { isBrowser } from '../is-browser';
import { isEditing } from '../is-editing';
import { isPreviewing } from '../is-previewing';

function round(num: number) {
  return Math.round(num * 1000) / 1000;
}
const findParentElement = (
  target: HTMLElement,
  callback: (element: HTMLElement) => boolean,
  checkElement = true
): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  let parent: HTMLElement | null = checkElement ? target : target.parentElement;
  do {
    if (!parent) {
      return null;
    }

    const matches = callback(parent);
    if (matches) {
      return parent;
    }
  } while ((parent = parent.parentElement));

  return null;
};

const findBuilderParent = (target: HTMLElement) =>
  findParentElement(target, (el) => {
    const id = el.getAttribute('builder-id') || el.id;
    return Boolean(id?.indexOf('builder-') === 0);
  });

type Offset = {
  x: number;
  y: number;
};

const computeOffset = ({
  event,
  target,
}: {
  event: MouseEvent;
  target: HTMLElement;
}): Offset => {
  const targetRect = target.getBoundingClientRect();
  const xOffset = event.clientX - targetRect.left;
  const yOffset = event.clientY - targetRect.top;

  const xRatio = round(xOffset / targetRect.width);
  const yRatio = round(yOffset / targetRect.height);

  return {
    x: xRatio,
    y: yRatio,
  };
};

export const getInteractionPropertiesForEvent = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null;
  const targetBuilderElement = target && findBuilderParent(target);
  const builderId =
    targetBuilderElement?.getAttribute('builder-id') ||
    targetBuilderElement?.id;

  return {
    targetBuilderElement: builderId || undefined,
    metadata: {
      targetOffset: target ? computeOffset({ event, target }) : undefined,
      builderTargetOffset: targetBuilderElement
        ? computeOffset({ event, target: targetBuilderElement })
        : undefined,
      builderElementIndex:
        targetBuilderElement && builderId
          ? ([] as Element[]).slice
              .call(document.getElementsByClassName(builderId))
              .indexOf(targetBuilderElement)
          : undefined,
    },
  };
};

export const trackInteraction = ({
  contentId,
  variationId,
  event,
  alreadyTrackedOne = false,
}: {
  contentId: string;
  variationId?: string;
  event: MouseEvent;
  alreadyTrackedOne?: boolean;
}) => {
  if (
    !(isBrowser() || TARGET === 'reactNative') ||
    isPreviewing() ||
    isEditing()
  ) {
    return;
  }

  const { metadata, targetBuilderElement } =
    getInteractionPropertiesForEvent(event);

  track({
    type: 'click',
    apiKey: '//TO-DO: Add your API key here',
    contentId,
    metadata,
    variationId: variationId !== contentId ? variationId : undefined,
    unique: !alreadyTrackedOne,
    targetBuilderElement,
  });
};
